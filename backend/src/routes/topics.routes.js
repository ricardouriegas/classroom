/**
 * Topics API Routes
 * Handles topic creation and management for classes
 */

const express = require('express');
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');
const crypto = require('crypto'); // Use native crypto instead of uuid

// Initialize router
const router = express.Router();

/**
 * Retrieves all topics for a specific class with material and assignment counts
 */
router.get('/class/:classId', authMiddleware, async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if the user has access to this class
    let hasAccess = false;
    
    if (userRole === 'teacher') {
      const [teacherCheck] = await pool.query(
        'SELECT id FROM tbl_classes WHERE id = ? AND teacher_id = ?',
        [classId, userId]
      );
      hasAccess = teacherCheck.length > 0;
    } else if (userRole === 'student') {
      const [studentCheck] = await pool.query(
        'SELECT id FROM tbl_class_enrollments WHERE class_id = ? AND student_id = ?',
        [classId, userId]
      );
      hasAccess = studentCheck.length > 0;
    }

    if (!hasAccess) {
      return res.status(403).json({
        error: {
          message: 'You do not have access to this class',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Get topics with materials and assignments count
    const [topics] = await pool.query(`
      SELECT t.*,
        (SELECT COUNT(*) FROM tbl_materials WHERE topic_id = t.id) as materials_count,
        (SELECT COUNT(*) FROM tbl_assignments WHERE topic_id = t.id) as assignments_count
      FROM tbl_topics t
      WHERE t.class_id = ?
      ORDER BY t.order_index
    `, [classId]);

    res.json(topics);
  } catch (error) {
    console.error('Error getting topics:', error);
    res.status(500).json({
      error: {
        message: 'Error retrieving topics',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * Creates a new topic for a class
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { class_id, name, description } = req.body;
    const userId = req.user.id;

    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        error: {
          message: 'Only teachers can create topics',
          code: 'UNAUTHORIZED_ROLE'
        }
      });
    }

    // Check if the teacher owns this class
    const [teacherCheck] = await pool.query(
      'SELECT id FROM tbl_classes WHERE id = ? AND teacher_id = ?',
      [class_id, userId]
    );
    
    if (teacherCheck.length === 0) {
      return res.status(403).json({
        error: {
          message: 'You do not have permission to add topics to this class',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Validate input
    if (!class_id || !name) {
      return res.status(400).json({
        error: {
          message: 'Class ID and topic name are required',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Find the next order index
    const [maxOrderResult] = await pool.query(
      'SELECT MAX(order_index) as max_order FROM tbl_topics WHERE class_id = ?',
      [class_id]
    );
    
    const nextOrder = (maxOrderResult[0].max_order || 0) + 1;

    // Generate a unique topic ID
    const topicId = crypto.randomUUID();

    // Insert topic into database
    await pool.query(
      'INSERT INTO tbl_topics (id, class_id, name, description, order_index) VALUES (?, ?, ?, ?, ?)',
      [topicId, class_id, name, description || '', nextOrder]
    );

    // Get the created topic
    const [newTopic] = await pool.query(
      'SELECT * FROM tbl_topics WHERE id = ?',
      [topicId]
    );

    res.status(201).json(newTopic[0]);
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({
      error: {
        message: 'Error creating topic',
        code: 'SERVER_ERROR'
      }
    });
  }
});

module.exports = router;
