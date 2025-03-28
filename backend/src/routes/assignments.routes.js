const express = require('express');
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { upload, getFileUrl } = require('../utils/fileUpload');
const crypto = require('crypto');

const router = express.Router();

/**
 * @route   GET /api/assignments/class/:classId
 * @desc    Get all assignments for a class
 * @access  Private
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

    // Get assignments with topic info and submission status for students
    let assignments = [];
    
    if (userRole === 'teacher') {
      const [teacherAssignments] = await pool.query(`
        SELECT a.*, t.name as topic_name, 
               (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id) as submissions_count
        FROM assignments a
        JOIN topics t ON a.topic_id = t.id
        WHERE a.class_id = ?
        ORDER BY a.due_date DESC
      `, [classId]);
      
      assignments = teacherAssignments;
    } else {
      // For students, include submission status
      const [studentAssignments] = await pool.query(`
        SELECT a.*, t.name as topic_name, 
               CASE 
                 WHEN s.id IS NOT NULL THEN 'submitted' 
                 WHEN a.due_date < NOW() THEN 'expired'
                 ELSE 'pending' 
               END as status,
               s.submission_date, s.grade, s.feedback
        FROM assignments a
        JOIN topics t ON a.topic_id = t.id
        LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.student_id = ?
        WHERE a.class_id = ?
        ORDER BY a.due_date DESC
      `, [userId, classId]);
      
      assignments = studentAssignments;
    }

    // Get attachments for each assignment
    const formattedAssignments = [];
    for (const assignment of assignments) {
      const [attachments] = await pool.query(`
        SELECT id, file_name, file_size, file_type, file_url
        FROM assignment_attachments
        WHERE assignment_id = ?
      `, [assignment.id]);

      // Format attachments
      const formattedAttachments = attachments.map(attachment => ({
        id: attachment.id,
        fileName: attachment.file_name,
        fileSize: attachment.file_size,
        fileType: attachment.file_type,
        fileUrl: attachment.file_url
      }));

      // Format assignment
      formattedAssignments.push({
        id: assignment.id,
        classId: assignment.class_id,
        topicId: assignment.topic_id,
        topicName: assignment.topic_name,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.due_date,
        createdAt: assignment.created_at,
        attachments: formattedAttachments,
        // Student-specific fields
        status: assignment.status,
        submissionDate: assignment.submission_date,
        grade: assignment.grade,
        feedback: assignment.feedback,
        // Teacher-specific fields
        submissionsCount: assignment.submissions_count
      });
    }

    res.json(formattedAssignments);
  } catch (error) {
    console.error('Error getting assignments:', error);
    res.status(500).json({
      error: {
        message: 'Error retrieving assignments',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * @route   POST /api/assignments
 * @desc    Create a new assignment
 * @access  Private (Teachers only)
 */
router.post('/', authMiddleware, upload.array('attachments', 5), async (req, res) => {
  try {
    const { class_id, topic_id, title, description, due_date } = req.body;
    const userId = req.user.id;
    const files = req.files || [];

    console.log('Assignment creation payload:', { class_id, topic_id, title, description, due_date, files });

    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        error: {
          message: 'Only teachers can create assignments',
          code: 'UNAUTHORIZED_ROLE'
        }
      });
    }

    // Validate input
    if (!class_id || !topic_id || !title || !description || !due_date) {
      return res.status(400).json({
        error: {
          message: 'Missing required fields',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Check if the due date is in the future
    const dueDate = new Date(due_date);
    if (dueDate <= new Date()) {
      return res.status(400).json({
        error: {
          message: 'Due date must be in the future',
          code: 'INVALID_DUE_DATE'
        }
      });
    }

    // Check if the teacher owns this class
    const [teacherCheck] = await pool.query(
      'SELECT id FROM classes WHERE id = ? AND teacher_id = ?',
      [class_id, userId]
    );
    
    if (teacherCheck.length === 0) {
      return res.status(403).json({
        error: {
          message: 'You do not have permission to create assignments for this class',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Check if the topic exists and belongs to the class
    const [topicCheck] = await pool.query(
      'SELECT id FROM topics WHERE id = ? AND class_id = ?',
      [topic_id, class_id]
    );
    
    if (topicCheck.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Topic not found or does not belong to this class',
          code: 'TOPIC_NOT_FOUND'
        }
      });
    }

    // Generate a unique assignment ID
    const assignmentId = crypto.randomUUID();
    
    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert assignment into database
      // Corrección: Modificar la consulta para coincidir con la estructura real de la base de datos
      await connection.query(
        'INSERT INTO assignments (id, class_id, topic_id, title, instructions, due_date, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [assignmentId, class_id, topic_id, title, description, due_date, userId]
      );

      // Process file attachments
      const attachments = [];
      for (const file of files) {
        const attachmentId = crypto.randomUUID();
        const fileUrl = getFileUrl(file.filename);
        
        await connection.query(
          'INSERT INTO assignment_attachments (id, assignment_id, file_name, file_size, file_type, file_url) VALUES (?, ?, ?, ?, ?, ?)',
          [attachmentId, assignmentId, file.originalname, file.size, file.mimetype, fileUrl]
        );
        
        attachments.push({
          id: attachmentId,
          fileName: file.originalname,
          fileSize: file.size,
          fileType: file.mimetype,
          fileUrl: fileUrl
        });
      }

      await connection.commit();

      // Get topic name for response
      const [topicInfo] = await pool.query(
        'SELECT name FROM topics WHERE id = ?',
        [topic_id]
      );

      // Format response
      const assignment = {
        id: assignmentId,
        classId: class_id,
        topicId: topic_id,
        topicName: topicInfo[0].name,
        title,
        description,
        dueDate: due_date,
        attachments,
        createdAt: new Date()
      };

      res.status(201).json(assignment);
    } catch (error) {
      await connection.rollback();
      console.error('Transaction error:', error);
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({
      error: {
        message: 'Error creating assignment: ' + error.message,
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * @route   POST /api/assignments/:id/submit
 * @desc    Submit an assignment
 * @access  Private (Students only)
 */
router.post('/:id/submit', authMiddleware, upload.array('files', 5), async (req, res) => {
  try {
    const { id: assignmentId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;
    const files = req.files || [];

    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        error: {
          message: 'Only students can submit assignments',
          code: 'UNAUTHORIZED_ROLE'
        }
      });
    }

    // Verify assignment exists
    const [assignmentCheck] = await pool.query(
      `SELECT a.*, c.id as class_id 
       FROM assignments a 
       JOIN classes c ON a.class_id = c.id 
       WHERE a.id = ?`,
      [assignmentId]
    );
    
    if (assignmentCheck.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Assignment not found',
          code: 'ASSIGNMENT_NOT_FOUND'
        }
      });
    }

    const assignment = assignmentCheck[0];
    
    // Check if the student is enrolled in the class
    const [enrollmentCheck] = await pool.query(
      'SELECT id FROM class_enrollments WHERE class_id = ? AND student_id = ?',
      [assignment.class_id, userId]
    );
    
    if (enrollmentCheck.length === 0) {
      return res.status(403).json({
        error: {
          message: 'You are not enrolled in this class',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Check if assignment is past due date
    const dueDate = new Date(assignment.due_date);
    if (dueDate < new Date()) {
      return res.status(400).json({
        error: {
          message: 'Assignment submission deadline has passed',
          code: 'PAST_DUE_DATE'
        }
      });
    }

    // Check if the student has already submitted this assignment
    const [submissionCheck] = await pool.query(
      'SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?',
      [assignmentId, userId]
    );
    
    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      let submissionId;
      
      if (submissionCheck.length > 0) {
        // Submission exists, update it
        submissionId = submissionCheck[0].id;
        
        await connection.query(
          'UPDATE assignment_submissions SET comment = ?, submission_date = NOW(), grade = NULL WHERE id = ?',
          [comment || null, submissionId]
        );
        
        // Delete old submission files
        await connection.query(
          'DELETE FROM submission_files WHERE submission_id = ?',
          [submissionId]
        );
      } else {
        // Create new submission
        submissionId = crypto.randomUUID();
        
        await connection.query(
          'INSERT INTO assignment_submissions (id, assignment_id, student_id, comment, submission_date) VALUES (?, ?, ?, ?, NOW())',
          [submissionId, assignmentId, userId, comment || null]
        );
      }

      // Process submission files
      const submissionFiles = [];
      for (const file of files) {
        const fileId = crypto.randomUUID();
        const fileUrl = getFileUrl(file.filename);
        
        await connection.query(
          'INSERT INTO submission_files (id, submission_id, file_name, file_size, file_type, file_url) VALUES (?, ?, ?, ?, ?, ?)',
          [fileId, submissionId, file.originalname, file.size, file.mimetype, fileUrl]
        );
        
        submissionFiles.push({
          id: fileId,
          fileName: file.originalname,
          fileSize: file.size,
          fileType: file.mimetype,
          fileUrl: fileUrl
        });
      }

      await connection.commit();

      // Format response
      const submission = {
        id: submissionId,
        assignmentId,
        studentId: userId,
        comment,
        submissionDate: new Date(),
        files: submissionFiles
      };

      res.status(201).json(submission);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({
      error: {
        message: 'Error submitting assignment',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * @route   GET /api/assignments/student
 * @desc    Get all assignments for a student across all classes
 * @access  Private (Students only)
 */
router.get('/student', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        error: {
          message: 'This endpoint is only for students',
          code: 'UNAUTHORIZED_ROLE'
        }
      });
    }

    // Get all assignments for the student across all enrolled classes
    const [assignments] = await pool.query(`
      SELECT a.*, t.name as topic_name, c.name as class_name,
             CASE 
               WHEN s.id IS NOT NULL THEN 'submitted' 
               WHEN a.due_date < NOW() THEN 'expired'
               ELSE 'pending' 
             END as status,
             s.submission_date, s.grade, s.feedback
      FROM assignments a
      JOIN topics t ON a.topic_id = t.id
      JOIN classes c ON a.class_id = c.id
      JOIN class_enrollments e ON c.id = e.class_id
      LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.student_id = ?
      WHERE e.student_id = ?
      ORDER BY a.due_date ASC
    `, [userId, userId]);

    // Format the response
    const formattedAssignments = await Promise.all(assignments.map(async (assignment) => {
      // Get assignment attachments
      const [attachments] = await pool.query(`
        SELECT id, file_name, file_size, file_type, file_url
        FROM assignment_attachments
        WHERE assignment_id = ?
      `, [assignment.id]);

      // Format attachments
      const formattedAttachments = attachments.map(attachment => ({
        id: attachment.id,
        fileName: attachment.file_name,
        fileSize: attachment.file_size,
        fileType: attachment.file_type,
        fileUrl: attachment.file_url
      }));

      // Get submission files if this assignment has been submitted
      let submissionFiles = [];
      if (assignment.status === 'submitted') {
        const [submission] = await pool.query(`
          SELECT id FROM assignment_submissions 
          WHERE assignment_id = ? AND student_id = ?
        `, [assignment.id, userId]);
        
        if (submission.length > 0) {
          const [files] = await pool.query(`
            SELECT id, file_name, file_size, file_type, file_url
            FROM submission_files
            WHERE submission_id = ?
          `, [submission[0].id]);
          
          submissionFiles = files.map(file => ({
            id: file.id,
            fileName: file.file_name,
            fileSize: file.file_size,
            fileType: file.file_type,
            fileUrl: file.file_url
          }));
        }
      }

      return {
        id: assignment.id,
        classId: assignment.class_id,
        className: assignment.class_name,
        topicId: assignment.topic_id,
        topicName: assignment.topic_name,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.due_date,
        createdAt: assignment.created_at,
        status: assignment.status,
        submissionDate: assignment.submission_date,
        grade: assignment.grade,
        feedback: assignment.feedback,
        attachments: formattedAttachments,
        submissionFiles
      };
    }));

    res.json(formattedAssignments);
  } catch (error) {
    console.error('Error getting student assignments:', error);
    res.status(500).json({
      error: {
        message: 'Error retrieving student assignments',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * @route   GET /api/assignments/:id/submissions
 * @desc    Get all submissions for an assignment
 * @access  Private (Teachers only)
 */
router.get('/:id/submissions', authMiddleware, async (req, res) => {
  try {
    const { id: assignmentId } = req.params;
    const userId = req.user.id;

    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        error: {
          message: 'Only teachers can view submissions',
          code: 'UNAUTHORIZED_ROLE'
        }
      });
    }

    // Verify assignment exists and belongs to one of the teacher's classes
    const [assignmentCheck] = await pool.query(`
      SELECT a.*, c.id as class_id 
      FROM assignments a 
      JOIN classes c ON a.class_id = c.id 
      WHERE a.id = ? AND c.teacher_id = ?
    `, [assignmentId, userId]);
    
    if (assignmentCheck.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Assignment not found or you do not have access to it',
          code: 'ASSIGNMENT_NOT_FOUND'
        }
      });
    }

    // Get all submissions for this assignment
    const [submissions] = await pool.query(`
      SELECT s.*, u.name as student_name, u.email as student_email, u.avatar_url as student_avatar
      FROM assignment_submissions s
      JOIN users u ON s.student_id = u.id
      WHERE s.assignment_id = ?
      ORDER BY s.submission_date DESC
    `, [assignmentId]);

    // Format the response
    const formattedSubmissions = await Promise.all(submissions.map(async (submission) => {
      // Get submission files
      const [files] = await pool.query(`
        SELECT id, file_name, file_size, file_type, file_url
        FROM submission_files
        WHERE submission_id = ?
      `, [submission.id]);
      
      const formattedFiles = files.map(file => ({
        id: file.id,
        fileName: file.file_name,
        fileSize: file.file_size,
        fileType: file.file_type,
        fileUrl: file.file_url
      }));

      return {
        id: submission.id,
        assignmentId: submission.assignment_id,
        student: {
          id: submission.student_id,
          name: submission.student_name,
          email: submission.student_email,
          avatarUrl: submission.student_avatar
        },
        comment: submission.comment,
        submissionDate: submission.submission_date,
        grade: submission.grade,
        feedback: submission.feedback,
        files: formattedFiles
      };
    }));

    res.json(formattedSubmissions);
  } catch (error) {
    console.error('Error getting assignment submissions:', error);
    res.status(500).json({
      error: {
        message: 'Error retrieving assignment submissions',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * @route   POST /api/assignments/:submissionId/grade
 * @desc    Grade a student's assignment submission
 * @access  Private (Teachers only)
 */
router.post('/:submissionId/grade', authMiddleware, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;
    const userId = req.user.id;

    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        error: {
          message: 'Only teachers can grade submissions',
          code: 'UNAUTHORIZED_ROLE'
        }
      });
    }

    // Validate input
    if (grade === undefined || grade === null || isNaN(parseInt(grade)) || parseInt(grade) < 0 || parseInt(grade) > 100) {
      return res.status(400).json({
        error: {
          message: 'Grade must be a number between 0 and 100',
          code: 'INVALID_GRADE'
        }
      });
    }

    // Verify submission exists and belongs to a class taught by this teacher
    const [submissionCheck] = await pool.query(`
      SELECT s.*, a.class_id
      FROM assignment_submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN classes c ON a.class_id = c.id
      WHERE s.id = ? AND c.teacher_id = ?
    `, [submissionId, userId]);
    
    if (submissionCheck.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Submission not found or you do not have access to it',
          code: 'SUBMISSION_NOT_FOUND'
        }
      });
    }

    // Update submission with grade and feedback
    await pool.query(
      'UPDATE assignment_submissions SET grade = ?, feedback = ? WHERE id = ?',
      [grade, feedback || null, submissionId]
    );

    // Get updated submission info
    const [updatedSubmission] = await pool.query(`
      SELECT s.*, a.title as assignment_title, u.name as student_name, u.email as student_email
      FROM assignment_submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN users u ON s.student_id = u.id
      WHERE s.id = ?
    `, [submissionId]);

    // Format response
    const graded = {
      id: updatedSubmission[0].id,
      assignmentId: updatedSubmission[0].assignment_id,
      assignmentTitle: updatedSubmission[0].assignment_title,
      studentId: updatedSubmission[0].student_id,
      studentName: updatedSubmission[0].student_name,
      studentEmail: updatedSubmission[0].student_email,
      submissionDate: updatedSubmission[0].submission_date,
      grade: updatedSubmission[0].grade,
      feedback: updatedSubmission[0].feedback
    };

    res.json(graded);
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({
      error: {
        message: 'Error grading submission',
        code: 'SERVER_ERROR'
      }
    });
  }
});

module.exports = router;
