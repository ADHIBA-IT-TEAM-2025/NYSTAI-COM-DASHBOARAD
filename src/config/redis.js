import Redis from "ioredis";

// Connect using REDIS_URL from environment
const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on("connect", () => console.log("✅ Connected to Redis!"));
redisClient.on("error", (err) => console.error("❌ Redis connection error:", err));

export default redisClient;
