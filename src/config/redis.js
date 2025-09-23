import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => {
  console.log("✅ Connected to Redis!");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

(async () => {
  await redis.set("hello", "world");
  const value = await redis.get("hello");
  console.log("Stored value:", value); // -> "world"
})();
