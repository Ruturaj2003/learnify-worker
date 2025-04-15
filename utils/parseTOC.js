const { PDFDocument } = require('pdf-lib');

module.exports = async function parseTOCPages(pdfBuffer, tocTexts) {
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

  // Calc the last page :
  async function calcLastPage() {
    let pdfDoc;

    try {
      pdfDoc = await PDFDocument.load(pdfBuffer);
    } catch (err) {
      return [];
    }

    return pdfDoc.getPageCount();
  }

  const grpChapters = segementSubChapters();

  // Debug: Output sub-chapters to the console
  // console.log(JSON.stringify(mainChapters, null, 2));
  const lastPage = await calcLastPage();
  console.log(grpChapters);

  // Add Start Page and End Page To Main Chapters and the structure
  function structureMainChapter() {
    let length = mainChapters.length;
    let structedChapters = [];

    for (let i = 0; i < length; i++) {
      let current = mainChapters[i];

      // Extract chapter number
      let chapterMatch = current.match(/^\d+/);
      let chapterNum = chapterMatch ? Number(chapterMatch[0]) : null;

      // Extract title
      let title = current
        .replace(/^\d+\s*/, '')
        .replace(/\s*\d+$/, '')
        .trim();

      // Start page
      let startMatch = current.match(/\d+$/);
      let startPage = startMatch ? Number(startMatch[0]) : null;
      if (i === 0 && startPage > 15) {
        continue;
      }

      // End page
      let endPage;
      if (i === length - 1) {
        endPage = Number(lastPage); // `lastPage` should be defined somewhere
      } else {
        let nextMatch = mainChapters[i + 1].match(/\d+$/);
        endPage = nextMatch ? Number(nextMatch[0]) : null;
      }
      title = title.replace(/^\./, '').trim();

      // Final object
      let ChapData = {
        ChapterName: title,
        ChapterNumber: chapterNum,
        StartPage: startPage,
        EndPage: endPage,
      };

      structedChapters.push(ChapData);
    }

    return structedChapters;
  }

  function formatSubChapters(subChapters) {
    let formattedChapters = [];

    for (let subChap of subChapters) {
      let cleaned = '';
      for (let i = 0; i < subChap.length; i++) {
        if (subChap[i] === '.') {
          cleaned += '.'; // Add the dot
          // Check if the next character is a space
          if (subChap[i + 1] === ' ') {
            i++; // Skip the space
          }
        } else {
          cleaned += subChap[i]; // Add the current character
        }
      }
      formattedChapters.push(cleaned.trim()); // Trim and add to the result
    }

    return formattedChapters;
  }

  function extractOnlySubChapters(subChapters) {}

  let cleanedSubChaps = formatSubChapters(subChapters);

  let pages = structureMainChapter();
  console.log(mainChapters);

  // Return the original table of contents array
  return tocArray;
};

// TODO : 4 : Add first and Last Pages
// Check if the last entry has abrud number , remove it
// Check if the next entry is not there use the last page
// Check if the next entry has absurd number use the last page
//  Since here there is no access to the lib we wont know the last page or i could just use it here amd calc it , seems better that way

// TODO: 5 : How will u save and group those segements ?

// TODO : 6 : Handle with or without subchapters
// Chek the first 3 array if they length then it will be with no subchapters

// Pass the object of split chapters so it will know if no subchapters it will have to scan the chapters and spilt them and save them , Dam Boii its getting Tougher and complex by the minute
