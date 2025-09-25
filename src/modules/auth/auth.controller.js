import prisma from '../../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendOtpEmail } from './auth.service.js';

// --- REGISTER ---
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const role =
      email.toLowerCase().trim() ===
      process.env.ADMIN_EMAIL.toLowerCase().trim()
        ? 'ADMIN'
        : 'USER';

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
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

// --- LOGIN ---
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

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

// --- SEND OTP ---
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit

await prisma.user.update({
  where: { email },
  data: {
    otp: otp.toString(), // convert number to string
    otpExpiry: new Date(Date.now() + 5 * 60 * 1000), // 5 min expiry
    otpCount: 0,
  },
});


    await sendOtpEmail(email, otp);

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error('❌ OTP send failed:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- VERIFY OTP ---
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if ((user.otpCount || 0) >= 4) {
      return res
        .status(400)
        .json({ message: 'Maximum OTP attempts reached. Request a new OTP.' });
    }

    if (user.otp !== otp || new Date() > user.otpExpiry) {
   await prisma.user.update({
     where: { email },
     data: {
       otp: otp.toString(), // convert number to string
       otpExpiry: new Date(Date.now() + 5 * 60 * 1000), // 5 min expiry
       otpCount: 0,
     },
   });

      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

 await prisma.user.update({
   where: { email },
   data: {
     otp: otp.toString(), // convert number to string
     otpExpiry: new Date(Date.now() + 5 * 60 * 1000), // 5 min expiry
     otpCount: 0,
   },
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

// --- RESET PASSWORD ---
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
