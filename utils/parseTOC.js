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

  function removeDots(str) {
    let before4thChar = str.slice(0, 4);
    let after4thChar = str.slice(4);

    after4thChar = after4thChar.replace(/\./g, '');
    return before4thChar + after4thChar;
  }

  function removeExtraSpaces(str) {
    // Replace multiple spaces, tabs, or newlines with a single space
    return str.replace(/\s+/g, ' ').trim();
  }
  let chapterTitles = tocArray.filter(scanForChapterTitle);

  chapterTitles = chapterTitles.map((text) => {
    // Remove dots after the 4th character
    let modifiedText = removeDots(text);
    let modifiedText2 = removeExtraSpaces(modifiedText);
    // Remove leading and trailing whitespace
    return modifiedText2;
  });

  console.log(JSON.stringify(chapterTitles, null, 2));

  return tocArray;
};
