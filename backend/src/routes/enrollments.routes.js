const express = require('express');
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

/**
 * @route   GET /api/enrollments/search
 * @desc    Search for students by name or ID
 * @access  Private (Teachers only)
 */
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;
    
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        error: {
          message: 'Only teachers can search for students',
          code: 'UNAUTHORIZED_ROLE'
        }
      });
    }

    if (!query || query.trim() === '') {
      return res.status(400).json({
        error: {
          message: 'Search query is required',
          code: 'MISSING_QUERY'
        }
      });
    }

    // Search for students by name or ID (email)
    const [students] = await pool.query(`
      SELECT id, name, email, avatar_url
      FROM tbl_users
      WHERE role = 'student' AND (
        name LIKE ? OR
        email LIKE ? OR
        id LIKE ?
      )
      LIMIT 10
    `, [`%${query}%`, `%${query}%`, `%${query}%`]);

    // Format response
    const formattedStudents = students.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      avatarUrl: student.avatar_url
    }));

    res.json(formattedStudents);
  } catch (error) {
    console.error('Error searching for students:', error);
    res.status(500).json({
      error: {
        message: 'Error searching for students',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * @route   GET /api/enrollments/class/:classId
 * @desc    Get all students enrolled in a class
 * @access  Private (Class teacher only)
 */
router.get('/class/:classId', authMiddleware, async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user.id;

    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        error: {
          message: 'Only teachers can view class enrollments',
          code: 'UNAUTHORIZED_ROLE'
        }
      });
    }

    // Check if the teacher owns this class
    const [teacherCheck] = await pool.query(
      'SELECT id FROM tbl_classes WHERE id = ? AND teacher_id = ?',
      [classId, userId]
    );
    
    if (teacherCheck.length === 0) {
      return res.status(403).json({
        error: {
          message: 'You do not have permission to view enrollments for this class',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Get all students enrolled in the class
    const [enrolledStudents] = await pool.query(`
      SELECT u.id, u.name, u.email, u.avatar_url, e.enrollment_date
      FROM tbl_class_enrollments e
      JOIN tbl_users u ON e.student_id = u.id
      WHERE e.class_id = ?
      ORDER BY u.name ASC
    `, [classId]);

    // Format response
    const formattedStudents = enrolledStudents.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      avatarUrl: student.avatar_url,
      enrollmentDate: student.enrollment_date
    }));

    res.json(formattedStudents);
  } catch (error) {
    console.error('Error getting enrolled students:', error);
    res.status(500).json({
      error: {
        message: 'Error retrieving enrolled students',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * @route   POST /api/enrollments
 * @desc    Enroll a student in a class
 * @access  Private (Teachers only)
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { classId, studentId } = req.body;
    const userId = req.user.id;

    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        error: {
          message: 'Only teachers can enroll students',
          code: 'UNAUTHORIZED_ROLE'
        }
      });
    }

    // Validate input
    if (!classId || !studentId) {
      return res.status(400).json({
        error: {
          message: 'Class ID and student ID are required',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Check if the teacher owns this class
    const [teacherCheck] = await pool.query(
      'SELECT id FROM tbl_classes WHERE id = ? AND teacher_id = ?',
      [classId, userId]
    );
    
    if (teacherCheck.length === 0) {
      return res.status(403).json({
        error: {
          message: 'You do not have permission to enroll students in this class',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Check if the student exists and is a student
    const [studentCheck] = await pool.query(
      'SELECT id FROM tbl_users WHERE id = ? AND role = "student"',
      [studentId]
    );
    
    if (studentCheck.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Student not found',
          code: 'STUDENT_NOT_FOUND'
        }
      });
    }

    // Check if the student is already enrolled
    const [enrollmentCheck] = await pool.query(
      'SELECT id FROM tbl_class_enrollments WHERE class_id = ? AND student_id = ?',
      [classId, studentId]
    );
    
    if (enrollmentCheck.length > 0) {
      return res.status(400).json({
        error: {
          message: 'Student is already enrolled in this class',
          code: 'ALREADY_ENROLLED'
        }
      });
    }

    // Create enrollment
    const enrollmentId = crypto.randomUUID();
    await pool.query(
      'INSERT INTO tbl_class_enrollments (id, class_id, student_id) VALUES (?, ?, ?)',
      [enrollmentId, classId, studentId]
    );

    // Get student details for response
    const [studentDetails] = await pool.query(`
      SELECT id, name, email, avatar_url
      FROM tbl_users
      WHERE id = ?
    `, [studentId]);

    // Format response
    const enrollment = {
      id: enrollmentId,
      classId,
      student: {
        id: studentDetails[0].id,
        name: studentDetails[0].name,
        email: studentDetails[0].email,
        avatarUrl: studentDetails[0].avatar_url
      },
      enrollmentDate: new Date()
    };

    res.status(201).json(enrollment);
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({
      error: {
        message: 'Error enrolling student',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * @route   DELETE /api/enrollments/:enrollmentId
 * @desc    Remove a student from a class
 * @access  Private (Teachers only)
 */
router.delete('/:classId/:studentId', authMiddleware, async (req, res) => {
  try {
    const { classId, studentId } = req.params;
    const userId = req.user.id;

    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        error: {
          message: 'Only teachers can remove students from classes',
          code: 'UNAUTHORIZED_ROLE'
        }
      });
    }

    // Check if the teacher owns this class
    const [teacherCheck] = await pool.query(
      'SELECT id FROM tbl_classes WHERE id = ? AND teacher_id = ?',
      [classId, userId]
    );
    
    if (teacherCheck.length === 0) {
      return res.status(403).json({
        error: {
          message: 'You do not have permission to remove students from this class',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Check if the enrollment exists
    const [enrollmentCheck] = await pool.query(
      'SELECT id FROM tbl_class_enrollments WHERE class_id = ? AND student_id = ?',
      [classId, studentId]
    );
    
    if (enrollmentCheck.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Student is not enrolled in this class',
          code: 'NOT_ENROLLED'
        }
      });
    }

    // Remove enrollment
    await pool.query(
      'DELETE FROM tbl_class_enrollments WHERE class_id = ? AND student_id = ?',
      [classId, studentId]
    );

    res.json({ message: 'Student removed from class successfully' });
  } catch (error) {
    console.error('Error removing student:', error);
    res.status(500).json({
      error: {
        message: 'Error removing student from class',
        code: 'SERVER_ERROR'
      }
    });
  }
});

module.exports = router;
