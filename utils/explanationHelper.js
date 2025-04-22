const { getChapterExplanation } = require('../lib/geminiService');
const SubChapter = require('../models/SubChapter');

// Generates explanations and saves the subchapter to DB
async function saveSubChapterWithExplanations(processedChapters) {
  const originalText = subChapData.originalText;

  if (!originalText || originalText.length < 100) {
    console.log(
      `[SubChapter ${subChapCounter}] Skipping short or empty content.`
    );
    return;
  }

  console.log(
    `[SubChapter ${subChapCounter}] Generating simple explanation...`
  );
  const simpleExplanation = await getChapterExplanation(originalText, 'simple');

  console.log(
    `[SubChapter ${subChapCounter}] Generating detailed explanation...`
  );
  const detailedExplanation = await getChapterExplanation(
    originalText,
    'detailed'
  );

  const subChapter = new SubChapter({
    chapter: chapterId,
    chapterNumber: subChapCounter,
    chapterName: subChapData.ChapterName,
    originalText,
    simpleExplanation,
    detailedExplanation,
    explanationStatus: 'completed',
  });

  await subChapter.save();
  console.log(
    `[SubChapter ${subChapCounter}] Saved successfully with explanations.`
  );
}

module.exports = {
  saveSubChapterWithExplanations,
};
