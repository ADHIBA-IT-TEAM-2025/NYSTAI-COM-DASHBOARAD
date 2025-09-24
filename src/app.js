import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes.js';
import categoryRoutes from './modules/category/category.routes.js';
import productRoutes from "./modules/product/product.routes.js";
import userRoutes from './modules/user/user.routes.js';
import multer from 'multer';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL);

export default app;

