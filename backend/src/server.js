
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');
const { handleUploadError } = require('./utils/fileUpload');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'ClassConnect API running' });
});

// Import and use route modules
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/classes', require('./routes/classes.routes'));
app.use('/api/topics', require('./routes/topics.routes'));

// File upload error handling
app.use(handleUploadError);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: {
      message: err.message || 'Error interno del servidor',
      code: err.code || 'INTERNAL_SERVER_ERROR'
    }
  });
});

// Set port and start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Test database connection
  await testConnection();
});
