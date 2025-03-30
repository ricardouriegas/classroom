const express = require('express');
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/careers
 * @desc    Get all careers
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Get all careers from database
    const [careers] = await pool.query('SELECT id, name, description FROM tbl_careers ORDER BY name');
    
    res.json(careers);
  } catch (error) {
    console.error('Error getting careers:', error);
    res.status(500).json({
      error: {
        message: 'Error retrieving careers',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * @route   GET /api/careers/:id
 * @desc    Get a career by ID
 * @access  Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const careerId = req.params.id;
    
    // Get career by ID
    const [career] = await pool.query('SELECT id, name, description FROM tbl_careers WHERE id = ?', [careerId]);
    
    if (career.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Career not found',
          code: 'NOT_FOUND'
        }
      });
    }
    
    res.json(career[0]);
  } catch (error) {
    console.error('Error getting career:', error);
    res.status(500).json({
      error: {
        message: 'Error retrieving career',
        code: 'SERVER_ERROR'
      }
    });
  }
});

module.exports = router;
