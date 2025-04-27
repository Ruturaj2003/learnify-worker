const { PDFDocument } = require("pdf-lib");
const pdfParse = require("pdf-parse");

module.exports = async function extractPages(pdfBuffer) {
  console.log("[PAGES] Starting PDF processing...");

  let pdfDoc;
  try {
    pdfDoc = await PDFDocument.load(pdfBuffer);
    // console.log('[PAGES] PDF loaded successfully.');
  } catch (err) {
    console.error("[ERROR ❌] Failed to load PDF:", err.message);
    return { tocPages: [], tocStartPage: null };
  }

  const totalPages = pdfDoc.getPageCount();
  console.log(`[PAGES] Total pages in PDF: ${totalPages}`);

  const pageTexts = [];
  let collecting = false;
  let tocStartPage = null;
  let collectedCount = 0; // Track how many pages collected

  for (let i = 0; i < totalPages; i++) {
    if (collecting && collectedCount >= 17) {
      // console.log('[TOC ⏹️] Reached max of 15 TOC pages. Stopping collection.');
      break;
    }

    try {
      const singlePagePDF = await PDFDocument.create();
      const [copiedPage] = await singlePagePDF.copyPages(pdfDoc, [i]);
      singlePagePDF.addPage(copiedPage);

      const pageBuffer = await singlePagePDF.save();
      const parsed = await pdfParse(pageBuffer);
      const text = parsed.text.trim();

      if (!text) {
        // console.warn(`[PAGE ⚠️] Page ${i + 1} has no text.`);
        continue;
      }

      // Detect start of TOC
      if (!collecting && isTableOfContents(text)) {
        collecting = true;
        tocStartPage = i + 1;
        // console.log(
        //   `[TOC 🧭] Detected Table of Contents starting at page ${tocStartPage}`
        // );
      }

      if (collecting) {
        pageTexts.push(text);
        collectedCount++; // Increment after collecting
        console
          .log
          // `[CHAPTER ✅] Collected TOC data on page ${i + 1}/${totalPages}`
          ();
      }
    } catch (err) {
      console.error(`[ERROR ❌] Failed to process page ${i + 1}:`, err.message);
    }
  }

  if (pageTexts.length === 0) {
    console.warn("[TOC ❌] No Table of Contents pages detected.");
  } else {
    // console.log(`[TOC ✅] Total TOC pages collected: ${pageTexts.length}`);
  }

  return { tocPages: pageTexts, tocStartPage };
};

// TOC detection helper
function isTableOfContents(text) {
  const lower = text.toLowerCase();

  const keywords = [
    "table of contents",
    "contents",
    "brief contents",
    "index",
    "detailed contents",
    "list of chapters",
  ];

  const tocLinePattern = /(^|\n).{0,100}(\.{2,}|\s{2,})\s*\d{1,4}($|\n)/g;
  const tocStyleLines = [...text.matchAll(tocLinePattern)].length;

  return keywords.some((k) => lower.includes(k)) || tocStyleLines >= 3;
}
