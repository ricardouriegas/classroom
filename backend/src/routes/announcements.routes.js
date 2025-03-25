const express = require('express');
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { upload, handleUploadError } = require('../utils/fileUpload');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

/**
 * @route   GET /api/announcements/class/:classId
 * @desc    Get all announcements for a class
 * @access  Private (Both teacher and students who are part of the class)
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

    // Get all announcements for the class with user details and attachments
    const [announcements] = await pool.query(`
      SELECT a.id, a.class_id, a.title, a.content, a.created_by, 
             a.created_at, a.updated_at, u.name as author_name, 
             u.role as author_role, u.avatar_url as author_avatar
      FROM announcements a
      JOIN users u ON a.created_by = u.id
      WHERE a.class_id = ?
      ORDER BY a.created_at DESC
    `, [classId]);

    // Get attachments for each announcement
    const announcementsWithAttachments = await Promise.all(
      announcements.map(async (announcement) => {
        const [attachments] = await pool.query(`
          SELECT id, file_name, file_path, file_size, file_type, uploaded_at
          FROM announcement_attachments
          WHERE announcement_id = ?
        `, [announcement.id]);

        // Map attachments to include full URL path
        const mappedAttachments = attachments.map(attachment => ({
          id: attachment.id,
          fileName: attachment.file_name,
          fileUrl: `/uploads/${path.basename(attachment.file_path)}`,
          fileSize: attachment.file_size,
          fileType: attachment.file_type,
          uploadedAt: attachment.uploaded_at
        }));

        return {
          id: announcement.id,
          classId: announcement.class_id,
          title: announcement.title,
          content: announcement.content,
          authorId: announcement.created_by,
          authorName: announcement.author_name,
          authorRole: announcement.author_role,
          authorAvatar: announcement.author_avatar,
          createdAt: announcement.created_at,
          updatedAt: announcement.updated_at,
          attachments: mappedAttachments
        };
      })
    );

    res.json(announcementsWithAttachments);
  } catch (error) {
    console.error('Error getting announcements:', error);
    res.status(500).json({
      error: {
        message: 'Error retrieving announcements',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * @route   POST /api/announcements
 * @desc    Create a new announcement
 * @access  Private (Teachers only)
 */
router.post('/', authMiddleware, upload.array('attachments', 5), handleUploadError, async (req, res) => {
  try {
    const { class_id, title, content } = req.body;
    const userId = req.user.id;
    const files = req.files || [];

    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      // Remove uploaded files if not authorized
      for (const file of files) {
        try {
          await fs.unlink(file.path);
        } catch (err) {
          console.error(`Error deleting file ${file.path}:`, err);
        }
      }

      return res.status(403).json({
        error: {
          message: 'Only teachers can create announcements',
          code: 'UNAUTHORIZED_ROLE'
        }
      });
    }

    // Check if the teacher owns this class
    const [teacherCheck] = await pool.query(
      'SELECT id FROM classes WHERE id = ? AND teacher_id = ?',
      [class_id, userId]
    );
    
    if (teacherCheck.length === 0) {
      // Remove uploaded files if not authorized
      for (const file of files) {
        try {
          await fs.unlink(file.path);
        } catch (err) {
          console.error(`Error deleting file ${file.path}:`, err);
        }
      }

      return res.status(403).json({
        error: {
          message: 'You do not have permission to create announcements for this class',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Validate input
    if (!class_id || !title || !content) {
      // Remove uploaded files if validation fails
      for (const file of files) {
        try {
          await fs.unlink(file.path);
        } catch (err) {
          console.error(`Error deleting file ${file.path}:`, err);
        }
      }

      return res.status(400).json({
        error: {
          message: 'Class ID, title, and content are required',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Generate a unique announcement ID
    const announcementId = crypto.randomUUID();

    // Create connection and start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert announcement
      await connection.query(
        'INSERT INTO announcements (id, class_id, title, content, created_by) VALUES (?, ?, ?, ?, ?)',
        [announcementId, class_id, title, content, userId]
      );

      // Save file attachments if any
      if (files.length > 0) {
        for (const file of files) {
          const attachmentId = crypto.randomUUID();
          await connection.query(
            'INSERT INTO announcement_attachments (id, announcement_id, file_name, file_path, file_size, file_type) VALUES (?, ?, ?, ?, ?, ?)',
            [
              attachmentId,
              announcementId,
              file.originalname,
              file.path,
              file.size,
              file.mimetype
            ]
          );
        }
      }

      // Get enrolled students for notification purposes
      const [enrolledStudents] = await connection.query(
        'SELECT student_id FROM class_enrollments WHERE class_id = ?',
        [class_id]
      );

      // Get class and teacher info for the notification
      const [classInfo] = await connection.query(
        'SELECT c.name as class_name, u.name as teacher_name FROM classes c JOIN users u ON c.teacher_id = u.id WHERE c.id = ?',
        [class_id]
      );

      // Commit transaction
      await connection.commit();

      // Send notifications to students (in a real app, this would use a notification system)
      console.log(`Announcement "${title}" created by ${classInfo[0].teacher_name} in class ${classInfo[0].class_name}`);
      console.log(`Notifying ${enrolledStudents.length} students`);

      // Get the created announcement with user details
      const [announcementDetails] = await pool.query(`
        SELECT a.id, a.class_id, a.title, a.content, a.created_by, 
               a.created_at, a.updated_at, u.name as author_name, 
               u.role as author_role, u.avatar_url as author_avatar
        FROM announcements a
        JOIN users u ON a.created_by = u.id
        WHERE a.id = ?
      `, [announcementId]);

      // Get attachments for the announcement
      const [attachments] = await pool.query(`
        SELECT id, file_name, file_path, file_size, file_type, uploaded_at
        FROM announcement_attachments
        WHERE announcement_id = ?
      `, [announcementId]);

      // Map attachments to include full URL path
      const mappedAttachments = attachments.map(attachment => ({
        id: attachment.id,
        fileName: attachment.file_name,
        fileUrl: `/uploads/${path.basename(attachment.file_path)}`,
        fileSize: attachment.file_size,
        fileType: attachment.file_type,
        uploadedAt: attachment.uploaded_at
      }));

      // Format the response
      const announcement = {
        id: announcementDetails[0].id,
        classId: announcementDetails[0].class_id,
        title: announcementDetails[0].title,
        content: announcementDetails[0].content,
        authorId: announcementDetails[0].created_by,
        authorName: announcementDetails[0].author_name,
        authorRole: announcementDetails[0].author_role,
        authorAvatar: announcementDetails[0].author_avatar,
        createdAt: announcementDetails[0].created_at,
        updatedAt: announcementDetails[0].updated_at,
        attachments: mappedAttachments
      };

      res.status(201).json(announcement);
    } catch (error) {
      // Rollback in case of error
      await connection.rollback();
      
      // Delete uploaded files in case of error
      for (const file of files) {
        try {
          await fs.unlink(file.path);
        } catch (err) {
          console.error(`Error deleting file ${file.path}:`, err);
        }
      }
      
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({
      error: {
        message: 'Error creating announcement',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * @route   DELETE /api/announcements/:id
 * @desc    Delete an announcement
 * @access  Private (Teachers only, and only the teacher who created it or owns the class)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        error: {
          message: 'Only teachers can delete announcements',
          code: 'UNAUTHORIZED_ROLE'
        }
      });
    }

    // Check if the announcement exists and belongs to a class owned by this teacher
    const [announcementCheck] = await pool.query(`
      SELECT a.id, a.class_id, a.created_by, c.teacher_id 
      FROM announcements a
      JOIN classes c ON a.class_id = c.id
      WHERE a.id = ?
    `, [id]);

    if (announcementCheck.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Announcement not found',
          code: 'NOT_FOUND'
        }
      });
    }

    const announcement = announcementCheck[0];
    
    // Check if the teacher created the announcement or owns the class
    if (announcement.created_by !== userId && announcement.teacher_id !== userId) {
      return res.status(403).json({
        error: {
          message: 'You do not have permission to delete this announcement',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Get file paths to delete after DB deletion
    const [attachments] = await pool.query(
      'SELECT file_path FROM announcement_attachments WHERE announcement_id = ?',
      [id]
    );

    const filePaths = attachments.map(attachment => attachment.file_path);

    // Create connection and start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Delete announcement attachments
      await connection.query(
        'DELETE FROM announcement_attachments WHERE announcement_id = ?',
        [id]
      );

      // Delete the announcement
      await connection.query(
        'DELETE FROM announcements WHERE id = ?',
        [id]
      );

      // Commit transaction
      await connection.commit();

      // Delete attachment files from disk
      for (const filePath of filePaths) {
        try {
          await fs.unlink(filePath);
        } catch (err) {
          console.error(`Error deleting file ${filePath}:`, err);
          // Continue with other files even if one fails
        }
      }

      res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
      // Rollback in case of error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({
      error: {
        message: 'Error deleting announcement',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * @route   GET /api/announcements/:id
 * @desc    Get a single announcement by ID
 * @access  Private (Both teacher and students who are part of the class)
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get the announcement with class info
    const [announcementResults] = await pool.query(`
      SELECT a.id, a.class_id, a.title, a.content, a.created_by, 
             a.created_at, a.updated_at, u.name as author_name, 
             u.role as author_role, u.avatar_url as author_avatar
      FROM announcements a
      JOIN users u ON a.created_by = u.id
      WHERE a.id = ?
    `, [id]);

    if (announcementResults.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Announcement not found',
          code: 'NOT_FOUND'
        }
      });
    }

    const announcement = announcementResults[0];
    const classId = announcement.class_id;

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
          message: 'You do not have access to this announcement',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Get attachments for the announcement
    const [attachments] = await pool.query(`
      SELECT id, file_name, file_path, file_size, file_type, uploaded_at
      FROM announcement_attachments
      WHERE announcement_id = ?
    `, [id]);

    // Map attachments to include full URL path
    const mappedAttachments = attachments.map(attachment => ({
      id: attachment.id,
      fileName: attachment.file_name,
      fileUrl: `/uploads/${path.basename(attachment.file_path)}`,
      fileSize: attachment.file_size,
      fileType: attachment.file_type,
      uploadedAt: attachment.uploaded_at
    }));

    // Format the response
    const result = {
      id: announcement.id,
      classId: announcement.class_id,
      title: announcement.title,
      content: announcement.content,
      authorId: announcement.created_by,
      authorName: announcement.author_name,
      authorRole: announcement.author_role,
      authorAvatar: announcement.author_avatar,
      createdAt: announcement.created_at,
      updatedAt: announcement.updated_at,
      attachments: mappedAttachments
    };

    res.json(result);
  } catch (error) {
    console.error('Error getting announcement:', error);
    res.status(500).json({
      error: {
        message: 'Error retrieving announcement',
        code: 'SERVER_ERROR'
      }
    });
  }
});

module.exports = router;
