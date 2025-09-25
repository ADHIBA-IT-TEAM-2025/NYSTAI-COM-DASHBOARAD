import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct, //  add delete controller
} from './product.controller.js';
import { uploadProductImages } from '../../middlewares/upload.js';
import {
  createProductSchema,
  updateProductSchema,
  validateBody,
  validateProductFiles,
  parseProductArrays,
} from '../../middlewares/product.validation.js';

const router = express.Router();

//  Add Product
router.post('/add',uploadProductImages,parseProductArrays,validateBody(createProductSchema),validateProductFiles,createProduct);

// Update Product
router.put('/update/:id',uploadProductImages,parseProductArrays,validateBody(updateProductSchema),validateProductFiles,updateProduct);

//  Get all Products
router.get('/list', getProducts);

// Get Product by ID
router.get('/get/:id', getProductById);

// Delete Product
router.delete('/delete/:id', deleteProduct);

export default router;
