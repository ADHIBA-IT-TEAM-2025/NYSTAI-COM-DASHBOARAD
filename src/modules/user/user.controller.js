import prisma from '../../config/db.js';


export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { id: 'asc' },
    });

    res.json({ message: 'All registered users', users });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching users', error: error.message });
  }
};