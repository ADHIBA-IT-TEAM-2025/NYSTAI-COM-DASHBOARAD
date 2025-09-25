import { getCachedUsers, clearUserCache } from './user.cache.js';
import prisma from '../../config/db.js';

// Get all users (with cache)
export const getAllUsers = async (req, res) => {
  try {
    const users = await getCachedUsers();
    res.json({ message: 'All registered users', users });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching users',
      error: error.message,
    });
  }
};
