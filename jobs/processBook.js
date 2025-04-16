const downloadPDF = require('../utils/downloadPDF');
const extractPages = require('../utils/extractPages');
const parseTOC = require('../utils/parseTOC');
const splitIntoChapters = require('../utils/splitIntoChapters');
const saveChapters = require('../utils/saveChapters');
const Chapter = require('../models/Chapter');

async function processBook(bookId, fileUrl) {
  const url = fileUrl;
  try {
    console.log('[processBook] Downloading PDF...');
    const pdfBuffer = await downloadPDF(url);

    console.log('[processBook] Extracting text from PDF...');
    const { tocPages } = await extractPages(pdfBuffer); // Destructure to get only the TOC pages

    console.log('[processBook] Parsing Table of Contents...');
    const tocEntries = await parseTOC(pdfBuffer, tocPages); // Pass only the tocPages array

    console.log('[processBook] Splitting PDF into chapters...');
    const compiledChapters = await splitIntoChapters(pdfBuffer, tocEntries);

    // // Save chapters to the database
    console.log('[processBook] Saving chapters to DB...');
    await saveChapters(compiledChapters, bookId); // Pass bookId to associate chapters with a book

    console.log('[processBook] Book processing completed successfully!');
  } catch (error) {
    console.error('[processBook] Error during book processing:', error);
  }
}

module.exports = processBook;
