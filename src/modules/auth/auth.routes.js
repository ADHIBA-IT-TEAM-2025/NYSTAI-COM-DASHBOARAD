import express from 'express';
import {
  register,
  login,
  verifyOTP,
  // forgotPasswordOTP,
  resetPasswordWithOTP,
  sendOtp
} from './auth.controller.js';

const router = express.Router();

router.post('/register', register);       // ✅ POST /api/auth/register
router.post('/login', login);        
router.post('/send-otp', sendOtp);     // ✅ POST /api/auth/login
router.post('/verify-otp', verifyOTP);
// router.post('/forgot-password', forgotPasswordOTP);
router.post('/reset-password/:token', resetPasswordWithOTP);

export default router;
