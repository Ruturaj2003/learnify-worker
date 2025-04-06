const { Worker } = require('bullmq');
const axios = require('axios');
const pdfParse = require('pdf-parse');
const redis = require('./lib/redis');
const Segment = require('./models/Segment');
const connectToDB = require('./lib/mongodb');

const processPDF = async (bookId, fileUrl) => {
  console.log(`[WORKER] Connecting to DB...`);
  await connectToDB();

  console.log(`[WORKER] Downloading file: ${fileUrl}`);
  const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });

  console.log(`[WORKER] Parsing PDF...`);
  const data = await pdfParse(response.data);

  console.log(`[WORKER] Splitting into sections...`);
  const sections = data.text
    .split(/(?=Chapter\s+\d+)/i)
    .filter(Boolean)
    .map((text, index) => ({
      title: text.split('\n')[0].trim() || `Section ${index + 1}`,
      content: text.trim(),
      order: index,
    }));

  console.log(`[WORKER] Saving ${sections.length} sections...`);
  for (const section of sections) {
    await Segment.create({ book: bookId, ...section });
  }

  console.log(`✅ Book ${bookId}: ${sections.length} sections processed.`);
};

console.log(`[WORKER] Listening for jobs...`);

new Worker(
  'section-queue',
  async (job) => {
    console.log(`[WORKER] Received job:`, job.id);
    const { bookId, fileUrl } = job.data;
    await processPDF(bookId, fileUrl);
  },
  { connection: redis }
);
