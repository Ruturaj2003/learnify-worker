const { Worker } = require('bullmq');
const connectToDB = require('./lib/mongodb');
const redis = require('./lib/redis');
const processBook = require('./jobs/processBook');

(async () => {
  try {
    console.log('[WORKER] Connecting to MongoDB...');
    await connectToDB();
    console.log('[WORKER] MongoDB connected successfully.');

    const worker = new Worker(
      'section-queue', // Queue name
      async (job) => {
        console.log(`[WORKER] Job started: ${job.id}`);

        try {
          // Process the book based on job data (URL, bookId, etc.)
          await processBook(job.data.bookId, job.data.fileUrl);

          console.log(`[WORKER] Job completed: ${job.id}`);
        } catch (err) {
          console.error(`[WORKER] Error processing job ${job.id}:`, err);
          // You could also add job failure handling here
        }
      },
      { connection: redis }
    );

    console.log('[WORKER] Waiting for jobs...');

    // Handling worker error
    worker.on('failed', (job, err) => {
      console.error(`[WORKER] Job ${job.id} failed: ${err.message}`);
    });

    worker.on('completed', (job) => {
      console.log(`[WORKER] Job ${job.id} completed successfully.`);
    });
  } catch (err) {
    console.error(
      '[WORKER] Failed to connect to MongoDB or start worker:',
      err
    );
  }
})();
