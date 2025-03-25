
const express = require('express');
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/classes
 * @desc    Get all classes for the authenticated user
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let classes = [];

    if (userRole === 'teacher') {
      // Get classes where user is a teacher
      const [teacherClasses] = await pool.query(`
        SELECT c.*, car.name as career_name
        FROM classes c
        JOIN careers car ON c.career_id = car.id
        WHERE c.teacher_id = ?
      `, [userId]);
      classes = teacherClasses;
    } else if (userRole === 'student') {
      // Get classes where user is enrolled as a student
      const [studentClasses] = await pool.query(`
        SELECT c.*, car.name as career_name, u.name as teacher_name
        FROM classes c
        JOIN careers car ON c.career_id = car.id
        JOIN users u ON c.teacher_id = u.id
        JOIN class_enrollments e ON c.id = e.class_id
        WHERE e.student_id = ?
      `, [userId]);
      classes = studentClasses;
    }

    res.json(classes);
  } catch (error) {
    console.error('Error getting classes:', error);
    res.status(500).json({
      error: {
        message: 'Error retrieving classes',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * @route   POST /api/classes
 * @desc    Create a new class
 * @access  Private (Teacher only)
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, career_id, semester } = req.body;
    const teacherId = req.user.id;
    
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        error: {
          message: 'Only teachers can create classes',
          code: 'UNAUTHORIZED_ROLE'
        }
      });
    }

    // Validate input
    if (!name || !career_id || !semester) {
      return res.status(400).json({
        error: {
          message: 'Missing required fields',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Generate a unique class ID and class code
    const classId = require('crypto').randomUUID();
    const classCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Insert class into database
    await pool.query(
      'INSERT INTO classes (id, name, description, class_code, career_id, semester, teacher_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [classId, name, description || '', classCode, career_id, semester, teacherId]
    );

    // Get the created class with career info
    const [newClass] = await pool.query(`
      SELECT c.*, car.name as career_name
      FROM classes c
      JOIN careers car ON c.career_id = car.id
      WHERE c.id = ?
    `, [classId]);

    res.status(201).json(newClass[0]);
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({
      error: {
        message: 'Error creating class',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * @route   GET /api/classes/:id
 * @desc    Get a class by ID
 * @access  Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const classId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if the user has access to this class
    let hasAccess = false;
    
    if (userRole === 'teacher') {
      const [teacherCheck] = await pool.query(
        'SELECT id FROM classes WHERE id = ? AND teacher_id = ?',
        [classId, userId]
      );
      hasAccess = teacherCheck.length > 0;
    } else if (userRole === 'student') {
      const [studentCheck] = await pool.query(
        'SELECT id FROM class_enrollments WHERE class_id = ? AND student_id = ?',
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

    // Get class details
    const [classDetails] = await pool.query(`
      SELECT c.*, car.name as career_name, u.name as teacher_name
      FROM classes c
      JOIN careers car ON c.career_id = car.id
      JOIN users u ON c.teacher_id = u.id
      WHERE c.id = ?
    `, [classId]);

    if (classDetails.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Class not found',
          code: 'NOT_FOUND'
        }
      });
    }

    res.json(classDetails[0]);
  } catch (error) {
    console.error('Error getting class details:', error);
    res.status(500).json({
      error: {
        message: 'Error retrieving class details',
        code: 'SERVER_ERROR'
      }
    });
  }
});

module.exports = router;
