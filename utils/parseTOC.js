module.exports = function parseTOCPages(tocTexts) {
  const entries = []; // Stores chapter entries with title, startPage, endPage
  const chapterNames = []; // Stores the line before each valid TOC entry

  if (!Array.isArray(tocTexts)) {
    console.error('[ParseTOC ❌] tocTexts is not an array!');
    return entries;
  }

  const fullText = tocTexts.join('\n');
  const lines = fullText.split('\n');

  console.log(`[ParseTOC] Total lines to process: ${lines.length}`);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      console.log(`[ParseTOC] Skipping empty line at index ${i}`);
      continue;
    }

    const cleanedLine = line.replace(/\s*\.\s*/g, ' ').trim();

    // Try matching standard pattern: "Chapter Name 123"
    let match = cleanedLine.match(
      /^(Chapter\s+[A-Za-z0-9\s\-:]+)\s+(\d{1,4})$/
    );

    // If no match, try general pattern: "Title 123"
    if (!match) {
      match = cleanedLine.match(/^([A-Za-z0-9\s\-:]+?)\s+(\d{1,4})$/);
    }

    if (match) {
      const title = match[1].trim().replace(/[\s\.]+$/, '');
      const startPage = parseInt(match[2]);

      // Skip subchapters like "4.1 Something"
      if (title && !isNaN(startPage) && !/\d+\.\d+/.test(title)) {
        entries.push({ title, startPage, endPage: null });
        console.log(
          `[ParseTOC ✅] Matched: "${title}" starts on page ${startPage}`
        );

        if (i > 0) {
          const prevLine = lines[i - 1].trim();
          if (prevLine) {
            chapterNames.push(prevLine);
            console.log(
              `[ParseTOC 📌] Saved previous line as chapter name: "${prevLine}"`
            );
          }
        }
      }
    } else {
      // Try matching alternative format: "Title – description 123"
      const altMatch = cleanedLine.match(/^(.*?)\s+[-–]\s+.*?(\d{1,4})$/);
      if (altMatch) {
        const title = altMatch[1].trim();
        const startPage = parseInt(altMatch[2]);

        if (title && !isNaN(startPage) && !/\d+\.\d+/.test(title)) {
          entries.push({ title, startPage, endPage: null });
          console.log(
            `[ParseTOC ✅] Alt matched: "${title}" starts on page ${startPage}`
          );

          if (i > 0) {
            const prevLine = lines[i - 1].trim();
            if (prevLine) {
              chapterNames.push(prevLine);
              console.log(
                `[ParseTOC 📌] Saved previous line as chapter name: "${prevLine}"`
              );
            }
          }
        }
      }
    }
  }

  // Set endPage using the startPage of the next entry
  for (let i = 0; i < entries.length - 1; i++) {
    entries[i].endPage = entries[i + 1].startPage - 1;
  }

  // Log final results
  console.log('\n--- ✅ Parsed TOC Entries with Page Ranges ---');
  console.dir(entries, { depth: null, maxArrayLength: null });

  console.log('\n--- 📚 Lines Before Each Valid Chapter (chapterNames) ---');
  console.dir(chapterNames, { depth: null, maxArrayLength: null });

  function removeDots(lines) {
    return lines.map((line) => line.replace(/(\.\s*)+/g, '').trim());
  }
  console.dir(removeDots(chapterNames), {
    depth: null,
    maxArrayLength: null,
  });

  // Remove dots from chapterNames
  const nondot = chapterNames.map((line) =>
    line.replace(/(\.\s*)+/g, '').trim()
  );

  // Remove chapterNames that match entry titles exactly
  const entryTitles = new Set(entries.map((e) => e.title));
  const uniqueChapterNames = nondot.filter((name) => !entryTitles.has(name));

  console.log('\n--- ✅ Parsed TOC Entries with Page Ranges ---');
  console.dir(entries, { depth: null });

  console.log(
    '\n--- 📚 Unique Chapter Names (after dot removal and filtering) ---'
  );
  console.dir(uniqueChapterNames, { depth: null });
  return entries;
};
