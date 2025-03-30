/**
 * Topics API Routes
 * Handles topic creation and management for classes
 */

const express = require('express');
const { pool } = require('../config/db');
const authenticate = require('../middleware/auth');
const crypto = require('crypto'); // Use native crypto instead of uuid

// Initialize router
const router = express.Router();

/**
 * Retrieves all topics for a specific class with material and assignment counts
 */
router.get('/class/:classId', authenticate, async (req, res) => {
  const { classId } = req.params;
  const { id: userId, role: userRole } = req.user;

  try {
    // Validate access to class based on user role
    const hasAccess = await _verifyClassAccess(classId, userId, userRole);
    
    if (!hasAccess) {
      return res.status(403).json({
        error: {
          message: 'Access denied: You do not have permission to view topics for this class',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Fetch topics with related counts
    const topicsQuery = `
      SELECT t.*,
        (SELECT COUNT(*) FROM tbl_materials WHERE topic_id = t.id) as materials_count,
        (SELECT COUNT(*) FROM tbl_assignments WHERE topic_id = t.id) as assignments_count
      FROM tbl_topics t
      WHERE t.class_id = ?
      ORDER BY t.order_index
    `;
    
    const [topics] = await pool.query(topicsQuery, [classId]);
    
    res.json(topics);
  } catch (error) {
    console.error('❌ Error fetching topics:', error);
    res.status(500).json({
      error: {
        message: 'Server error: Failed to retrieve topics',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * Creates a new topic for a class
 */
router.post('/', authenticate, async (req, res) => {
  const { class_id, name, description = '' } = req.body;
  const { id: userId, role: userRole } = req.user;

  try {
    // Validate teacher role
    if (userRole !== 'teacher') {
      return res.status(403).json({
        error: {
          message: 'Permission denied: Only teachers can create topics',
          code: 'UNAUTHORIZED_ROLE'
        }
      });
    }

    // Validate input
    if (!class_id || !name) {
      return res.status(400).json({
        error: {
          message: 'Missing required fields: class_id and name are required',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Verify teacher owns this class
    const ownershipVerified = await _verifyClassOwnership(class_id, userId);
    
    if (!ownershipVerified) {
      return res.status(403).json({
        error: {
          message: 'Permission denied: You are not the teacher of this class',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Determine next order index
    const nextOrderIndex = await _getNextTopicOrderIndex(class_id);
    
    // Generate unique ID and create topic
    const topicId = crypto.randomUUID(); // Use crypto instead of uuid
    
    await pool.query(
      'INSERT INTO tbl_topics (id, class_id, name, description, order_index) VALUES (?, ?, ?, ?, ?)',
      [topicId, class_id, name, description, nextOrderIndex]
    );

    // Fetch created topic
    const [topicResult] = await pool.query(
      'SELECT * FROM tbl_topics WHERE id = ?',
      [topicId]
    );
    
    res.status(201).json(topicResult[0]);
  } catch (error) {
    console.error('❌ Error creating topic:', error);
    res.status(500).json({
      error: {
        message: 'Server error: Failed to create topic',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * Verify if user has access to a class
 * @private
 */
async function _verifyClassAccess(classId, userId, role) {
  if (role === 'teacher') {
    const [teacherCheck] = await pool.query(
      'SELECT id FROM tbl_classes WHERE id = ? AND teacher_id = ?',
      [classId, userId]
    );
    return teacherCheck.length > 0;
  } else if (role === 'student') {
    const [studentCheck] = await pool.query(
      'SELECT id FROM tbl_class_enrollments WHERE class_id = ? AND student_id = ?',
      [classId, userId]
    );
    return studentCheck.length > 0;
  }
  return false;
}

/**
 * Verify if teacher owns a class
 * @private
 */
async function _verifyClassOwnership(classId, teacherId) {
  const [result] = await pool.query(
    'SELECT id FROM tbl_classes WHERE id = ? AND teacher_id = ?',
    [classId, teacherId]
  );
  return result.length > 0;
}

/**
 * Get next order index for topics in a class
 * @private
 */
async function _getNextTopicOrderIndex(classId) {
  const [result] = await pool.query(
    'SELECT MAX(order_index) as max_order FROM tbl_topics WHERE class_id = ?',
    [classId]
  );
  return (result[0].max_order || 0) + 1;
}

module.exports = router;
