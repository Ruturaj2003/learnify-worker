const Chapter = require('../models/Chapter');
const SubChapter = require('../models/SubChapter');

module.exports = async function processPdfToText(compliedChapters, bookId) {
  console.log('[SaveChapters] Saving parsed chapters to database...');

  let processedChapters = [];

  for (const chapter of compliedChapters) {
    let subChapterObjectArray = [];

    for (const subChapter of chapter.subChapters) {
      let newSubChapterObj = { ...subChapter, originalText: null };
      const content = await extractTextFromPDFBuffer(subChapter.chapterBuffer);

      newSubChapterObj.originalText = content;
      subChapterObjectArray.push(newSubChapterObj);
    }
    let newChapterObject = { ...chapter, subChapters: subChapterObjectArray };

    processedChapters.push(newChapterObject);
  }

  return processedChapters;
};

async function extractTextFromPDFBuffer(pdfBuffer) {
  const pdfParse = require('pdf-parse');
  try {
    const parsed = await pdfParse(pdfBuffer);
    return parsed.text.trim(); // Return extracted text content
  } catch (err) {
    console.error(
      '[ERROR ❌] Failed to extract text from chapter PDF:',
      err.message
    );
    return ''; // Return empty string in case of error
  }
}
