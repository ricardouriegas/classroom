/**
 * Demo User Creation Script
 * Creates example teacher and student accounts for testing
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const crypto = require('crypto'); // Replace uuid with native crypto

/**
 * Creates demonstration teacher and student accounts 
 */
async function createDemoUsers() {
  try {
    console.log('📊 Initializing demo user creation...');
    
    // Establish database connection
    const connection = await pool.getConnection();
    console.log('✅ Connected to database successfully');
    
    // Check for existing demo users
    const [teacherExists] = await connection.query(
      'SELECT * FROM tbl_users WHERE email = ?', 
      ['teacher@example.com']
    );
    
    const [studentExists] = await connection.query(
      'SELECT * FROM tbl_users WHERE email = ?', 
      ['student@example.com']
    );

    // Create teacher account if needed
    if (teacherExists.length === 0) {
      const teacherId = crypto.randomUUID(); // Use crypto instead of uuidv4
      const passwordHash = await bcrypt.hash('password123', 10);
      
      await connection.query(
        'INSERT INTO tbl_users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [teacherId, 'Profesor Demo', 'teacher@example.com', passwordHash, 'teacher']
      );
      console.log('✅ Created demo teacher account');
    } else {
      console.log('ℹ️ Demo teacher account already exists');
    }

    // Create student account if needed
    if (studentExists.length === 0) {
      const studentId = crypto.randomUUID(); // Use crypto instead of uuidv4
      const passwordHash = await bcrypt.hash('password123', 10);
      
      await connection.query(
        'INSERT INTO tbl_users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [studentId, 'Estudiante Demo', 'student@example.com', passwordHash, 'student']
      );
      console.log('✅ Created demo student account');
    } else {
      console.log('ℹ️ Demo student account already exists');
    }
    
    connection.release();
    console.log('🎉 Demo users setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating demo users:', error);
    process.exit(1);
  }
}

// Execute the function
createDemoUsers();
