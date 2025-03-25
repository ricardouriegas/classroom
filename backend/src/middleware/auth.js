
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
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
    
    next();
  } catch (error) {
    res.status(401).json({ 
      error: {
        message: 'Token is not valid',
        code: 'INVALID_TOKEN'
      }
    });
  }
};

module.exports = authMiddleware;
