const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const crypto = require('crypto');

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: {
          message: 'All fields are required',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Check user existence
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(400).json({
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    const user = users[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(400).json({
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Create JWT payload
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // Antes de firmar el token, aseguramos obtener la clave secreta:
    const jwtSecret = process.env.JWT_SECRET;

    // Sign token
    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar_url: user.avatar_url
          }
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: {
        message: 'Server error during login',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        error: {
          message: 'All fields are required',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Validate role
    if (role !== 'teacher' && role !== 'student') {
      return res.status(400).json({
        error: {
          message: 'Role must be either "teacher" or "student"',
          code: 'INVALID_ROLE'
        }
      });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        error: {
          message: 'User already exists',
          code: 'USER_EXISTS'
        }
      });
    }

    // Generate user ID (UUID v4 format)
    const userId = crypto.randomUUID();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into database
    await pool.query(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [userId, name, email, hashedPassword, role]
    );

    // Create JWT payload
    const payload = {
      id: userId,
      name,
      email,
      role
    };

    // Antes de firmar el token, aseguramos obtener la clave secreta:
    const jwtSecret = process.env.JWT_SECRET;

    // Sign token
    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
      (err, token) => {
        if (err) {
          return res.status(500).send({ error: 'Registration error: ' + err.message });
        }
        res.status(201).json({
          token,
          user: {
            id: userId,
            name,
            email,
            role
          }
        });
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: {
        message: 'Server error during registration',
        code: 'SERVER_ERROR'
      }
    });
  }
});

module.exports = router;
