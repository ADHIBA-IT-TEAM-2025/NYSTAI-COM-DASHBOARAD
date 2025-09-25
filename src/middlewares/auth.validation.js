import Joi from 'joi';

//  Reusable password regex
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%!*\-_])[A-Za-z\d@#$%!*\-_]{6,}$/;

export const registerValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string()
      .pattern(/^[A-Za-z\s]+$/) // alphabets + spaces only
      .min(3)
      .max(50)
      .required()
      .messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 3 characters',
        'string.max': 'Name must not exceed 50 characters',
        'string.pattern.base': 'Name can only contain alphabets and spaces',
      }),
    email: Joi.string().email().max(100).required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be valid (example@domain.com)',
      'string.max': 'Email must not exceed 100 characters',
    }),
    password: Joi.string().pattern(passwordRegex).required().messages({
      'string.empty': 'Password is required',
      'string.pattern.base':
        'Password must be at least 6 characters, include uppercase, lowercase, number, and special symbol (@, #, $, %, !, *)',
    }),
  });

  validateRequest(schema, req, res, next);
};

export const loginValidation = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Invalid email format',
    }),
    password: Joi.string().min(6).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters',
    }),
  });

  validateRequest(schema, req, res, next);
};

export const forgotPasswordValidation = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Invalid email format',
    }),
  });

  validateRequest(schema, req, res, next);
};

export const resetPasswordValidation = (req, res, next) => {
  const schema = Joi.object({
    newPassword: Joi.string().pattern(passwordRegex).required().messages({
      'string.empty': 'New password is required',
      'string.pattern.base':
        'Password must be at least 6 characters, include uppercase, lowercase, number, and special symbol',
    }),
    oldPassword: Joi.string().min(6).optional(), // optional if you want to check against old
  });

  validateRequest(schema, req, res, next);
};

export const verifyOTPValidation = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Invalid email format',
    }),
    otp: Joi.string()
      .pattern(/^[0-9]{4}$/) // only 4 digits
      .required()
      .messages({
        'string.empty': 'OTP is required',
        'string.pattern.base': 'OTP must be a 4-digit number',
      }),
  });

  validateRequest(schema, req, res, next);
};

//  Helper for validation
function validateRequest(schema, req, res, next) {
  const { error } = schema.validate(req.body, { abortEarly: true });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}
