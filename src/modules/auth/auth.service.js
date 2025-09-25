import prisma from '../../config/db.js';
import bcrypt from 'bcryptjs';
import generateToken from '../../utils/generateToken.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
import { transporter } from '../../utils/mailer.js';


export async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: `"NYSTAI Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your OTP',
    html: `<p>Your OTP is <b>${otp}</b></p>`,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('OTP sent:', info.messageId);
  return info;
}

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit
    await prisma.user.update({ where: { email }, data: { otp } });
    await sendOtpEmail(email, otp);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error('❌ OTP send failed:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const registerUser = async ({ name, email, password, confirmPwd }) => {
  if (password !== confirmPwd) throw new Error('Passwords do not match');

  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: { name, email, password: hashedPassword, confirmPwd, role: 'user' },
  });
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = generateToken(user.id, user.role);
  return { user, token };
};

