import multer from 'multer';

const storage = multer.memoryStorage();

// Multer upload: 2MB max
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max per file
});

// Category uploads
export const uploadCategoryFiles = (req, res, next) => {
  const uploader = upload.fields([
    { name: 'banner', maxCount: 1 },
    { name: 'icon', maxCount: 1 },
  ]);

  uploader(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          message: `Too many files for field "${err.field}"`,
        });
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        const field = err.field;
        let message = '';
        if (field === 'banner') message = 'Banner size should not exceed 2MB';
        else if (field === 'icon') message = 'Icon size should not exceed 2MB';
        else message = `${field} size should not exceed 2MB`;
        return res.status(400).json({ message });
      }
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};


// Wrapper to catch multer errors and return JSON
export const uploadProductImages = (req, res, next) => {
  const uploader = upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'gallery', maxCount: 3 },
    { name: 'smartIcons', maxCount: 7 },
  ]);

  uploader(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Too many files
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          message: `Too many files for field "${err.field}"`,
        });
      }
      // File size limit
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: `File "${err.field}" is too large. Max 2MB allowed`,
        });
      }
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};
