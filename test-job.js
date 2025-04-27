// test-job.js
const { Queue } = require("bullmq");
const Redis = require("ioredis");

const connection = new Redis(
  "rediss://default:AfTLAAIjcDFmZWUwODlmYmJiMDU0M2RiYmRmY2RjZDBiNzY5NzBhY3AxMA@rational-aphid-62667.upstash.io:6379"
); // default localhost:6379
const queue = new Queue("section-queue", { connection });

(async () => {
  await queue.add("process-pdf", {
    bookId: "680df897b955d2690d6cfa5e",
    fileUrl:
      "https://utfs.io/f/rsRuktVxg1ysKcyndj0sPi8RHJDjqSOdgQf5FNelrB6tMm43",
  });

  console.log("📬 Job added to queue");
  await queue.close();
  process.exit(0);
})();
