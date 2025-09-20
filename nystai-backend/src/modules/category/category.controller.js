import path from 'path';
import prisma from '../../config/db.js';
import { put } from '@vercel/blob';

// Helper function to generate random suffix
function randomSuffix(length = 6) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

// Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    let bannerUrl = null;
    let iconUrl = null;

    // Upload banner if provided
    if (req.files?.banner) {
      const bannerFile = req.files.banner[0]; // multer single or fields
      const ext = path.extname(bannerFile.originalname);
      const fileName = `category-banner-${Date.now()}-${randomSuffix()}${ext}`;

      const blob = await put(`categories/${fileName}`, bannerFile.buffer, {
        access: 'public',
        token: process.env.VERCEL_BLOB_RW_TOKEN,
      });

      bannerUrl = blob.url;
    }

    // Upload icon if provided
    if (req.files?.icon) {
      const iconFile = req.files.icon[0];
      const ext = path.extname(iconFile.originalname);
      const fileName = `category-icon-${Date.now()}-${randomSuffix()}${ext}`;

      const blob = await put(`categories/${fileName}`, iconFile.buffer, {
        access: 'public',
        token: process.env.VERCEL_BLOB_RW_TOKEN,
      });

      iconUrl = blob.url;
    }

    // Create category with banner and icon
    const category = await prisma.category.create({
      data: { name, bannerUrl, iconUrl },
    });

    res.status(201).json(category);
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({
      message: 'Error creating category',
      error: err.message,
      stack: err.stack,
    });
  }
};

// Get all categories without products
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          include: {
            images: true, // include product images
          },
        },
      },
    });

    // Remove empty products arrays for cleaner response
    const filtered = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      bannerUrl: cat.bannerUrl,
      iconUrl: cat.iconUrl,
      products: cat.products.length > 0 ? cat.products : undefined,
    }));

    res.json(filtered);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get single category by ID without products
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        products: {
          include: {
            images: true,
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Clean response
    const result = {
      id: category.id,
      name: category.name,
      bannerUrl: category.bannerUrl,
      iconUrl: category.iconUrl,
      products: category.products.length > 0 ? category.products : undefined,
    };

    res.json(result);
  } catch (err) {
    console.error('Error fetching category by ID:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const existing = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return res.status(404).json({ message: "Category not found" });
    }

    let bannerUrl = existing.bannerUrl;
    let iconUrl = existing.iconUrl;

    // If new banner uploaded
    if (req.files?.banner) {
      const bannerFile = req.files.banner[0];
      const ext = path.extname(bannerFile.originalname);
      const fileName = `category-banner-${Date.now()}-${randomSuffix()}${ext}`;
      const blob = await put(`categories/${fileName}`, bannerFile.buffer, {
        access: "public",
        token: process.env.VERCEL_BLOB_RW_TOKEN,
      });
      bannerUrl = blob.url;
    }

    // If new icon uploaded
    if (req.files?.icon) {
      const iconFile = req.files.icon[0];
      const ext = path.extname(iconFile.originalname);
      const fileName = `category-icon-${Date.now()}-${randomSuffix()}${ext}`;
      const blob = await put(`categories/${fileName}`, iconFile.buffer, {
        access: "public",
        token: process.env.VERCEL_BLOB_RW_TOKEN,
      });
      iconUrl = blob.url;
    }

    const updated = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name: name || existing.name,
        bannerUrl,
        iconUrl,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Category and related products deleted successfully' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ message: err.message });
  }
};

