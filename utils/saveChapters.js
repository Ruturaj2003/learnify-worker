module.exports = async function saveChapters(processedChapters, bookId) {
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
    console.log('[SaveChapters] All chapters saved successfully.');
  } catch (err) {
    console.error('[SaveChapters ❌] Error saving chapters:', err.message);
  }
};
