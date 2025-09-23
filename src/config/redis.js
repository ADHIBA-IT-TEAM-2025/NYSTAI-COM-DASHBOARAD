import { createClient } from '@redis/client';

const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on('error', (err) => console.error('Redis Client Error', err));

await redis.connect();

console.log('✅ Connected to Redis!');

export default redis; // ✅ Export default so imports work
