const { PDFDocument } = require('pdf-lib');
const pdfParse = require('pdf-parse');

module.exports = async function extractPages(pdfBuffer) {
  console.log('[PAGES] Starting PDF processing...');

  let pdfDoc;
  try {
    pdfDoc = await PDFDocument.load(pdfBuffer);
    console.log('[PAGES] PDF loaded successfully.');
  } catch (err) {
    console.error('[ERROR ❌] Failed to load PDF:', err.message);
    return { tocPages: [], tocStartPage: null };
  }

  const totalPages = pdfDoc.getPageCount();
  console.log(`[PAGES] Total pages in PDF: ${totalPages}`);

  const pageTexts = [];
  let collecting = false;
  let tocStartPage = null;

  for (let i = 0; i < totalPages; i++) {
    try {
      const singlePagePDF = await PDFDocument.create();
      const [copiedPage] = await singlePagePDF.copyPages(pdfDoc, [i]);
      singlePagePDF.addPage(copiedPage);

      const pageBuffer = await singlePagePDF.save();
      const parsed = await pdfParse(pageBuffer);
      const text = parsed.text.trim();

      if (!text) {
        console.warn(`[PAGE ⚠️] Page ${i + 1} has no text.`);
      }

      const looksLikeTOC = isTableOfContents(text);

      if (!collecting && looksLikeTOC) {
        collecting = true;
        tocStartPage = i + 1;
        console.log(
          `[TOC 🧭] Detected Table of Contents starting at page ${tocStartPage}`
        );
      }

      if (collecting) {
        if (looksLikeTOC) {
          pageTexts.push(text);
          console.log(`[TOC ✅] Collected TOC page ${i + 1}/${totalPages}`);
        } else {
          console.log(`[TOC 🛑] TOC ended at page ${i + 1}`);
          break; // stop collecting after ToC ends
        }
      } else {
        console.log(`[PAGES ⏩] Skipped non-TOC page ${i + 1}/${totalPages}`);
      }
    } catch (err) {
      console.error(`[ERROR ❌] Failed to process page ${i + 1}:`, err.message);
    }
  }

  if (pageTexts.length === 0) {
    console.warn('[TOC ❌] No Table of Contents pages detected.');
  } else {
    console.log(`[TOC ✅] Total TOC pages collected: ${pageTexts.length}`);
  }

  return { tocPages: pageTexts, tocStartPage };
};

// 🔍 Improved ToC detection for both dotted and non-dotted styles
function isTableOfContents(text) {
  const lower = text.toLowerCase();

  const keywords = [
    'table of contents',
    'contents',
    'brief contents',
    'index',
    'detailed contents',
    'list of chapters',
  ];

  // Match lines ending in numbers, with or without dots
  const tocLinePattern = /(^|\n).{0,100}(\.{2,}|\s{2,})\s*\d{1,4}($|\n)/g;
  const tocStyleLines = [...text.matchAll(tocLinePattern)].length;

  return (
    keywords.some((k) => lower.includes(k)) || tocStyleLines >= 3 // at least 3 TOC-style lines
  );
}
