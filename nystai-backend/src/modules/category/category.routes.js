import express from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from './category.controller.js';
import { uploadCategoryFiles } from '../../middlewares/upload.js';
import {
  createCategorySchema,
  updateCategorySchema,
  validateBody,
  validateCategoryFiles,
} from '../../middlewares/category.validation.js';

const router = express.Router();

// ➕ Add Category
router.post(
  '/add',
  uploadCategoryFiles,
  validateBody(createCategorySchema),
  validateCategoryFiles,
  createCategory
);

// ✏️ Update Category
router.put(
  '/update/:id',
  uploadCategoryFiles,
  validateBody(updateCategorySchema),
  validateCategoryFiles,
  updateCategory
);

// 📋 Get all categories
router.get('/list', getCategories);

// 🔍 Get category by ID
router.get('/get/:id', getCategoryById);

// ❌ Delete category
router.delete('/delete/:id', deleteCategory);


export default router;
