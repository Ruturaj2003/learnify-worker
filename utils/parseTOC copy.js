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

    // Clean the line by removing extra spaces and dots
    const cleanedLine = cleaned.replace(/\s*\.\s*/g, ' ').trim(); // Replace multiple dots with a single space

    // Match for high-level chapters and sub-chapters with a space and page number
    let match = cleanedLine.match(
      /^(Chapter\s+[A-Za-z0-9\s\-:]+)\s+(\d{1,4})$/ // Match chapters with page number
    );

    if (!match) {
      console.log(
        '[ParseTOC] No match for high-level chapters, trying alternative patterns...'
      );
      match = cleanedLine.match(/^([A-Za-z0-9\s\-:]+?)\s+(\d{1,4})$/); // Fallback: generic title and page number
    }

    if (match) {
      const title = match[1].trim().replace(/[\s\.]+$/, ''); // Remove trailing dots/spaces
      const page = parseInt(match[2]);

      // Only add top-level chapters (no sub-chapters like "1.1" or "1.2")
      if (title && !isNaN(page) && !/\d+\.\d+/.test(title)) {
        console.log(`[ParseTOC] Found valid entry: "${title}" on page ${page}`);
        entries.push({ title, page });
      } else {
        console.log(
          '[ParseTOC] Invalid or sub-chapter entry found, skipping...'
        );
      }
    } else {
      // Extra edge case: lines like "Chapter 1 - Intro to X 9"
      console.log(
        '[ParseTOC] Trying alternate pattern for hyphenated chapters...'
      );
      const altMatch = cleanedLine.match(/^(.*?)\s+[-–]\s+.*?(\d{1,4})$/);
      if (altMatch) {
        const title = altMatch[1].trim();
        const page = parseInt(altMatch[2]);
        // Only add top-level chapters (no sub-chapters like "1.1" or "1.2")
        if (title && !isNaN(page) && !/\d+\.\d+/.test(title)) {
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
  console.log(entries);

  return entries;
};
