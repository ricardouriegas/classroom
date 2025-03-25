
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const crypto = require('crypto');

async function createDemoUsers() {
  try {
    console.log('Connecting to database...');
    await pool.getConnection();
    console.log('Connected to database.');

    // Check if users already exist
    const [teacherExists] = await pool.query('SELECT * FROM users WHERE email = ?', ['teacher@example.com']);
    const [studentExists] = await pool.query('SELECT * FROM users WHERE email = ?', ['student@example.com']);

    // Create teacher if doesn't exist
    if (teacherExists.length === 0) {
      const teacherId = crypto.randomUUID();
      const teacherPassword = await bcrypt.hash('password123', 10);
      
      await pool.query(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [teacherId, 'Profesor Demo', 'teacher@example.com', teacherPassword, 'teacher']
      );
      console.log('Created demo teacher account.');
    } else {
      console.log('Demo teacher account already exists.');
    }

    // Create student if doesn't exist
    if (studentExists.length === 0) {
      const studentId = crypto.randomUUID();
      const studentPassword = await bcrypt.hash('password123', 10);
      
      await pool.query(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [studentId, 'Estudiante Demo', 'student@example.com', studentPassword, 'student']
      );
      console.log('Created demo student account.');
    } else {
      console.log('Demo student account already exists.');
    }

    console.log('Demo users setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating demo users:', error);
    process.exit(1);
  }
}

createDemoUsers();
