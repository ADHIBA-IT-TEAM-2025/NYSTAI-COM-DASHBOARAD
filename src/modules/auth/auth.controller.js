import prisma from '../../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// REGISTER
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

    // Role check (ADMIN_EMAIL from env is admin, all others = USER)
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

// ✅ LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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
      { expiresIn: '1d' }
    );

    // Send response with role-based redirect URL
    res.json({
      message: 'Login successful',
      token,
      role: user.role,
      redirectUrl: user.role === 'ADMIN' ? '/admin' : '/nystai-product', // updated redirect
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// 🔹 Setup mail transporter (Gmail or SMTP)
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
  tls: {
    rejectUnauthorized: false, 
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Email server connection error:', error);
  } else {
    console.log('Email server is ready to take messages');
  }
});

// ✅ FORGOT PASSWORD - Send OTP
export const forgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // ✅ 5 minutes validity

    // Save OTP to DB
    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiry, otpCount: 0 }, // reset count for new OTP
    });

  import path from 'path';

  // ✅ Send OTP email
  await transporter.sendMail({
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset OTP',
    html: `
 <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Password Reset OTP</title>
  </head>
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding:0;">

          <!-- Background section -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:url('cid:bgimage') no-repeat center top / cover; height:220px;">
            <tr>
              <td align="center" valign="middle" style="height:220px;">&nbsp;</td>
            </tr>
          </table>

          <!-- Overlay Card -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin-top:-140px;padding: 40px; background:#fff; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.1); overflow:hidden;">
            
            <!-- Logo -->
            <tr>
              <td align="center" style="padding:20px;">
                <img src="cid:logoimage" alt="NYSTAI Logo" width="160" style="display:block; margin:0 auto;" />
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td align="center" style="padding:30px 40px;">
                <h2 style="margin:0; font-size:22px; font-weight:600; color:#555;">YOUR OTP</h2>
                <p style="margin:12px 0; font-size:16px; color:#333;">Hey ${
                  user.name || 'User'
                }..!</p>
                <p style="margin:12px 0; font-size:14px; color:#666; line-height:1.5;">
                  Use the following OTP to reset your password.<br/>
                  OTP is valid for <strong>1 minutes</strong>. Do not share this code with others,
                  including NYSTAI employees.
                </p>

                <!-- OTP -->
                <p style="font-size:38px; font-weight:bold; color:#d4a017; letter-spacing:12px; margin:24px 0;">
                  ${otp}
                </p>

                <p style="font-size:14px; color:#888; margin:20px 0;">
                  If you didn’t request this, you can ignore this email.
                </p>
                <p style="font-size:13px; color:#666; margin-top:30px;">
                  Need help? <a href="https://nystai.com" style="color:#ff4c4c; text-decoration:none;">Ask at Nystai.com</a>
                </p>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
  `,
    attachments: [
      {
        filename: 'bg-image.png',
        path: path.resolve('src/IMAGE/bg-image.png'), // ✅ fixed path
        cid: 'bgimage',
      },
      {
        filename: 'logo-nystai.png',
        path: path.resolve('src/IMAGE/logo-nystai.png'), // ✅ fixed path
        cid: 'logoimage',
      },
    ],
  });


    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    res
      .status(500)
      .json({ message: 'Error sending OTP', error: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check max attempts
    if ((user.otpCount || 0) >= 4) {
      return res
        .status(400)
        .json({ message: 'Maximum OTP attempts reached. Request a new OTP.' });
    }

    // Check OTP validity
    if (user.otp !== otp || new Date() > user.otpExpiry) {
      // increment otpCount
      await prisma.user.update({
        where: { email },
        data: { otpCount: (user.otpCount || 0) + 1 },
      });
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP is valid → reset otpCount
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

export const resetPasswordWithOTP = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
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
