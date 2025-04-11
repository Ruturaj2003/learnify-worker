const axios = require('axios');

module.exports = async function downloadPDF(fileUrl) {
  console.log('[WORKER] Downloading PDF:', fileUrl);
  const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
  return response.data;
};
