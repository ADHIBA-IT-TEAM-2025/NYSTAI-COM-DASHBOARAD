import redis from "../../config/redis.js"; // now works

const PRODUCT_CACHE_KEY = "products";

export const getCachedProducts = async () => {
  const data = await redis.get(PRODUCT_CACHE_KEY);
  return data ? JSON.parse(data) : null;
};

export const setCachedProducts = async (products) => {
  await redis.set(PRODUCT_CACHE_KEY, JSON.stringify(products), 'EX', 60 * 5);
};

export const clearCachedProducts = async () => {
  await redis.del(PRODUCT_CACHE_KEY);
};
