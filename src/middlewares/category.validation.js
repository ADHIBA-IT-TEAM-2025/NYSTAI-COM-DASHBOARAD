import Joi from 'joi';

// Create category schema
export const createCategorySchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'any.required': 'Category name is required',
    'string.empty': 'Category name cannot be empty',
    'string.min': 'Category name should be at least 3 characters',
    'string.max': 'Category name cannot exceed 50 characters',
  }),
});

// Update category schema (partial update)
export const updateCategorySchema = Joi.object({
  name: Joi.string().min(3).max(50).messages({
    'string.empty': 'Category name cannot be empty',
    'string.min': 'Category name should be at least 3 characters',
    'string.max': 'Category name cannot exceed 50 characters',
  }),
});

// Middleware to validate request body
export const validateBody = schema => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

// Middleware to validate banner and icon file sizes
export const validateCategoryFiles = (req, res, next) => {
  try {
    if (req.files?.banner) {
      const banner = req.files.banner[0];
      if (banner.size > 2 * 1024 * 1024) {
        return res
          .status(400)
          .json({ message: 'Banner size should not exceed 2MB' });
      }
    }

    if (req.files?.icon) {
      const icon = req.files.icon[0];
      if (icon.size > 2 * 1024 * 1024) {
        return res
          .status(400)
          .json({ message: 'Icon size should not exceed 2MB' });
      }
    }

    next();
  } catch (err) {
    console.error('File validation error:', err);
    return res.status(400).json({ message: err.message });
  }
};
