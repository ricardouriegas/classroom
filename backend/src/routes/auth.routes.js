const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

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
    const [users] = await pool.query('SELECT * FROM tbl_users WHERE email = ?', [email]);
    
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

    // Get the JWT secret
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

module.exports = router;
