const { PDFDocument } = require('pdf-lib');

module.exports = async function splitIntoChapters(pdfBuffer, tocEntries) {
  const originalPdf = await PDFDocument.load(pdfBuffer);
  const totalPages = originalPdf.getPageCount();
  const compiledChapters = [];

  for (const chapter of tocEntries) {
    let newSubChapterObjArray = [];

    for (const subChapter of chapter.subChapters) {
      const newSubChapterObj = { ...subChapter, chapterBuffer: null };
      const { ChapterName, ChapterNumber, StartPage, EndPage } =
        newSubChapterObj;

      const start = Math.max(0, StartPage - 1); // zero-based index
      const end = Math.min(totalPages, EndPage); // inclusive limit

      const chapterPdf = await PDFDocument.create();
      const copiedPages = await chapterPdf.copyPages(
        originalPdf,
        Array.from({ length: end - start }, (_, i) => i + start)
      );

      for (const page of copiedPages) {
        chapterPdf.addPage(page);
      }
      const buffer = await chapterPdf.save();
      newSubChapterObj.chapterBuffer = buffer;
      newSubChapterObjArray.push(newSubChapterObj);
    }

    let newChapterObj = { ...chapter, subChapters: newSubChapterObjArray };
    compiledChapters.push(newChapterObj);
  }

  return compiledChapters;
};
