const { Worker } = require('bullmq');
const connectToDB = require('./lib/mongodb');
const redis = require('./lib/redis');
const processBook = require('./jobs/processBook');

(async () => {
  console.log('[WORKER] Connecting to MongoDB...');
  await connectToDB();

  new Worker(
    'section-queue',
    async (job) => {
      console.log(`[WORKER] Job started: ${job.id}`);
      await processBook(job.data);
    },
    { connection: redis }
  );

  console.log('[WORKER] Waiting for jobs...');
})();
