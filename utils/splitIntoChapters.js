const { PDFDocument } = require('pdf-lib');

/**
 * Splits the PDF document into chapters based on the TOC information.
 *
 * @param {Buffer} pdfBuffer - The PDF buffer from which chapters will be split.
 * @param {Array} tocEntries - Array of TOC entries (title, start page).
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
  console.log(`[SplitIntoChapters] Total pages in PDF: ${totalPages}`);

  const chapterBuffers = [];

  // Iterate over the TOC entries to split PDF based on chapters
  for (let i = 0; i < tocEntries.length; i++) {
    const currentEntry = tocEntries[i];
    const chapterTitle = currentEntry.title;
    const startPage = currentEntry.page - 1; // Convert to 0-based index
    const nextStartPage =
      i + 1 < tocEntries.length ? tocEntries[i + 1].page - 1 : totalPages; // Get next chapter's start page or totalPages

    console.log(
      `[SplitIntoChapters] Splitting chapter: "${chapterTitle}" starting at page ${
        startPage + 1
      }`
    );

    // Create a new PDF document for the chapter
    const chapterDoc = await PDFDocument.create();

    // Copy pages from the start of this chapter to the end
    for (let j = startPage; j < nextStartPage; j++) {
      const [copiedPage] = await chapterDoc.copyPages(pdfDoc, [j]);
      chapterDoc.addPage(copiedPage);
    }

    // Save the new chapter as a PDF buffer
    const chapterBuffer = await chapterDoc.save();
    chapterBuffers.push({
      title: chapterTitle,
      buffer: chapterBuffer,
    });

    console.log(`[SplitIntoChapters] Chapter "${chapterTitle}" saved.`);
  }

  console.log('[SplitIntoChapters] PDF splitting completed.');
  return chapterBuffers;
};
