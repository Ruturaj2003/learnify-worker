const Redis = require('ioredis');

const redis = new Redis(
  'rediss://default:AfTLAAIjcDFmZWUwODlmYmJiMDU0M2RiYmRmY2RjZDBiNzY5NzBhY3AxMA@rational-aphid-62667.upstash.io:6379',
  {
    maxRetriesPerRequest: null,
  }
);

module.exports = redis;
