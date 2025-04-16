const { PDFDocument } = require('pdf-lib');

module.exports = async function parseTOCPages(pdfBuffer, tocTexts) {
  // Convert TOC text blocks into an array of trimmed lines
  let tocArray = convertToArray(tocTexts).map((text) => text.trim());

  // Merge lines where chapter numbers are on a separate line
  tocArray = mergeNumberedLines(tocArray);

  // Clean and extract valid chapter title lines
  let chapterTitles = tocArray
    .filter(scanForChapterTitle)
    .map((text) => adjustSpacing(removeExtraSpaces(removeDots(text))).trim());

  // Separate main chapters and subchapters
  let mainChapters = [...new Set(chapterTitles.filter(extractMainChapters))];
  let subChapters = chapterTitles.filter(extractSubChapters);

  // Get total number of pages in the PDF
  const lastPage = await calcLastPage();

  // Clean subchapter formatting and remove non-starting ones
  let cleanedSubChaps = formatSubChapters(subChapters);

  // Prepare variables for final structured output
  let structuredMainChapters;
  let structuredSubChapters;

  // Handle edge case when no main chapters are found
  if (mainChapters.length === 0) {
    structuredMainChapters = handleNonIdentifiedChapterList(cleanedSubChaps);
    structuredSubChapters = structureSubChapterForNonIdentifiedChapterList(
      cleanedSubChaps,
      lastPage
    );
  } else {
    structuredMainChapters = structureMainChapter(mainChapters);
    cleanedSubChaps = filterDirectSubChapters(cleanedSubChaps);
    structuredSubChapters = structureSubChapter(cleanedSubChaps, lastPage);
  }

  // Group subchapters under their main chapters
  const grpChapters = uniteChaptersData(
    structuredMainChapters,
    structuredSubChapters
  );

  // console.log(typeof structureSubChapter); // Should be 'object'
  // console.log(Array.isArray(structureSubChapter)); // Should be true
  // console.log(structuredSubChapters); // Check what's actually inside

  console.dir(grpChapters, {
    depth: null,
    colors: true,
    maxArrayLength: null, // shows all array items
    compact: false, // makes the output easier to read
  });

  return tocArray;
  // TODO : Just here for separtaion ------------------------

  // -------------------Functions Area ---------------------
  // =========================================================

  // =========================================================
  // TODO : XOXOXOXOXOXOXOXOOXOOOOOOOOOOXXXXXXXXXXXXXXXXXOOOOOOO
  function convertToArray(tocTexts) {
    return tocTexts.flatMap((text) => text.split('\n'));
  }

  function mergeNumberedLines(arr) {
    let result = [];
    for (let i = 0; i < arr.length; i++) {
      let current = arr[i];
      if (/^\d+\.\s*$/.test(current) && i < arr.length - 1) {
        result.push(current + arr[i + 1]);
        i++;
      } else {
        result.push(current);
      }
    }
    return result;
  }

  function scanForChapterTitle(text) {
    return /^(\d.*\d|chapter\s\d{1,2})$/i.test(text);
  }

  function removeDots(str) {
    return str.slice(0, 4) + str.slice(4).replace(/\./g, '');
  }

  function removeExtraSpaces(str) {
    return str.replace(/\s+/g, ' ').trim();
  }

  function adjustSpacing(str) {
    let i = str.length - 1;
    while (i >= 0) {
      if (/\d/.test(str[i]) && !/\d|\s/.test(str[i - 1])) {
        return str.slice(0, i) + ' ' + str.slice(i);
      }
      i--;
    }
    return str;
  }

  function extractMainChapters(text) {
    return /^\d{1,2}[.\s][A-Za-z]/.test(text);
  }

  function extractSubChapters(text) {
    return !mainChapters.includes(text);
  }

  function uniteChaptersData(mainChapters, subChapters) {
    let grouped = [];
    for (let chap of mainChapters) {
      let chapterWithSubs = { ...chap, subChapters: [] };

      for (let subchap of subChapters) {
        if (chap.ChapterNumber == subchap.ChapterNumber) {
          chapterWithSubs.subChapters.push(subchap);
        }
      }

      grouped.push(chapterWithSubs);
    }

    return grouped;
  }

  async function calcLastPage() {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      return pdfDoc.getPageCount();
    } catch {
      return [];
    }
  }
  function structureMainChapter(mainChapters) {
    let result = [];
    for (let i = 0; i < mainChapters.length; i++) {
      let current = mainChapters[i];
      let chapterMatch = current.match(/^\d+/);
      let chapterNum = chapterMatch ? Number(chapterMatch[0]) : null;

      let title = current
        .replace(/^\d+\s*/, '')
        .replace(/\s*\d+$/, '')
        .trim();
      let startMatch = current.match(/\d+$/);
      let startPage = startMatch ? Number(startMatch[0]) : null;
      if (startMatch > lastPage) {
        break;
      }

      if (i === 0 && startPage > 15) continue;

      let endPage =
        i === mainChapters.length - 1
          ? Number(lastPage - 10)
          : Number(mainChapters[i + 1].match(/\d+$/)?.[0]) - 1;
      if (endPage > lastPage) {
        endPage = lastPage;
      }

      title = title.replace(/^\./, '').trim();

      result.push({
        ChapterName: title,
        ChapterNumber: chapterNum,
        StartPage: Number(startPage),
        EndPage: Number(endPage),
      });
    }
    return result;
  }

  function structureSubChapter(subChapters, lastPage) {
    let result = [];

    for (let i = 0; i < subChapters.length; i++) {
      let current = subChapters[i];
      let chapterMatch = current.match(/^\d+/);
      let chapterNum = chapterMatch ? Number(chapterMatch[0]) : null;

      let title = current
        .replace(/^\d+\s*/, '') // remove the leading chapter number
        .replace(/\s*\d+$/, '') // remove the trailing page number
        .trim();

      let startMatch = current.match(/\d+$/);
      let startPage = startMatch ? Number(startMatch[0]) : null;

      // Skip subchapter if the startPage is higher than 15 for the first entry
      if (i === 0 && startPage > 15) continue;
      // Not needed
      // if (result.length == 0 && !/^1/.test(subChapters[i])) {
      //   continue;
      // }

      let endPage =
        i === subChapters.length - 1
          ? Number(lastPage - 10)
          : Number(subChapters[i + 1].match(/\d+$/)?.[0]);

      title = title.replace(/^\./, '').trim();

      // Check if this chapter already exists in the result to prevent duplicates
      const duplicate = result.some(
        (item) =>
          item.ChapterName === title &&
          item.StartPage === startPage &&
          item.EndPage === endPage
      );

      if (!duplicate) {
        if (Number.isNaN(endPage)) {
          endPage = Number(lastPage) - 10;
        }
        result.push({
          ChapterName: title,
          ChapterNumber: chapterNum,
          StartPage: Number(startPage),
          EndPage: Number(endPage),
        });
      }
    }

    return result;
  }

  function formatSubChapters(subChapters) {
    let cleanedChap = subChapters.map((subChap) => {
      let cleaned = '';
      for (let i = 0; i < subChap.length; i++) {
        if (subChap[i] === '.') {
          cleaned += '.';
          if (subChap[i + 1] === ' ') i++;
        } else {
          cleaned += subChap[i];
        }
      }
      return cleaned.trim();
    });
    while (cleanedChap.length > 0 && !/^1/.test(cleanedChap[0])) {
      cleanedChap.shift();
    }
    return cleanedChap;
  }
  function extractCombinedChapterNumber(text) {
    if (typeof text !== 'string') {
      return null; // or handle it however makes sense for your logic
    }
    const match = text.match(/^(\d+(?:\.\d+)*)(?!\d)/);

    if (!match) return null;

    // Remove all dots and return as a number
    const combined = match[1].replace(/\./g, '');
    return Number(combined);
  }
  function filterDirectSubChapters(subChapters) {
    let result = [];
    let i = 0;

    while (i < subChapters.length) {
      let current = subChapters[i];
      let currentNumber = extractCombinedChapterNumber(current);
      if (currentNumber == null) {
        break;
      }
      let checkVal = currentNumber + 1;
      let found = false;

      for (let j = i; j < subChapters.length; j++) {
        let next = subChapters[j];
        let nextNumber = extractCombinedChapterNumber(next);

        if (checkVal === nextNumber) {
          result.push(subChapters[i]); // Add the current chapter
          i = j; // Move to the next matched subchapter
          found = true;
          break;
        }
      }

      // if (!found) {
      //   for (let j = i; j < subChapters.length; j++) {}
      // }
      if (!found) {
        // Try to skip ahead if the next chapter is way off

        for (let j = i; j < subChapters.length; j++) {
          let next = subChapters[j + 1];
          let nextNumber = extractCombinedChapterNumber(next);

          if (Math.abs(currentNumber - nextNumber) <= 80) {
            i = j; // Move to the next closer chapter
            break;
          }
        }

        // If no closer chapter is found, just move one step
        i++;
      }
    }

    return result;
  }

  // For the Annoying Book That have name as Chpater 12 sadas abd cant be detecteed YET!!!
  // X-------------X-----------------------X------------------X

  function handleNonIdentifiedChapterList(subChapters) {
    let startPage = null;
    let endPage = null;
    let pages = [];
    let chapterCount = 1;
    let startwith1 = /^1(?!\d)/;

    if (mainChapters.length === 0) {
      for (let i = 0; i < subChapters.length; i++) {
        let temp1 = subChapters[i].match(/^\d{1,2}/);
        let currentChapterNum = temp1 ? temp1[0] : null;

        let nextChapterNum =
          i + 1 >= subChapters.length
            ? -1
            : subChapters[i + 1].match(/^\d{1,2}/)?.[0] ?? null;

        if (startwith1.test(subChapters[i])) {
          startPage = subChapters[i].match(/\d+$/)?.[0] ?? null;
        }

        if (nextChapterNum === -1) {
          endPage = subChapters[i].match(/\d+$/)?.[0] ?? null;
          if (endPage) {
            endPage = Number(endPage) + 4; // Add 4 pages as per your logic
            pages.push({
              ChapterName: `Chapter ${chapterCount}`,
              ChapterNumber: chapterCount,
              StartPage: Number(startPage),
              EndPage: endPage,
            });
            chapterCount++;
          }
        }

        // Ensure we're comparing numbers
        if (Number(nextChapterNum) < Number(currentChapterNum)) {
          let nextLine = subChapters[i + 1];
          endPage = nextLine?.match(/\d+$/)?.[0] ?? null;

          if (endPage) {
            endPage = Number(endPage);

            // Ensure it's a valid number and compare properly
            if (chapterCount > 5 && endPage < 20) break;

            pages.push({
              ChapterName: `Chapter ${chapterCount}`,
              ChapterNumber: chapterCount,
              StartPage: Number(startPage),
              EndPage: endPage - 1, // Adjusting endPage
            });
            chapterCount++;
          }
        }
      }
    }

    return pages;
  }

  function structureSubChapterForNonIdentifiedChapterList(
    subChapters,
    lastPage
  ) {
    let result = [];
    let chapterCount = 1;

    for (let i = 0; i < subChapters.length; i++) {
      let line = subChapters[i]; // use full line
      let current = line.match(/^\d+/)?.[0];

      if (!current) continue;

      let chapterNum = chapterCount;

      if (i + 1 < subChapters.length) {
        let next = subChapters[i + 1].match(/^\d+/)?.[0];
        if (next && Number(next) < Number(current)) {
          chapterCount += 1;
        }
      }

      let title = line
        .replace(/\s*\d+$/, '') // remove number at end (likely page number)
        .trim();
      // remove number at start

      let startMatch = line.match(/\d+$/);
      let startPage = startMatch ? Number(startMatch[0]) : null;

      if (i === 0 && startPage > 15) continue;

      let endPage =
        i === subChapters.length - 1
          ? Number(lastPage - 10)
          : Number(subChapters[i + 1].match(/\d+$/)?.[0]);

      title = title.replace(/^\./, '').trim();

      result.push({
        ChapterName: `${title}`,
        ChapterNumber: chapterNum,
        StartPage: startPage,
        EndPage: endPage,
      });
    }

    return result;
  }

  // X-------------X-----------------------X----------------
};
