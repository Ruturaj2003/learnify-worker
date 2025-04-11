const fs = require('fs');
const path = require('path');
const os = require('os');
const pdfParse = require('pdf-parse');
const Epub = require('epub-gen');

module.exports = async function convertToEPUB(pdfBuffer) {
  console.log('[EPUB] Parsing PDF...');
  const data = await pdfParse(pdfBuffer);
  const text = data.text?.trim();

  if (!text || text.length < 100) {
    throw new Error('[EPUB ❌] Invalid text content.');
  }

  console.log('[EPUB] Generating temporary file path...');
  const tempFilePath = path.join(os.tmpdir(), `book-${Date.now()}.epub`);

  console.log('[EPUB] Creating EPUB file...');
  const options = {
    title: 'Converted Book',
    author: 'Unknown',
    output: tempFilePath,
    content: [
      {
        title: 'Full Text',
        data: `<p>${text.replace(/\n/g, '<br>')}</p>`,
      },
    ],
  };

  await new Epub(options).promise;
  console.log(`[EPUB ✅] EPUB saved at: ${tempFilePath}`);

  return tempFilePath;
};
