const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { pool } = require('./config/db'); // Make sure to import pool from db.js

// Import routes
const authRoutes = require('./routes/auth.routes');
const classesRoutes = require('./routes/classes.routes');
const careersRoutes = require('./routes/careers.routes');
const topicsRoutes = require('./routes/topics.routes');
const materialsRoutes = require('./routes/materials.routes');
const assignmentsRoutes = require('./routes/assignments.routes');
const announcementsRoutes = require('./routes/announcements.routes');
const enrollmentsRoutes = require('./routes/enrollments.routes');

// Test database connection
async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
}

// Call test function
testDatabaseConnection();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/enrollments', enrollmentsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'SERVER_ERROR',
    },
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
