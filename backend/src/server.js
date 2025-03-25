require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth.routes');
const classesRoutes = require('./routes/classes.routes');
const topicsRoutes = require('./routes/topics.routes');
const careersRoutes = require('./routes/careers.routes');
const announcementsRoutes = require('./routes/announcements.routes');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set static folder for file uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/announcements', announcementsRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('ClassConnect API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: {
      message: 'Something went wrong!',
      code: 'SERVER_ERROR'
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
