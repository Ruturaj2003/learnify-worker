const fs = require('fs');
const convertToEPUB = require('../utils/converToEPUB');
const extractChaptersFromEPUB = require('../utils/extractChaptersFromEPUB');
const downloadPDF = require('../utils/downloadPDF');

module.exports = async ({ bookId, fileUrl }) => {
  const pdfBuffer = await downloadPDF(fileUrl);
  const epubPath = await convertToEPUB(pdfBuffer);
  const epubBuffer = fs.readFileSync(epubPath);

  const count = await extractChaptersFromEPUB(epubBuffer, bookId);
  console.log(`✅ ${count} chapters saved to DB`);

  fs.unlinkSync(epubPath); // delete after processing
  console.log(`🧹 Temp EPUB file deleted`);
};
