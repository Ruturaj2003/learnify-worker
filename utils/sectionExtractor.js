function extractSectionsFromText(text) {
  const rawSections = text.split(/(?=Chapter\s+\d+[^a-zA-Z0-9])/gi);
  const sections = [];

  rawSections.forEach((sec, i) => {
    const lines = sec
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    let title = lines[0];

    // Edge case handlers
    if (!title.match(/Chapter\s+\d+/i)) title = `Section ${i + 1}`; // Missing "Chapter"
    if (title.length > 100) title = title.slice(0, 100); // Overly long title
    if (title === sections[sections.length - 1]?.title) {
      title += ` (contd.)`; // Duplicate titles
    }

    // Ignore ads, headers, or footers
    if (title.match(/CBSE|Page\s+\d+|Class\s+\d+/i)) return;

    sections.push({
      title,
      content: sec.trim(),
      order: sections.length,
    });
  });

  return sections;
}

module.exports = { extractSectionsFromText };
