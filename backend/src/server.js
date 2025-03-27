
const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool } = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth.routes');
const classesRoutes = require('./routes/classes.routes');
const enrollmentsRoutes = require('./routes/enrollments.routes');
const careersRoutes = require('./routes/careers.routes');
const topicsRoutes = require('./routes/topics.routes');
const announcementsRoutes = require('./routes/announcements.routes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
// Make sure the path is accessible from the frontend
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('Connected to MySQL database!');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to MySQL database:', err);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/announcements', announcementsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
