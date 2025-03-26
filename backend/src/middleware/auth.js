const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: {
          message: 'No token provided, authorization denied',
          code: 'UNAUTHORIZED'
        }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user data to request
    req.user = decoded;
    
    // Check if user exists in database (optional but recommended)
    try {
      const [userExists] = await pool.query('SELECT id FROM users WHERE id = ?', [decoded.id]);
      
      if (userExists.length === 0) {
        console.warn(`Auth Warning: User with ID ${decoded.id} not found in database but has valid token`);
      }
    } catch (dbError) {
      console.error('Database check error in auth middleware:', dbError);
      // Continue despite error - we don't want db errors to prevent auth
    }
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ 
      error: {
        message: 'Token is not valid',
        code: 'INVALID_TOKEN'
      }
    });
  }
};

module.exports = authMiddleware;
