/**
 * File Upload Utility
 * Handles file uploads, storage, and validation
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// File upload configuration
class FileUploadManager {
  constructor() {
    this._uploadDirectory = path.join(__dirname, '../../uploads');
    this._supportedFileTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf'
    ];
    this._maxFileSize = process.env.MAX_FILE_SIZE || 5242880; // 5MB
    
    this._createUploadDirectory();
    this._configureStorage();
  }
  
  _createUploadDirectory() {
    if (!fs.existsSync(this._uploadDirectory)) {
      fs.mkdirSync(this._uploadDirectory, { recursive: true });
      console.log(`Created upload directory: ${this._uploadDirectory}`);
    }
  }
  
  _configureStorage() {
    // Storage configuration
    this.storageConfig = multer.diskStorage({
      destination: (_, __, cb) => {
        cb(null, this._uploadDirectory);
      },
      filename: (_, file, cb) => {
        const uniqueId = crypto.randomUUID();
        const fileExtension = path.extname(file.originalname);
        cb(null, `${uniqueId}${fileExtension}`);
      }
    });
    
    // File filter function
    this.fileFilterFunc = (_, file, cb) => {
      if (this._supportedFileTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Unsupported file format: ${file.mimetype}. Only JPEG, PNG, GIF and PDF files are allowed.`), false);
      }
    };
    
    // Create multer instance
    this.uploader = multer({
      storage: this.storageConfig,
      fileFilter: this.fileFilterFunc,
      limits: {
        fileSize: this._maxFileSize
      }
    });
  }
  
  // Public API
  getUploadMiddleware() {
    return this.uploader;
  }
  
  getFileUrl(filename) {
    return `/uploads/${filename}`;
  }
  
  createErrorHandler() {
    return (err, _, res, next) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: {
              message: `File is too large. Maximum size is ${this._maxFileSize / (1024 * 1024)}MB.`,
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
  }
}

// Create and export file upload manager instance
const fileManager = new FileUploadManager();

module.exports = {
  upload: fileManager.getUploadMiddleware(),
  handleUploadError: fileManager.createErrorHandler(),
  getFileUrl: fileManager.getFileUrl
};
