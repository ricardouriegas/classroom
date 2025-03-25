
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename
    const uniqueSuffix = crypto.randomUUID();
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  }
});

// Configure file filter
const fileFilter = (req, file, cb) => {
  // Accept images and PDFs
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Only JPEG, PNG and PDF files are allowed.'), false);
  }
};

// Create the multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 5242880 // 5MB default limit
  }
});

// Middleware for handling file upload errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: {
          message: 'File is too large. Maximum size is 5MB.',
          code: 'FILE_TOO_LARGE'
        }
      });
    }
    return res.status(400).json({
      error: {
        message: `Upload error: ${err.message}`,
        code: 'UPLOAD_ERROR'
      }
    });
  } else if (err) {
    return res.status(400).json({
      error: {
        message: err.message || 'Error uploading file',
        code: 'UPLOAD_ERROR'
      }
    });
  }
  next();
};

module.exports = {
  upload,
  handleUploadError
};
