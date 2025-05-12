const { PDFDocument } = require('pdf-lib');

/**
 * Parses table of contents from PDF text extraction
 * @param {Buffer} pdfBuffer - The raw PDF buffer
 * @param {string[]} tocTexts - Array of extracted text blocks from TOC pages
 * @returns {Array} Structured chapter data with hierarchical organization
 */
module.exports = async function parseTOCPages(pdfBuffer, tocTexts) {
  // STEP 1: Process and clean TOC text
  let tocArray = convertToArray(tocTexts).map((text) => text.trim());
  tocArray = mergeNumberedLines(tocArray);

  // STEP 2: Extract and clean chapter titles
  let chapterTitles = tocArray
    .filter(scanForChapterTitle)
    .map((text) => adjustSpacing(removeExtraSpaces(removeDots(text))).trim());

  // STEP 3: Separate chapters by type
  let mainChapters = [...new Set(chapterTitles.filter(extractMainChapters))];
  let subChapters = chapterTitles.filter(extractSubChapters);

  // STEP 4: Get document metadata
  const lastPage = await calcLastPage(pdfBuffer);

  // STEP 5: Clean subchapter formatting
  let cleanedSubChaps = formatSubChapters(subChapters);

  // STEP 6: Handle chapter structures based on detection results
  let structuredMainChapters, structuredSubChapters;

  if (mainChapters.length === 0) {
    // Handle TOCs where main chapters couldn't be identified
    structuredMainChapters = handleNonIdentifiedChapterList(cleanedSubChaps);
    structuredSubChapters = structureSubChapterForNonIdentifiedChapterList(
      cleanedSubChaps,
      lastPage
    );
  } else {
    // Process normal TOC structure
    structuredMainChapters = structureMainChapter(mainChapters, lastPage);
    cleanedSubChaps = filterDirectSubChapters(cleanedSubChaps);
    structuredSubChapters = structureSubChapter(cleanedSubChaps, lastPage);
  }

  // STEP 7: Create hierarchical chapter structure
  return uniteChaptersData(structuredMainChapters, structuredSubChapters);

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Converts text blocks into an array of lines
   */
  function convertToArray(tocTexts) {
    return tocTexts.flatMap((text) => text.split('\n'));
  }

  /**
   * Merges lines where chapter numbers are on separate lines
   */
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

  /**
   * Determines if a line contains a chapter title
   */
  function scanForChapterTitle(text) {
    return /^(\d.*\d|chapter\s\d{1,2})$/i.test(text);
  }

  /**
   * Removes dots from chapter title except in first 4 characters
   */
  function removeDots(str) {
    return str.slice(0, 4) + str.slice(4).replace(/\./g, '');
  }

  /**
   * Normalizes whitespace in strings
   */
  function removeExtraSpaces(str) {
    return str.replace(/\s+/g, ' ').trim();
  }

  /**
   * Ensures proper spacing between text and numbers
   */
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

  /**
   * Identifies main chapter entries
   */
  function extractMainChapters(text) {
    return /^\d{1,2}[.\s][A-Za-z]/.test(text);
  }

  /**
   * Identifies subchapter entries
   */
  function extractSubChapters(text) {
    return !mainChapters.includes(text);
  }

  /**
   * Groups subchapters under their main chapters
   */
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

  /**
   * Gets the total number of pages in the PDF
   */
  async function calcLastPage(pdfBuffer) {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      return pdfDoc.getPageCount();
    } catch {
      return [];
    }
  }

  /**
   * Structures main chapter data
   */
  function structureMainChapter(mainChapters, lastPage) {
    let result = [];

    for (let i = 0; i < mainChapters.length; i++) {
      let current = mainChapters[i];

      // Extract chapter number
      let chapterMatch = current.match(/^\d+/);
      let chapterNum = chapterMatch ? Number(chapterMatch[0]) : null;

      // Extract title (remove leading number and trailing page number)
      let title = current
        .replace(/^\d+\s*/, '')
        .replace(/\s*\d+$/, '')
        .trim();

      // Extract page number
      let startMatch = current.match(/\d+$/);
      let startPage = startMatch ? Number(startMatch[0]) : null;

      // Skip if page number is greater than PDF length
      if (startMatch > lastPage) {
        break;
      }

      // Skip first entry if it starts after page 15 (likely not a real chapter)
      if (i === 0 && startPage > 15) continue;

      // Calculate end page (start of next chapter - 1 or near the end of document)
      let endPage =
        i === mainChapters.length - 1
          ? Number(lastPage - 10)
          : Number(mainChapters[i + 1].match(/\d+$/)?.[0]) - 1;

      // Ensure end page doesn't exceed document length
      if (endPage > lastPage) {
        endPage = lastPage;
      }

      // Clean title
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

  /**
   * Structures subchapter data
   */
  function structureSubChapter(subChapters, lastPage) {
    let result = [];

    for (let i = 0; i < subChapters.length; i++) {
      let current = subChapters[i];

      // Extract chapter number
      let chapterMatch = current.match(/^\d+/);
      let chapterNum = chapterMatch ? Number(chapterMatch[0]) : null;

      // Extract title
      let title = current
        .replace(/^\d+\s*/, '') // remove leading chapter number
        .replace(/\s*\d+$/, '') // remove trailing page number
        .trim();

      // Extract page number
      let startMatch = current.match(/\d+$/);
      let startPage = startMatch ? Number(startMatch[0]) : null;

      // Skip first subchapter if page number is too high
      if (i === 0 && startPage > 15) continue;

      // Calculate end page
      let endPage =
        i === subChapters.length - 1
          ? Number(lastPage - 10)
          : Number(subChapters[i + 1].match(/\d+$/)?.[0]);

      // Clean title
      title = title.replace(/^\./, '').trim();

      // Prevent duplicate entries
      const duplicate = result.some(
        (item) =>
          item.ChapterName === title &&
          item.StartPage === startPage &&
          item.EndPage === endPage
      );

      if (!duplicate) {
        // Handle invalid end page
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

  /**
   * Cleans subchapter text and formatting
   */
  function formatSubChapters(subChapters) {
    // Handle dot spacing in chapter titles
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

    // Remove entries until we find one starting with '1'
    while (cleanedChap.length > 0 && !/^1/.test(cleanedChap[0])) {
      cleanedChap.shift();
    }

    return cleanedChap;
  }

  /**
   * Extracts the combined chapter number (e.g., "1.2.3" becomes 123)
   */
  function extractCombinedChapterNumber(text) {
    if (typeof text !== 'string') {
      return null;
    }

    const match = text.match(/^(\d+(?:\.\d+)*)(?!\d)/);
    if (!match) return null;

    // Remove dots and convert to number
    const combined = match[1].replace(/\./g, '');
    return Number(combined);
  }

  /**
   * Filters subchapters to find direct chapter relationships
   */
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

      // Look for sequential chapter numbers
      for (let j = i; j < subChapters.length; j++) {
        let next = subChapters[j];
        let nextNumber = extractCombinedChapterNumber(next);

        if (checkVal === nextNumber) {
          result.push(subChapters[i]);
          i = j;
          found = true;
          break;
        }
      }

      if (!found) {
        // Try to find a reasonably close next chapter
        for (let j = i; j < subChapters.length; j++) {
          let next = subChapters[j + 1];
          let nextNumber = extractCombinedChapterNumber(next);

          if (Math.abs(currentNumber - nextNumber) <= 80) {
            i = j;
            break;
          }
        }

        // If no reasonable match is found, just move forward
        i++;
      }
    }

    return result;
  }

  /**
   * Handles TOCs where main chapter structure couldn't be detected
   */
  function handleNonIdentifiedChapterList(subChapters) {
    let startPage = null;
    let endPage = null;
    let pages = [];
    let chapterCount = 1;
    let startwith1 = /^1(?!\d)/;

    if (mainChapters.length === 0) {
      for (let i = 0; i < subChapters.length; i++) {
        // Extract current chapter number
        let temp1 = subChapters[i].match(/^\d{1,2}/);
        let currentChapterNum = temp1 ? temp1[0] : null;

        // Get next chapter number or -1 if this is the last one
        let nextChapterNum =
          i + 1 >= subChapters.length
            ? -1
            : subChapters[i + 1].match(/^\d{1,2}/)?.[0] ?? null;

        // If line starts with "1", record its page number as chapter start
        if (startwith1.test(subChapters[i])) {
          startPage = subChapters[i].match(/\d+$/)?.[0] ?? null;
        }

        // Handle last chapter
        if (nextChapterNum === -1) {
          endPage = subChapters[i].match(/\d+$/)?.[0] ?? null;
          if (endPage) {
            endPage = Number(endPage) + 4; // Add buffer pages
            pages.push({
              ChapterName: `Chapter ${chapterCount}`,
              ChapterNumber: chapterCount,
              StartPage: Number(startPage),
              EndPage: endPage,
            });
            chapterCount++;
          }
        }

        // Detect chapter boundaries by decreasing numbers
        if (Number(nextChapterNum) < Number(currentChapterNum)) {
          let nextLine = subChapters[i + 1];
          endPage = nextLine?.match(/\d+$/)?.[0] ?? null;

          if (endPage) {
            endPage = Number(endPage);

            // Skip if suspicious values found (likely not a real page)
            if (chapterCount > 5 && endPage < 20) break;

            pages.push({
              ChapterName: `Chapter ${chapterCount}`,
              ChapterNumber: chapterCount,
              StartPage: Number(startPage),
              EndPage: endPage - 1,
            });
            chapterCount++;
          }
        }
      }
    }

    return pages;
  }

  /**
   * Creates structured subchapter list for TOCs without detected main chapters
   */
  function structureSubChapterForNonIdentifiedChapterList(
    subChapters,
    lastPage
  ) {
    let result = [];
    let chapterCount = 1;

    for (let i = 0; i < subChapters.length; i++) {
      let line = subChapters[i];
      let current = line.match(/^\d+/)?.[0];

      if (!current) continue;

      let chapterNum = chapterCount;

      // Track chapter boundaries by detecting when numbers decrease
      if (i + 1 < subChapters.length) {
        let next = subChapters[i + 1].match(/^\d+/)?.[0];
        if (next && Number(next) < Number(current)) {
          chapterCount += 1;
        }
      }

      // Extract title and remove page number
      let title = line.replace(/\s*\d+$/, '').trim();

      // Extract page number
      let startMatch = line.match(/\d+$/);
      let startPage = startMatch ? Number(startMatch[0]) : null;

      if (i === 0 && startPage > 15) continue;

      // Calculate end page
      let endPage =
        i === subChapters.length - 1
          ? Number(lastPage - 10)
          : Number(subChapters[i + 1].match(/\d+$/)?.[0]);

      // Clean title
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
};
