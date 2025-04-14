module.exports = function parseTOCPages(tocTexts) {
  // Convert text to array of lines and clean up whitespace
  let tocArray = convertToArray(tocTexts);
  tocArray = tocArray.map((text) => text.trim());

  // Merge lines like "11. ", "Electromagnetism 328"
  tocArray = mergeNumberedLines(tocArray);

  // Process chapter titles to remove unwanted dots, spaces, and adjust formatting
  let chapterTitles = tocArray.filter(scanForChapterTitle);
  chapterTitles = chapterTitles.map((text) => {
    let modifiedText = removeDots(text);
    let modifiedText2 = removeExtraSpaces(modifiedText);
    let modifiedText3 = adjustSpacing(modifiedText2);
    return modifiedText3.trim(); // Remove leading/trailing whitespace
  });

  // Extract main chapters (with 1 or 2 digit numbers followed by an alphabet)
  let mainChapters = [...new Set(chapterTitles.filter(extractMainChapters))];

  // Extract sub-chapters that are not in the main chapters
  let subChapters = chapterTitles.filter(extractSubChapters);

  // Function to convert string chunks into an array
  function convertToArray(tocTexts) {
    let result = [];
    for (let i = 0; i < tocTexts.length; i++) {
      const text = tocTexts[i];
      result = result.concat(text.split('\n'));
    }
    return result;
  }

  // Function to merge numbered lines like "11. ", "Electromagnetism 328"
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

  // Remove dots after the 4th character
  function removeDots(str) {
    let before4thChar = str.slice(0, 4);
    let after4thChar = str.slice(4);
    after4thChar = after4thChar.replace(/\./g, '');
    return before4thChar + after4thChar;
  }

  // Remove extra spaces (spaces, tabs, newlines) and trim the string
  function removeExtraSpaces(str) {
    return str.replace(/\s+/g, ' ').trim();
  }

  // Adjust spacing between numbers and letters
  function adjustSpacing(str) {
    let i = str.length - 1;
    while (i >= 0) {
      if (/\d/.test(str[i])) {
        if (
          /\d/.test(str[i - 1]) ||
          /\s/.test(str[i - 1]) ||
          /\t/.test(str[i - 1])
        ) {
          i--;
          continue;
        } else {
          str = str.slice(0, i) + ' ' + str.slice(i);
          break;
        }
      }
      i--;
    }
    return str;
  }

  // Extract main chapters (numbers followed by alphabet)
  function extractMainChapters(text) {
    const regex = /^\d{1,2}[.\s][A-Za-z]/;
    return regex.test(text);
  }

  // Extract sub-chapters (anything not in main chapters)
  function extractSubChapters(text) {
    if (mainChapters.includes(text)) {
      return false;
    } else {
      return true;
    }
  }

  function segementSubChapters() {
    let groupedChapters = {};

    for (let main of mainChapters) {
      let mainNumber = main.match(/^\d+/)[0]; // e.g., "1" from "1. Introduction"
      groupedChapters[main] = subChapters.filter((sub) =>
        sub.startsWith(mainNumber + '.')
      );
    }

    return groupedChapters;
  }

  const grpChapters = segementSubChapters();

  // Debug: Output sub-chapters to the console
  // console.log(JSON.stringify(mainChapters, null, 2));
  console.log(grpChapters);

  // Return the original table of contents array
  return tocArray;
};

// TODO: 3: Validate page numbers
// DO Big Brain move , since u have the main chapters with you they will have proper chapter setting , when using it just add to the collection the subchaters that start with the same number and have dot after it , like that all will be sorted no need of complex logic
// - Ensure the first page number starts with "1".
// - Check if the next page number is greater than the previous one. If it is, remove the invalid entry.
// - This validation should be done in the final stage.

// TODO : 4 : Add first and Last Pages

// TODO: 5 : How will u save and group those segements ?
