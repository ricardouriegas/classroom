
// This is a helper file to show which routes should be added to server.js

// Example of how the routes should be added in server.js:

// Import routes
const authRoutes = require('./routes/auth.routes');
const careersRoutes = require('./routes/careers.routes');
const classesRoutes = require('./routes/classes.routes');
const enrollmentsRoutes = require('./routes/enrollments.routes');
const topicsRoutes = require('./routes/topics.routes');
const announcementsRoutes = require('./routes/announcements.routes');
const assignmentsRoutes = require('./routes/assignments.routes');
const materialsRoutes = require('./routes/materials.routes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/materials', materialsRoutes);
