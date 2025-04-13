const { PDFDocument } = require('pdf-lib');

/**
 * Splits the PDF document into chapters based on TOC with start and end pages.
 *
 * @param {Buffer} pdfBuffer - The PDF buffer from which chapters will be split.
 * @param {Array} tocEntries - Array of TOC entries (title, startPage, endPage).
 * @returns {Array} - Array of chapter PDFs (Buffer for each chapter).
 */
module.exports = async function splitIntoChapters(pdfBuffer, tocEntries) {
  console.log('[SplitIntoChapters] Starting PDF chapter splitting...');
  let pdfDoc;

  try {
    pdfDoc = await PDFDocument.load(pdfBuffer);
    console.log('[SplitIntoChapters] PDF loaded successfully.');
  } catch (err) {
    console.error('[ERROR ❌] Failed to load PDF:', err.message);
    return [];
  }

  const totalPages = pdfDoc.getPageCount();
  const maxAllowedPage = totalPages * 3;
  console.log(`[SplitIntoChapters] Total pages in PDF: ${totalPages}`);

  const chapterBuffers = [];

  for (const entry of tocEntries) {
    const title = entry.title;
    let startPage = entry.startPage;
    let endPage = entry.endPage;

    // Skip if start page is more than 3 times the length of the PDF
    if (startPage > maxAllowedPage) {
      console.warn(
        `[Skip] "${title}" has a start page (${startPage}) greater than 3× PDF length. Skipping.`
      );
      continue;
    }

    // Clamp values within PDF range
    startPage = Math.max(1, startPage); // Ensure start is at least page 1
    endPage = endPage && endPage <= maxAllowedPage ? endPage : totalPages;

    const zeroBasedStart = startPage - 1;
    const zeroBasedEnd = Math.min(endPage, totalPages); // Ensure end is within PDF

    console.log(
      `[SplitIntoChapters] Splitting "${title}" (Pages: ${startPage} to ${zeroBasedEnd})`
    );

    const chapterDoc = await PDFDocument.create();

    for (let i = zeroBasedStart; i < zeroBasedEnd; i++) {
      const [copiedPage] = await chapterDoc.copyPages(pdfDoc, [i]);
      chapterDoc.addPage(copiedPage);
    }

    const chapterBuffer = await chapterDoc.save();
    chapterBuffers.push({ title, buffer: chapterBuffer });

    console.log(`[SplitIntoChapters] Chapter "${title}" saved.`);
  }

  console.log('[SplitIntoChapters] PDF splitting completed.');
  return chapterBuffers;
};
