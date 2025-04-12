const { PDFDocument } = require('pdf-lib');
const pdfParse = require('pdf-parse');

module.exports = async function extractPages(pdfBuffer) {
  console.log('[PAGES] Starting PDF processing...');

  let pdfDoc;
  try {
    // Attempt to load the PDF document
    pdfDoc = await PDFDocument.load(pdfBuffer);
    console.log('[PAGES] PDF loaded successfully.');
  } catch (err) {
    console.error('[ERROR ❌] Failed to load PDF:', err.message);
    return { tocPages: [], tocStartPage: null };
  }

  const totalPages = pdfDoc.getPageCount();
  console.log(`[PAGES] Total pages in PDF: ${totalPages}`);

  const pageTexts = [];
  let collecting = false; // Start collecting after TOC is found
  let tocStartPage = null;

  // Loop through each page of the PDF
  for (let i = 0; i < totalPages; i++) {
    try {
      const singlePagePDF = await PDFDocument.create();
      const [copiedPage] = await singlePagePDF.copyPages(pdfDoc, [i]);
      singlePagePDF.addPage(copiedPage);

      // Save the single-page PDF and extract text
      const pageBuffer = await singlePagePDF.save();
      const parsed = await pdfParse(pageBuffer);
      const text = parsed.text.trim();

      // If the page has no text, log and continue to the next page
      if (!text) {
        console.warn(`[PAGE ⚠️] Page ${i + 1} has no text.`);
        continue;
      }

      // Check if the page looks like a TOC page (only the first time)
      if (!collecting && isTableOfContents(text)) {
        collecting = true;
        tocStartPage = i + 1;
        console.log(
          `[TOC 🧭] Detected Table of Contents starting at page ${tocStartPage}`
        );
      }

      // If we are collecting pages and find "Preface", stop collecting
      // if (collecting && text.toLowerCase().includes('preface')) {
      //   console.log(`[TOC 🛑] TOC ended at page ${i + 1} due to "Preface"`);
      //   break; // Stop collecting after "Preface"
      // }

      // Collect all pages after the first TOC page as chapter data
      if (collecting) {
        pageTexts.push(text);
        console.log(
          `[CHAPTER ✅] Collected chapter data on page ${i + 1}/${totalPages}`
        );
      }
    } catch (err) {
      console.error(`[ERROR ❌] Failed to process page ${i + 1}:`, err.message);
    }
  }

  // Log the result of TOC collection
  if (pageTexts.length === 0) {
    console.warn('[TOC ❌] No Table of Contents pages detected.');
  } else {
    console.log(
      `[TOC ✅] Total pages collected as chapter data: ${pageTexts.length}`
    );
  }
  console.log(pageTexts, tocStartPage);
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

  // Match lines that end with numbers, with or without dots
  const tocLinePattern = /(^|\n).{0,100}(\.{2,}|\s{2,})\s*\d{1,4}($|\n)/g;
  const tocStyleLines = [...text.matchAll(tocLinePattern)].length;

  // Check for keywords and TOC style lines
  return (
    keywords.some((k) => lower.includes(k)) || tocStyleLines >= 3 // At least 3 TOC-style lines
  );
}
