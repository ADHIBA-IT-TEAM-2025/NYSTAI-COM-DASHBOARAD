import express from 'express';
import { getAllUsers } from '../user/user.controller.js';
import { authenticate, isAdmin } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Admin-only route
router.get('/all', authenticate, isAdmin, getAllUsers);

export default router;
