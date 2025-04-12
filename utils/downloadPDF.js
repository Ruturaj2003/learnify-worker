const axios = require('axios');

module.exports = async function downloadPDF(fileUrl) {
  try {
    console.log(`[PDF Download] Downloading: ${fileUrl}`);

    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    console.log(`[PDF Download] Download Complete`);

    return response.data; // return the PDF buffer (data)
  } catch (err) {
    console.error('[PDF Download] Failed to Download PDF:', err.message);
  }
};
