const { Worker } = require('bullmq');
const redis = require('./lib/redis');
const connectToDB = require('./lib/mongodb');

(async () => {
  console.log('[WORKER] Connecting to MongoDB...');
  await connectToDB();

  console.log('[WORKER] Waiting for jobs...');

  new Worker(
    'section-queue',
    async (job) => {
      console.log(`[WORKER] Job started: ${job.id}`);
      // You can add processing logic here later
    },
    { connection: redis }
  );
})();
