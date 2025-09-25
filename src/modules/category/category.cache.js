import redis from '../../config/redis.js';
import prisma from '../../config/db.js';

const CATEGORY_CACHE_KEY = 'categories:all';

// Get all categories with cache
export const getCachedCategories = async () => {
  try {
    // Check Redis first
    const cached = await redis.get(CATEGORY_CACHE_KEY);
    if (cached) {
      console.log(' Categories cache hit');
      return JSON.parse(cached);
    }

    console.log(' Categories cache miss, fetching from DB...');
    const categories = await prisma.category.findMany({
      include: {
        products: {
          include: {
            images: true,
          },
        },
      },
    });

    // Store in Redis (1 hour expiry)
    await redis.setEx(CATEGORY_CACHE_KEY, 3600, JSON.stringify(categories));

    return categories;
  } catch (err) {
    console.error(' Error in getCachedCategories:', err);
    throw err;
  }
};

// Invalidate categories cache
export const clearCategoryCache = async () => {
  try {
    await redis.del(CATEGORY_CACHE_KEY);
    console.log(' Categories cache cleared');
  } catch (err) {
    console.error(' Error clearing category cache:', err);
  }
};
