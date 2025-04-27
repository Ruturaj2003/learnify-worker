const downloadPDF = require('../utils/downloadPDF');
const extractPages = require('../utils/extractPages');
const parseTOC = require('../utils/parseTOC');
const splitIntoChapters = require('../utils/splitIntoChapters');
const saveChapters = require('../utils/saveChapters');
const Chapter = require('../models/Chapter');
const processPdfToText = require('../utils/processPdfToText');
const trimPdf = require('../utils/trimPdf');
const Book = require('../models/Book');

async function processBook(bookId, fileUrl) {
  const url = fileUrl;
  let pagesToRemove = 21;

  try {
    const book = await Book.findById(bookId);
    pagesToRemove = book.startsFrom;
    if (!book) {
      throw new Error('Book not found');
    }
    console.log('[processBook] Downloading PDF...');
    const pdfBuffer = await downloadPDF(url);

    console.log('[processBook] Extracting text from PDF...');
    const { tocPages } = await extractPages(pdfBuffer); // Destructure to get only the TOC pages

    console.log('[processBook] Parsing Table of Contents...');
    const tocEntries = await parseTOC(pdfBuffer, tocPages); // Pass only the tocPages array

    // Now that the TOC is parsed, trim the PDF to remove the specified number of pages
    console.log(
      '[processBook] Trimming PDF to remove the first ${pagesToRemove} pages...'
    );
    const trimmedPdfBuffer = await trimPdf(pdfBuffer, pagesToRemove);

    console.log('[processBook] Splitting PDF into chapters...');
    const compiledChapters = await splitIntoChapters(
      trimmedPdfBuffer,
      tocEntries
    );

    // // Save chapters to the database
    console.log('[processBook] Saving chapters to DB...');
    await saveChapters(compiledChapters, bookId); // Pass bookId to associate chapters with a book

    console.log('[processBook] Book processing completed successfully!');
  } catch (error) {
    console.error('[processBook] Error during book processing:', error);
  }
}

module.exports = processBook;
