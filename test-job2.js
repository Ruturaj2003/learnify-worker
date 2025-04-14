// test-job.js
const { Queue } = require('bullmq');
const Redis = require('ioredis');

const connection = new Redis(
  'rediss://default:AfTLAAIjcDFmZWUwODlmYmJiMDU0M2RiYmRmY2RjZDBiNzY5NzBhY3AxMA@rational-aphid-62667.upstash.io:6379'
); // default localhost:6379
const queue = new Queue('section-queue', { connection });

(async () => {
  await queue.add('process-pdf', {
    bookId: '67fa155a96847e4919ee468c',
    fileUrl:
      'https://kvoeqp987e.ufs.sh/f/rsRuktVxg1ys1VQjErFhtZSY7QmG5zl4ErFq9x8wcy6CoP2u',
  });

  console.log('📬 Job added to queue');
  await queue.close();
  process.exit(0);
})();
