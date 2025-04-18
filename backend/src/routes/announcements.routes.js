const express = require('express');
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { upload, getFileUrl } = require('../utils/fileUpload');
const crypto = require('crypto');
const path = require('path');

const router = express.Router();

/**
 * @route   POST /api/announcements
 * @desc    Create a new announcement with optional attachments
 * @access  Private (Teachers only)
 */
router.post('/', authMiddleware, upload.array('attachments', 5), async (req, res) => {
  try {
    const { class_id, title, content } = req.body;
    const userId = req.user.id;
    const files = req.files || [];

    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        error: {
          message: 'Only teachers can create announcements',
          code: 'UNAUTHORIZED_ROLE'
        }
      });
    }

    if (!class_id || !title || !content) {
      return res.status(400).json({
        error: {
          message: 'Missing required fields',
          code: 'MISSING_FIELDS'
        }
      });
    }

    const [teacherCheck] = await pool.query(
      'SELECT id FROM tbl_classes WHERE id = ? AND teacher_id = ?',
      [class_id, userId]
    );
    
    if (teacherCheck.length === 0) {
      return res.status(403).json({
        error: {
          message: 'You do not have permission to create announcements for this class',
          code: 'ACCESS_DENIED'
        }
      });
    }

    const announcementId = crypto.randomUUID();
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      await connection.query(
        'INSERT INTO tbl_announcements (id, class_id, teacher_id, title, content) VALUES (?, ?, ?, ?, ?)',
        [announcementId, class_id, userId, title, content]
      );

      const attachments = [];
      for (const file of files) {
        const attachmentId = crypto.randomUUID();
        const filePath = getFileUrl(file.filename);
        
        await connection.query(
          'INSERT INTO tbl_announcement_attachments (id, announcement_id, file_name, file_size, file_type, file_url) VALUES (?, ?, ?, ?, ?, ?)',
          [attachmentId, announcementId, file.originalname, file.size, file.mimetype, filePath]
        );
        
        attachments.push({
          id: attachmentId,
          fileName: file.originalname,
          fileSize: file.size,
          fileType: file.mimetype,
          fileUrl: filePath
        });
      }

      await connection.commit();

      const [teacherInfo] = await pool.query(
        'SELECT name, avatar_url FROM tbl_users WHERE id = ?',
        [userId]
      );

      const announcement = {
        id: announcementId,
        classId: class_id,
        title,
        content,
        authorId: userId,
        authorName: teacherInfo[0].name,
        authorAvatar: teacherInfo[0].avatar_url,
        attachments,
        createdAt: new Date()
      };

      res.status(201).json(announcement);
    } catch (error) {
      await connection.rollback();
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
 * @route   GET /api/announcements/class/:classId
 * @desc    Get all announcements for a class
 * @access  Private (Class members only)
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

    // Get all announcements for the class with author information
    const [announcements] = await pool.query(`
      SELECT a.id, a.title, a.content, a.created_at,
             u.id as author_id, u.name as author_name, u.avatar_url as author_avatar
      FROM tbl_announcements a
      JOIN tbl_users u ON a.teacher_id = u.id
      WHERE a.class_id = ?
      ORDER BY a.created_at DESC
    `, [classId]);

    // Get attachments for each announcement
    const formattedAnnouncements = [];
    for (const announcement of announcements) {
      const [attachments] = await pool.query(`
        SELECT id, file_name, file_size, file_type, file_url
        FROM tbl_announcement_attachments
        WHERE announcement_id = ?
      `, [announcement.id]);

      // Format attachments - map file_url directly
      const formattedAttachments = attachments.map(attachment => ({
        id: attachment.id,
        fileName: attachment.file_name,
        fileSize: attachment.file_size,
        fileType: attachment.file_type,
        fileUrl: attachment.file_url
      }));

      // Format announcement
      formattedAnnouncements.push({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        authorId: announcement.author_id,
        authorName: announcement.author_name,
        authorAvatar: announcement.author_avatar,
        attachments: formattedAttachments,
        createdAt: announcement.created_at
      });
    }

    res.json(formattedAnnouncements);
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

module.exports = router;
