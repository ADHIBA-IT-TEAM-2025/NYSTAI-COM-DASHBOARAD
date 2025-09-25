import prisma from '../../config/db.js';
import bcrypt from 'bcryptjs';
import generateToken from '../../utils/generateToken.js';

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
