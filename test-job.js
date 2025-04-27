// test-job.js
const { Queue } = require("bullmq");
const Redis = require("ioredis");

const connection = new Redis(
  "rediss://default:AfTLAAIjcDFmZWUwODlmYmJiMDU0M2RiYmRmY2RjZDBiNzY5NzBhY3AxMA@rational-aphid-62667.upstash.io:6379"
); // default localhost:6379
const queue = new Queue("section-queue", { connection });

(async () => {
  await queue.add("process-pdf", {
    bookId: "680ce23e313998c4f5008d10",
    fileUrl:
      "https://utfs.io/f/rsRuktVxg1ysNDeTlk5cvGHtqIDpJOrF3PTo7eZYXVkBjx1y",
  });

  console.log("📬 Job added to queue");
  await queue.close();
  process.exit(0);
})();
