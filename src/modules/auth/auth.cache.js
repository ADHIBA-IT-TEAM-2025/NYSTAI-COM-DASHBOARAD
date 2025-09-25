import redis from '../../config/redis.js';

const USER_CACHE_KEY = 'user';

export const getCachedUser = async email => {
  const data = await redis.get(`${USER_CACHE_KEY}:${email}`);
  return data ? JSON.parse(data) : null;
};

export const setCachedUser = async (email, user) => {
  await redis.set(`${USER_CACHE_KEY}:${email}`, JSON.stringify(user), {
    EX: 60 * 10, // cache for 10 minutes
  });
};

export const clearCachedUser = async email => {
  await redis.del(`${USER_CACHE_KEY}:${email}`);
};
