import redis from '../../config/redis.js';
import prisma from '../../config/db.js';
const USER_CACHE_KEY = 'users:all';

export const getCachedUsers = async () => {
  try {
    // Check Redis first
    const cached = await redis.get(USER_CACHE_KEY);
    if (cached) {
      console.log(' Users cache hit');
      return JSON.parse(cached);
    }

    console.log(' Users cache miss, fetching from DB...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { id: 'asc' },
    });

    // Store in Redis (1 hour expiry)
    await redis.setEx(USER_CACHE_KEY, 3600, JSON.stringify(users));

    return users;
  } catch (err) {
    console.error(' Error in getCachedUsers:', err);
    throw err;
  }
};

export const clearUserCache = async () => {
  try {
    await redis.del(USER_CACHE_KEY);
    console.log(' Users cache cleared');
  } catch (err) {
    console.error(' Error clearing users cache:', err);
  }
};
