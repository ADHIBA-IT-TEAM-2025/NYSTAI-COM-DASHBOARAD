import prisma from '../../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import path from 'path';
import { getCachedUser, setCachedUser, clearCachedUser } from './auth.cache.js';

// ✅ REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Role check
    const role =
      email.toLowerCase().trim() ===
      process.env.ADMIN_EMAIL.toLowerCase().trim()
        ? 'ADMIN'
        : 'USER';

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });
    await clearUserCache(); // invalidate cache

    // ✅ Cache user
    await setCachedUser(email, {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error registering user', error: error.message });
  }
};

// ✅ LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // First check Redis cache
    let user = await getCachedUser(email);

    if (!user) {
      user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      await setCachedUser(email, user);
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      }
    );

    res.json({
      message: 'Login successful',
      token,
      role: user.role,
      redirectUrl: user.role === 'ADMIN' ? '/admin' : '/nystai-product',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// ✅ NODEMAILER TRANSPORT
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Email server connection error:', error);
  } else {
    console.log('Email server is ready to take messages');
  }
});

// ✅ FORGOT PASSWORD - OTP
export const forgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiry, otpCount: 0 },
    });

    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP',
      html: `<h2>Your OTP: ${otp}</h2><p>Valid for 5 minutes.</p>`,
    });

    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error sending OTP', error: error.message });
  }
};

// ✅ VERIFY OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if ((user.otpCount || 0) >= 4) {
      return res.status(400).json({ message: 'Maximum OTP attempts reached.' });
    }

    if (user.otp !== otp || new Date() > user.otpExpiry) {
      await prisma.user.update({
        where: { email },
        data: { otpCount: (user.otpCount || 0) + 1 },
      });
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await prisma.user.update({
      where: { email },
      data: { otpCount: 0 },
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    res.json({ message: 'OTP verified', token });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error verifying OTP', error: error.message });
  }
};

// ✅ RESET PASSWORD
export const resetPasswordWithOTP = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword, otp: null, otpExpiry: null },
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res
      .status(400)
      .json({ message: 'Invalid or expired token', error: error.message });
  }
};
