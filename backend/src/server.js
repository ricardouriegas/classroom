const express = require('express');
const cors = require('cors');
const path = require('path');

const { pool } = require('./config/db');

const auth_routes = require('./routes/auth.routes');
const class_routes = require('./routes/classes.routes');
const enrollment_routes = require('./routes/enrollments.routes');
const career_routes = require('./routes/careers.routes');
const topic_routes = require('./routes/topics.routes');
const announcement_routes = require('./routes/announcements.routes');

const application = express();
const PORT_NUMBER = process.env.PORT || 3000;

application.use(cors());
application.use(express.json());
application.use(express.urlencoded({ extended: true }));

application.use('/uploads', express.static(path.join(__dirname, '../uploads')));

(async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection established successfully');
    connection.release();
  } catch (err) {
    console.error('❌ Database connection error:', err);
  }
})();

application.use('/api/auth', auth_routes);
application.use('/api/classes', class_routes);
application.use('/api/enrollments', enrollment_routes);
application.use('/api/careers', career_routes);
application.use('/api/topics', topic_routes);
application.use('/api/announcements', announcement_routes);

application.get('/', (_, res) => {
  res.json({ status: 'online', message: 'API is running' });
});

application.listen(PORT_NUMBER, () => {
  console.log(`⚡️ Server running on http://localhost:${PORT_NUMBER}`);
});
