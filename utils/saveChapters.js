const Chapter = require("../models/Chapter");
const SubChapter = require("../models/SubChapter");

module.exports = async function saveChapters(compliedChapters, bookId) {
  console.log("[SaveChapters] Saving parsed chapters to database...");

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

  console.log(processedChapters[0].subChapters);

  try {
    for (const chap of processedChapters) {
      let subChapCounter = 1;
      const chapter = new Chapter({
        book: bookId,
        chapterName: chap.ChapterName,
        chapterNumber: chap.ChapterNumber,
      });

      await chapter.save();
      for (const subChap of chap.subChapters) {
        if (!subChap.originalText) {
          continue;
        }
        const subChapter = new SubChapter({
          chapter: chapter._id,
          originalText: subChap.originalText,
          chapterNumber: subChapCounter,
          chapterName: subChap.ChapterName,
        });
        await subChapter.save();
        subChapCounter += 1;
      }
    }
    console.log("[SaveChapters] All chapters saved successfully.");
  } catch (err) {
    console.error("[SaveChapters ❌] Error saving chapters:", err.message);
  }
};

async function extractTextFromPDFBuffer(pdfBuffer) {
  const pdfParse = require("pdf-parse");
  try {
    const parsed = await pdfParse(pdfBuffer);
    return parsed.text.trim(); // Return extracted text content
  } catch (err) {
    console.error(
      "[ERROR ❌] Failed to extract text from chapter PDF:",
      err.message
    );
    return ""; // Return empty string in case of error
  }
}
