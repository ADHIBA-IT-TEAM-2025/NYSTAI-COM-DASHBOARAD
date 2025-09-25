import express from 'express';
import {
  register,
  login,
  forgotPasswordOTP,
  verifyOTP,
  resetPasswordWithOTP,
} from './auth.controller.js';
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  verifyOTPValidation,
} from '../../middlewares/auth.validation.js';
const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPasswordValidation, forgotPasswordOTP);
router.post('/verify-otp', verifyOTPValidation, verifyOTP);
router.post('/reset-password/:token',resetPasswordValidation,resetPasswordWithOTP);

export default router;
