import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL
});

// Event listeners
redisClient.on("error", (err) => console.error("❌ Redis connection error:", err));
redisClient.on("connect", () => console.log("✅ Connected to Redis!"));

// Connect
await redisClient.connect();

export default redisClient;
