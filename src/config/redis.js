// redis.js
import Redis from "ioredis";

// Create a Redis client using the REDIS_URL from environment variables
const redis = new Redis(process.env.REDIS_URL);

// Event listeners for debugging and monitoring
redis.on("connect", () => {
  console.log("✅ Connected to Redis successfully!");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

// Export the Redis client to use in other files
export default redis;
