import express from 'express';
import { authenticate, isAdmin } from '../../middlewares/authMiddleware.js';
import { updateUserRole, getAllUsers } from './user.controller.js';

const router = express.Router();

router.put('/role/:id', authenticate, isAdmin, updateUserRole);
router.get('/', authenticate, isAdmin, getAllUsers);
export default router;
