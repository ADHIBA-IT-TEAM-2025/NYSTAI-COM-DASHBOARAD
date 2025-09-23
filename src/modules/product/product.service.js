import prisma from "../../config/db.js";

export const getAllProducts = async () => {
  return await prisma.product.findMany();
};
