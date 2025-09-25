import { createClient } from "@redis/client";

// Choose URL based on environment
const redisUrl =
  process.env.NODE_ENV === "production"
    ? process.env.REDIS_URL_PROD // Render Redis
    : process.env.REDIS_URL_LOCAL || "redis://localhost:6379"; // Local fallback

const redis = createClient({
  url: redisUrl,
});

redis.on("error", (err) => console.error(" Redis Client Error", err));

await redis.connect();

console.log(`Connected to Redis at ${redisUrl}`);

export default redis;
