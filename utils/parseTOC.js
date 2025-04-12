module.exports = function parseTOCPages(tocTexts) {
  const entries = [];

  // Log tocTexts to inspect its structure
  console.log('[ParseTOC] tocTexts:', tocTexts);

  // Ensure tocTexts is an array
  if (!Array.isArray(tocTexts)) {
    console.error(
      '[ParseTOC] Error: tocTexts is not an array. It is a',
      typeof tocTexts
    );
    return entries; // Return empty array if tocTexts is not an array
  }

  // Join all TOC pages into a single block of text
  const fullText = tocTexts.join('\n');
  const lines = fullText.split('\n');

  console.log('[ParseTOC] Parsing Table of Contents...');
  console.log(`[ParseTOC] Total lines to process: ${lines.length}`);

  for (const line of lines) {
    const cleaned = line.trim();
    if (!cleaned) {
      console.log('[ParseTOC] Skipping empty or whitespace-only line.');
      continue;
    }

    console.log(`[ParseTOC] Processing line: "${cleaned}"`);

    let match = cleaned.match(
      /^(.*?)(\.{2,}|-{2,}|\s{2,}|\t+)\s*(\d{1,4})\s*$/ // Dots, dashes, or wide space
    );
    if (!match) {
      console.log(
        '[ParseTOC] No match for dotted lines or wide spaces, trying alternative patterns...'
      );
      match = cleaned.match(/^([\d\w\s\.\-:()]+?)\s+(\d{1,4})$/); // fallback: any text then page
    }

    if (match) {
      const title = match[1].trim().replace(/[\s\.]+$/, ''); // Remove trailing dots/spaces
      const page = parseInt(match[3] || match[2]);

      if (title && !isNaN(page)) {
        console.log(`[ParseTOC] Found valid entry: "${title}" on page ${page}`);
        entries.push({ title, page });
      } else {
        console.log('[ParseTOC] Invalid entry found, skipping...');
      }
    } else {
      // Extra edge case: lines like "Chapter 1 - Intro to X 9"
      console.log(
        '[ParseTOC] Trying alternate pattern for hyphenated chapters...'
      );
      const altMatch = cleaned.match(/^(.*?)\s+[-–]\s+.*?(\d{1,4})$/);
      if (altMatch) {
        const title = altMatch[1].trim();
        const page = parseInt(altMatch[2]);
        if (title && !isNaN(page)) {
          console.log(
            `[ParseTOC] Found alternate valid entry: "${title}" on page ${page}`
          );
          entries.push({ title, page });
        } else {
          console.log(
            '[ParseTOC] Invalid entry found in alternate pattern, skipping...'
          );
        }
      } else {
        console.log('[ParseTOC] No valid matches found for this line.');
      }
    }
  }

  if (entries.length === 0) {
    console.warn('[ParseTOC ❌] No valid entries found in TOC text.');
  } else {
    console.log(
      `[ParseTOC ✅] Parsed ${entries.length} valid entries from TOC.`
    );
  }

  // Check for any entries with missing or invalid titles/pages
  entries.forEach((entry, index) => {
    if (!entry.title || isNaN(entry.page)) {
      console.error(`[ParseTOC] Invalid entry at index ${index}:`, entry);
    }
  });

  return entries;
};
