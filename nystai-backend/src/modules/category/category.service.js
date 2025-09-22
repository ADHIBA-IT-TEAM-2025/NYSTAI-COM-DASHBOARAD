// src/modules/category/category.service.js
import prisma from '../../config/prismaClient.js';

// Create
export const createCategory = async data => {
  return await prisma.category.create({ data });
};

// Read (all)
export const getCategories = async () => {
  return await prisma.category.findMany({
    include: { products: true }, // optional
  });
};

// Read (one by ID)
export const getCategoryById = async id => {
  return await prisma.category.findUnique({
    where: { id: Number(id) },
    include: { products: true }, // optional
  });
};

// Update
export const updateCategory = async (id, data) => {
  return await prisma.category.update({
    where: { id: Number(id) },
    data,
  });
};

// Delete
export const deleteCategory = async id => {
  return await prisma.category.delete({
    where: { id: Number(id) },
  });
};
