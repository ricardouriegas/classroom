/**
 * Materials API Routes
 * Handles course material management operations
 */

const express = require('express');
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { upload, getFileUrl } = require('../utils/fileUpload');
const crypto = require('crypto');

// Create router
const router = express.Router();

/**
 * Get all materials for a class
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

    // Get materials with topic info
    const [materials] = await pool.query(`
      SELECT m.*, t.name as topic_name 
      FROM tbl_materials m
      JOIN tbl_topics t ON m.topic_id = t.id
      WHERE t.class_id = ?
      ORDER BY m.created_at DESC
    `, [classId]);

    // Get attachments for each material
    const formattedMaterials = [];
    for (const material of materials) {
      const [attachments] = await pool.query(`
        SELECT id, file_name, file_size, file_type, file_path
        FROM tbl_material_attachments
        WHERE material_id = ?
      `, [material.id]);

      // Format attachments - map file_path to fileUrl for client consistency
      const formattedAttachments = attachments.map(attachment => ({
        id: attachment.id,
        fileName: attachment.file_name,
        fileSize: attachment.file_size,
        fileType: attachment.file_type,
        fileUrl: attachment.file_path
      }));

      // Format material
      formattedMaterials.push({
        id: material.id,
        title: material.title,
        description: material.description,
        topicId: material.topic_id,
        topicName: material.topic_name,
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
 * Create a new material
 * @route   POST /api/materials
 * @desc    Create a new material with attachments
 * @access  Private (Teachers only)
 */
router.post('/', authMiddleware, upload.array('attachments', 5), async (req, res) => {
  try {
    console.log('Material creation request received:', req.body);
    
    const { title, description, topic_id, class_id } = req.body;
    const userId = req.user.id;
    const files = req.files || [];

    // Debug logs
    console.log('Material creation payload:', { 
      title, 
      description, 
      topic_id, 
      class_id, 
      userID: userId,
      filesCount: files.length 
    });

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
    if (!title || !topic_id || !class_id) {
      return res.status(400).json({
        error: {
          message: 'Title, topic ID, and class ID are required',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Check if topic exists and if the teacher has access to the class
    const [topicCheck] = await pool.query(`
      SELECT t.id, t.name, t.class_id, c.teacher_id 
      FROM tbl_topics t
      JOIN tbl_classes c ON t.class_id = c.id
      WHERE t.id = ? AND t.class_id = ?
    `, [topic_id, class_id]);
    
    if (topicCheck.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Topic not found or does not belong to this class',
          code: 'TOPIC_NOT_FOUND'
        }
      });
    }

    const topic = topicCheck[0];
    
    // Check if the teacher owns the class
    if (topic.teacher_id !== userId) {
      return res.status(403).json({
        error: {
          message: 'You do not have permission to add materials to this class',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Generate a unique material ID
      const materialId = crypto.randomUUID();
      
      // Insert material into database
      await connection.query(
        'INSERT INTO tbl_materials (id, topic_id, title, description, created_by) VALUES (?, ?, ?, ?, ?)',
        [materialId, topic_id, title, description || null, userId]
      );

      // Process material attachments
      const attachments = [];
      for (const file of files) {
        const attachmentId = crypto.randomUUID();
        const filePath = getFileUrl(file.filename);
        
        await connection.query(
          'INSERT INTO tbl_material_attachments (id, material_id, file_name, file_size, file_type, file_path) VALUES (?, ?, ?, ?, ?, ?)',
          [attachmentId, materialId, file.originalname, file.size, file.mimetype, filePath]
        );
        
        attachments.push({
          id: attachmentId,
          fileName: file.originalname,
          fileSize: file.size,
          fileType: file.mimetype,
          fileUrl: filePath
        });
      }

      // Create an announcement for this material
      const announcementId = crypto.randomUUID();
      const announcementTitle = `Nuevo material: ${title}`;
      const announcementContent = `Se ha publicado nuevo material de estudio para el tema "${topic.name}".`;
      
      await connection.query(
        'INSERT INTO tbl_announcements (id, class_id, teacher_id, title, content) VALUES (?, ?, ?, ?, ?)',
        [announcementId, class_id, userId, announcementTitle, announcementContent]
      );

      await connection.commit();

      // Format response
      const material = {
        id: materialId,
        title,
        description: description || null,
        topicId: topic_id,
        topicName: topic.name,
        createdAt: new Date(),
        attachments
      };

      console.log('Material created successfully:', materialId);
      res.status(201).json(material);
    } catch (error) {
      await connection.rollback();
      console.error('Database error during material creation:', error);
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({
      error: {
        message: 'Error creating material: ' + error.message,
        code: 'SERVER_ERROR'
      }
    });
  }
});

module.exports = router;
