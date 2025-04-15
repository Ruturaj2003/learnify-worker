const { PDFDocument } = require('pdf-lib');

module.exports = async function parseTOCPages(pdfBuffer, tocTexts) {
  let tocArray = convertToArray(tocTexts).map((text) => text.trim());
  tocArray = mergeNumberedLines(tocArray);

  let chapterTitles = tocArray
    .filter(scanForChapterTitle)
    .map((text) => adjustSpacing(removeExtraSpaces(removeDots(text))).trim());

  let mainChapters = [...new Set(chapterTitles.filter(extractMainChapters))];
  let subChapters = chapterTitles.filter(extractSubChapters);

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

  function segementSubChapters() {
    let grouped = {};
    for (let main of mainChapters) {
      let mainNumber = main.match(/^\d+/)[0];
      grouped[main] = subChapters.filter((sub) =>
        sub.startsWith(mainNumber + '.')
      );
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

  const grpChapters = segementSubChapters();
  const lastPage = await calcLastPage();
  let cleanedSubChaps = formatSubChapters(subChapters);

  function structureMainChapter() {
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

      if (i === 0 && startPage > 15) continue;

      let endPage =
        i === mainChapters.length - 1
          ? Number(lastPage)
          : Number(mainChapters[i + 1].match(/\d+$/)?.[0]);

      title = title.replace(/^\./, '').trim();

      result.push({
        ChapterName: title,
        ChapterNumber: chapterNum,
        StartPage: startPage,
        EndPage: endPage,
      });
    }
    return result;
  }
  function structureChapter(chapterArray) {
    let result = [];
    for (let i = 0; i < chapterArray.length; i++) {
      let current = chapterArray[i];
      let chapterMatch = current.match(/^\d+/);
      let chapterNum = chapterMatch ? Number(chapterMatch[0]) : null;

      let title = current
        .replace(/^\d+\s*/, '')
        .replace(/\s*\d+$/, '')
        .trim();
      let startMatch = current.match(/\d+$/);
      let startPage = startMatch ? Number(startMatch[0]) : null;

      if (i === 0 && startPage > 15) continue;

      let endPage =
        i === chapterArray.length - 1
          ? Number(lastPage)
          : Number(chapterArray[i + 1].match(/\d+$/)?.[0]);

      title = title.replace(/^\./, '').trim();

      result.push({
        ChapterName: title,
        ChapterNumber: chapterNum,
        StartPage: startPage,
        EndPage: endPage,
      });
    }
    return result;
  }

  function structureSubChapter() {
    let result = [];
    for (let i = 0; i < cleanedSubChaps.length; i++) {
      let current = cleanedSubChaps[i];
      let chapterMatch = current.match(/^\d+/);
      let chapterNum = chapterMatch ? Number(chapterMatch[0]) : null;

      let title = current
        .replace(/^\d+\s*/, '')
        .replace(/\s*\d+$/, '')
        .trim();
      let startMatch = current.match(/\d+$/);
      let startPage = startMatch ? Number(startMatch[0]) : null;

      if (i === 0 && startPage > 15) continue;

      let endPage =
        i === subChapters.length - 1
          ? Number(lastPage)
          : Number(subChapters[i + 1].match(/\d+$/)?.[0]);

      title = title.replace(/^\./, '').trim();

      result.push({
        ChapterName: title,
        ChapterNumber: chapterNum,
        StartPage: startPage,
        EndPage: endPage,
      });
    }
    return result;
  }

  function formatSubChapters(subChapters) {
    return subChapters.map((subChap) => {
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
  }

  function handleNonIdentifiedChapterList() {
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

        if (nextChapterNum === -1 || nextChapterNum < currentChapterNum) {
          endPage = subChapters[i].match(/\d+$/)?.[0] ?? null;
          pages.push({
            ChapterName: `Chapter ${chapterCount}`,
            ChapterNumber: chapterCount,
            StartPage: startPage,
            EndPage: endPage,
          });
          chapterCount++;
        }
      }
    }

    return pages;
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
      console.log(currentNumber);
      console.error(checkVal + 100000);

      for (let j = i; j < subChapters.length; j++) {
        let next = subChapters[j];
        let nextNumber = extractCombinedChapterNumber(next);

        if (checkVal === nextNumber) {
          result.push(subChapters[j]); // Add the current chapter
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
            console.log('Break Here ' + currentNumber);
            result.push(subChapters[i]);
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

  if (mainChapters.length === 0) {
    structureMainChapter = handleNonIdentifiedChapterList();
  } else {
    structureMainChapter = structureChapter(mainChapters);
  }

  // cleanedSubChaps = cleanedSubChaps.filter(removeSubSubChapters);
  let dota = filterDirectSubChapters(cleanedSubChaps);
  console.log('GG');

  console.dir(dota, { depth: null });

  return tocArray;
};

//TODO : Check if there are 2 digits after the dots , if yes then extract those number or just double clean after this when they are like this trackt he current number then check if u sub it by 0.1 will u get the prev chapter number if  yes take , use a while loop and check when it goes there change the index to that one and save  ie: ......................................................While loop starts with 1 , save the first entry then use a for loop in it start with i then check when u get the index where if u add 0.1 to the current chapter number , it will be same as the next chapter number , now the next one is found so change the index of i to it , then it gets saved

// TODO Handle if the start values is big ,it messes up stuff bc
