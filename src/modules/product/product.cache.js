import redis from "../../config/redis.js";

const PRODUCT_CACHE_KEY = "products";

// Get products from cache
export const getCachedProducts = async () => {
  const data = await redis.get(PRODUCT_CACHE_KEY);
  return data ? JSON.parse(data) : null;
};

// Set products into cache
export const setCachedProducts = async (products) => {
  await redis.set(PRODUCT_CACHE_KEY, JSON.stringify(products), "EX", 60 * 5); 
  // Cache for 5 minutes
};

// Clear product cache (when add/update/delete)
export const clearCachedProducts = async () => {
  await redis.del(PRODUCT_CACHE_KEY);
};
