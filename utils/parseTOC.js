module.exports = function parseTOCPages(tocTexts) {
  let tocArray = convertToArray(tocTexts);

  tocArray = tocArray.map((text) => {
    // Remove any leading or trailing whitespace
    return text.trim();
  });
  // Convert it into Array
  function convertToArray(tocTexts) {
    let result = [];
    for (let i = 0; i < tocTexts.length; i++) {
      const text = tocTexts[i];
      result = result.concat(text.split('\n'));
    }
    return result;
  }

  // Save the text that look like chapter titles
  function scanForChapterTitle(text) {
    const regex = /^\d.*\d$/;
    return regex.test(text);
  }

  const chapterTitles = tocArray.filter(scanForChapterTitle);

  console.log(JSON.stringify(chapterTitles, null, 2));

  return tocArray;
};
