/**
 * Authentication Middleware
 * Verifies user JWT tokens and adds user context to requests
 */

const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * Authentication middleware function
 * @async
 */
const authenticate = async (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;
  
  // Check if token exists
  if (!token) {
    return res.status(401).json({ 
      error: {
        message: 'Authentication required: No token provided',
        code: 'UNAUTHORIZED'
      }
    });
  }

  try {
    // Verify and decode token
    const JWT_SECRET = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach user data to request object
    req.user = decoded;
    
    // Optional: Verify user still exists in database
    await _verifyUserExists(decoded.id);
    
    // Proceed to next middleware/route handler
    next();
  } catch (error) {
    console.error('🔐 Authentication error:', error.message);
    
    // Determine appropriate error response
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: {
          message: 'Token has expired, please login again',
          code: 'TOKEN_EXPIRED'
        }
      });
    }
    
    // Generic token validation error
    return res.status(401).json({ 
      error: {
        message: 'Invalid authentication token',
        code: 'INVALID_TOKEN'
      }
    });
  }
};

/**
 * Helper function to verify user exists in database
 * @private
 */
async function _verifyUserExists(userId) {
  try {
    const [result] = await pool.query(
      'SELECT id FROM tbl_users WHERE id = ?', 
      [userId]
    );
    
    if (result.length === 0) {
      console.warn(`⚠️ Auth warning: User with ID ${userId} has valid token but doesn't exist in database`);
    }
  } catch (dbError) {
    // Log but continue - we don't want DB errors to prevent authentication
    console.error('⚠️ Database check error in auth middleware:', dbError.message);
  }
}

module.exports = authenticate;
