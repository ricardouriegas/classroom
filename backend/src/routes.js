/**
 * Routes Registration Module
 * Central module for registering all API routes
 */

// Import all route modules
const authRoutes = require('./routes/auth.routes');
const careerRoutes = require('./routes/careers.routes');
const classRoutes = require('./routes/classes.routes');
const enrollmentRoutes = require('./routes/enrollments.routes');
const topicRoutes = require('./routes/topics.routes');
const announcementRoutes = require('./routes/announcements.routes');
const assignmentRoutes = require('./routes/assignments.routes');
const materialRoutes = require('./routes/materials.routes');

/**
 * Register all API routes with the Express application
 * @param {Object} app - Express application instance
 */
const registerRoutes = (app) => {
  // Authentication routes
  app.use('/api/auth', authRoutes);
  
  // Content management routes
  app.use('/api/careers', careerRoutes);
  app.use('/api/classes', classRoutes);
  app.use('/api/enrollments', enrollmentRoutes);
  app.use('/api/topics', topicRoutes);
  
  // Interaction routes
  app.use('/api/announcements', announcementRoutes);
  app.use('/api/assignments', assignmentRoutes);
  app.use('/api/materials', materialRoutes);
  
  console.log('✅ All routes registered successfully');
};

module.exports = registerRoutes;
