// src/utils/mailer.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App password
  },
});

transporter
  .verify()
  .then(() => console.log('✅ Mail transporter ready'))
  .catch(err => console.error('❌ Mail transporter error:', err));
