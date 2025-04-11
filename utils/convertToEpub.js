const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const Epub = require('epub-gen');

const convertToEpub = async (
  pdfBuffer,
  title = 'Untitled',
  author = 'Unknown'
) => {
  const data = await pdfParse(pdfBuffer);

  const textContent = data.text;
  const chapters = textContent
    .split(/(?=Chapter\s+\d+)/i) // Rough chapter split
    .filter(Boolean)
    .map((chapterText, index) => ({
      title: chapterText.split('\n')[0].trim() || `Chapter ${index + 1}`,
      data: chapterText.trim().replace(/\n/g, '<br>'),
    }));

  const outputPath = path.join(
    __dirname,
    `../output/${title.replace(/\s/g, '_')}.epub`
  );

  const options = {
    title,
    author,
    content: chapters,
    output: outputPath,
  };

  await new Epub(options).promise;

  console.log(`[EPUB] Generated: ${outputPath}`);
  return outputPath;
};

module.exports = convertToEpub;
