import prisma from "../../config/db.js";
import redisClient from '../../config/redis.js';

export const getAllProducts = async () => {
  return await prisma.product.findMany();
};


async function cacheTest() {
  await redisClient.set("test-key", "Hello Redis!");
  const value = await redisClient.get("test-key");
  console.log("Redis Value:", value);
}

cacheTest();
