
const express = require('express');
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { upload, getFileUrl } = require('../utils/fileUpload');
const crypto = require('crypto');

const router = express.Router();

/**
 * @route   GET /api/materials/class/:classId
 * @desc    Get all materials for a class
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

    // Get materials with topic info
    const [materials] = await pool.query(`
      SELECT m.*, t.name as topic_name
      FROM materials m
      JOIN topics t ON m.topic_id = t.id
      WHERE m.class_id = ?
      ORDER BY m.created_at DESC
    `, [classId]);

    // Get attachments for each material
    const formattedMaterials = [];
    for (const material of materials) {
      const [attachments] = await pool.query(`
        SELECT id, file_name, file_size, file_type, file_url
        FROM material_attachments
        WHERE material_id = ?
      `, [material.id]);

      // Format attachments
      const formattedAttachments = attachments.map(attachment => ({
        id: attachment.id,
        fileName: attachment.file_name,
        fileSize: attachment.file_size,
        fileType: attachment.file_type,
        fileUrl: attachment.file_url
      }));

      // Format material
      formattedMaterials.push({
        id: material.id,
        classId: material.class_id,
        topicId: material.topic_id,
        topicName: material.topic_name,
        title: material.title,
        description: material.description,
        createdAt: material.created_at,
        attachments: formattedAttachments
      });
    }

    res.json(formattedMaterials);
  } catch (error) {
    console.error('Error getting materials:', error);
    res.status(500).json({
      error: {
        message: 'Error retrieving materials',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * @route   POST /api/materials
 * @desc    Create a new material
 * @access  Private (Teachers only)
 */
router.post('/', authMiddleware, upload.array('attachments', 10), async (req, res) => {
  try {
    const { class_id, topic_id, title, description } = req.body;
    const userId = req.user.id;
    const files = req.files || [];

    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        error: {
          message: 'Only teachers can create materials',
          code: 'UNAUTHORIZED_ROLE'
        }
      });
    }

    // Validate input
    if (!class_id || !topic_id || !title) {
      return res.status(400).json({
        error: {
          message: 'Missing required fields',
          code: 'MISSING_FIELDS'
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
          message: 'You do not have permission to create materials for this class',
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

    // Generate a unique material ID
    const materialId = crypto.randomUUID();
    
    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert material into database
      await connection.query(
        'INSERT INTO materials (id, class_id, topic_id, title, description) VALUES (?, ?, ?, ?, ?)',
        [materialId, class_id, topic_id, title, description || null]
      );

      // Process file attachments
      const attachments = [];
      for (const file of files) {
        const attachmentId = crypto.randomUUID();
        const fileUrl = getFileUrl(file.filename);
        
        await connection.query(
          'INSERT INTO material_attachments (id, material_id, file_name, file_size, file_type, file_url) VALUES (?, ?, ?, ?, ?, ?)',
          [attachmentId, materialId, file.originalname, file.size, file.mimetype, fileUrl]
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
      const material = {
        id: materialId,
        classId: class_id,
        topicId: topic_id,
        topicName: topicInfo[0].name,
        title,
        description: description || null,
        attachments,
        createdAt: new Date()
      };

      res.status(201).json(material);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({
      error: {
        message: 'Error creating material',
        code: 'SERVER_ERROR'
      }
    });
  }
});

module.exports = router;
