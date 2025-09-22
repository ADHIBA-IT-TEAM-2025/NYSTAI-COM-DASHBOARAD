import Joi from 'joi';

// Utility to parse CSV strings from form-data into arrays
const parseArrayField = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field; // already an array (rare in form-data)

  // Split by comma, trim spaces, remove empty values
  return field
    .split(',')
    .map(f => f.trim())
    .filter(Boolean);
};

// Middleware
export const parseProductArrays = (req, res, next) => {
  try {
    req.body.keyFeatures = parseArrayField(req.body.keyFeatures);
    req.body.smartIconsText = parseArrayField(req.body.smartIconsText);
    next();
  } catch (err) {
    return res.status(400).json({
      message: 'Invalid keyFeatures or smartIconsText format',
    });
  }
};

// Create product schema
export const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  subName: Joi.string().min(3).max(100).required(),
  code: Joi.string()
    .pattern(/^[A-Za-z0-9-]+$/)
    .required(),
  coverDesc: Joi.string().max(300).required(),
  mainDesc: Joi.string().max(1000).required(),
  categoryId: Joi.number().required(),
  keyFeatures: Joi.array()
    .items(Joi.string().min(2).max(500))
    .min(2)
    .required(),
  smartIconsText: Joi.array()
    .items(Joi.string().min(1).max(50))
    .min(2)
    .max(7)
    .required(),
});

// Update product schema (all optional)
export const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  subName: Joi.string().min(3).max(100),
  code: Joi.string().pattern(/^[A-Za-z0-9-]+$/),
  coverDesc: Joi.string().max(300),
  mainDesc: Joi.string().max(1000),
  categoryId: Joi.number(),
  keyFeatures: Joi.array()
    .items(Joi.string().min(2).max(500))
    .min(2), // removed .max(6)
  smartIconsText: Joi.array()
    .items(Joi.string().min(1).max(50))
    .min(2)
    .max(7),
});

// Middleware for Joi validation
export const validateBody = schema => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

// Product files validation
export const validateProductFiles = (req, res, next) => {
  try {
    // Cover image
    if (req.files?.cover?.length > 1) {
      return res
        .status(400)
        .json({ message: 'Cover image cannot be more than 1' });
    }
    if (req.files?.cover?.[0]?.size > 2 * 1024 * 1024) {
      return res.status(400).json({ message: 'Cover image cannot exceed 2MB' });
    }

    // Gallery images
    if (req.files?.gallery?.length > 3) {
      return res
        .status(400)
        .json({ message: 'Gallery images cannot exceed 3' });
    }
    if (req.files?.gallery) {
      for (const file of req.files.gallery) {
        if (file.size > 2 * 1024 * 1024) {
          return res
            .status(400)
            .json({ message: 'Gallery image cannot exceed 2MB' });
        }
      }
    }

    // Smart icons
    const icons = req.files?.smartIcons || [];
    const texts = req.body.smartIconsText || [];

    if (icons.length && icons.length !== texts.length) {
      return res.status(400).json({
        message: 'Number of smart icons must match the smart text',
      });
    }
    if (icons.length && (icons.length < 2 || icons.length > 7)) {
      return res.status(400).json({
        message: 'Smart icons and text must be between 2 and 7 items',
      });
    }
    for (const file of icons) {
      if (file.size > 2 * 1024 * 1024) {
        return res
          .status(400)
          .json({ message: 'Smart icon image cannot exceed 2MB' });
      }
    }

    next();
  } catch (err) {
    console.error('Product file validation error:', err);
    return res.status(400).json({ message: err.message });
  }
};
