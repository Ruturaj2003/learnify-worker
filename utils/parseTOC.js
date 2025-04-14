module.exports = function parseTOCPages(tocTexts) {
  let tocArray = convertToArray(tocTexts);

  // Clean up whitespace
  tocArray = tocArray.map((text) => text.trim());

  // Merge lines like: "11. ", "Electromagnetism 328"
  tocArray = mergeNumberedLines(tocArray);

  // Function to convert string chunks into an array
  function convertToArray(tocTexts) {
    let result = [];
    for (let i = 0; i < tocTexts.length; i++) {
      const text = tocTexts[i];
      result = result.concat(text.split('\n'));
    }
    return result;
  }

  // Function to merge number-dot-space lines with the next one
  function mergeNumberedLines(arr) {
    let result = [];
    for (let i = 0; i < arr.length; i++) {
      let current = arr[i];
      if (/^\d+\.\s*$/.test(current) && i < arr.length - 1) {
        result.push(current + arr[i + 1]);
        i++; // Skip the next one since it's merged
      } else {
        result.push(current);
      }
    }
    return result;
  }

  // Filter chapter titles that start and end with a number
  function scanForChapterTitle(text) {
    const regex = /^\d.*\d$/;
    return regex.test(text);
  }

  const chapterTitles = tocArray.filter(scanForChapterTitle);

  console.log(JSON.stringify(chapterTitles, null, 2));

  return tocArray;
};
