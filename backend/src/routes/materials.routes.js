/**
 * Materials API Routes
 * Handles course material management operations
 */

const express = require('express');
const { pool } = require('../config/db');
const authenticate = require('../middleware/auth');
const { upload, getFileUrl } = require('../utils/fileUpload');
const crypto = require('crypto'); // Replace uuid with native crypto

// Create router
const router = express.Router();

/**
 * Get all materials for a class
 */
router.get('/class/:classId', authenticate, async (req, res) => {
  const classId = req.params.classId;
  const { id: userId, role: userRole } = req.user;

  try {
    // Check access permissions
    const accessValidator = new ClassAccessValidator(pool);
    const hasAccess = await accessValidator.validateAccess(classId, userId, userRole);
    
    if (!hasAccess) {
      return res.status(403).json({
        error: {
          message: 'Access denied: You do not have permission to view materials for this class',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Get materials with related topic info
    const materialsFetcher = new MaterialsFetcher(pool);
    const formattedMaterials = await materialsFetcher.fetchClassMaterials(classId);
    
    res.json(formattedMaterials);
  } catch (error) {
    console.error('❌ Error retrieving materials:', error);
    res.status(500).json({
      error: {
        message: 'Server error: Unable to retrieve materials',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * Create a new material
 */
router.post('/', authenticate, upload.array('attachments', 5), async (req, res) => {
  const { title, description = null, topic_id } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;
  const files = req.files || [];

  try {
    // Check if user is a teacher
    if (userRole !== 'teacher') {
      return res.status(403).json({
        error: {
          message: 'Permission denied: Only teachers can create materials',
          code: 'UNAUTHORIZED_ROLE'
        }
      });
    }

    // Validate required fields
    if (!title || !topic_id) {
      return res.status(400).json({
        error: {
          message: 'Missing required fields: title and topic_id must be provided',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Create material handler instance
    const materialHandler = new MaterialHandler(pool);
    
    // Verify access to topic
    const topicAccess = await materialHandler.verifyTopicAccess(topic_id, userId);
    if (!topicAccess.hasAccess) {
      return res.status(topicAccess.status).json({
        error: {
          message: topicAccess.message,
          code: topicAccess.code
        }
      });
    }

    // Create material with attachments
    const result = await materialHandler.createMaterial({
      title,
      description,
      topicId: topic_id,
      userId,
      files
    });
    
    res.status(201).json(result);
  } catch (error) {
    console.error('❌ Error creating material:', error);
    res.status(500).json({
      error: {
        message: 'Server error: Failed to create material',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * Helper class for access validation
 */
class ClassAccessValidator {
  constructor(dbPool) {
    this.pool = dbPool;
  }

  async validateAccess(classId, userId, role) {
    if (role === 'teacher') {
      const [teacherCheck] = await this.pool.query(
        'SELECT id FROM tbl_classes WHERE id = ? AND teacher_id = ?',
        [classId, userId]
      );
      return teacherCheck.length > 0;
    } else if (role === 'student') {
      const [studentCheck] = await this.pool.query(
        'SELECT id FROM tbl_class_enrollments WHERE class_id = ? AND student_id = ?',
        [classId, userId]
      );
      return studentCheck.length > 0;
    }
    return false;
  }
}

/**
 * Helper class to fetch materials
 */
class MaterialsFetcher {
  constructor(dbPool) {
    this.pool = dbPool;
  }

  async fetchClassMaterials(classId) {
    // Get materials with topic info
    const [materials] = await this.pool.query(`
      SELECT m.*, t.name as topic_name 
      FROM tbl_materials m
      JOIN tbl_topics t ON m.topic_id = t.id
      WHERE t.class_id = ?
      ORDER BY m.created_at DESC
    `, [classId]);

    // Fetch attachments for each material
    const result = [];
    for (const material of materials) {
      const attachments = await this.fetchAttachments(material.id);
      
      result.push({
        id: material.id,
        title: material.title,
        description: material.description,
        topicId: material.topic_id,
        topicName: material.topic_name,
        createdAt: material.created_at,
        attachments
      });
    }
    
    return result;
  }

  async fetchAttachments(materialId) {
    const [attachments] = await this.pool.query(`
      SELECT id, file_name, file_size, file_type, file_url
      FROM tbl_material_attachments
      WHERE material_id = ?
    `, [materialId]);

    return attachments.map(attachment => ({
      id: attachment.id,
      fileName: attachment.file_name,
      fileSize: attachment.file_size,
      fileType: attachment.file_type,
      fileUrl: attachment.file_url
    }));
  }
}

/**
 * Helper class to handle material creation
 */
class MaterialHandler {
  constructor(dbPool) {
    this.pool = dbPool;
  }

  async verifyTopicAccess(topicId, userId) {
    try {
      // Check if topic exists and if user has access
      const [topicCheck] = await this.pool.query(`
        SELECT t.id, t.class_id, c.teacher_id 
        FROM tbl_topics t
        JOIN tbl_classes c ON t.class_id = c.id
        WHERE t.id = ?
      `, [topicId]);
      
      if (topicCheck.length === 0) {
        return {
          hasAccess: false,
          status: 404,
          message: 'Topic not found',
          code: 'TOPIC_NOT_FOUND'
        };
      }

      const topic = topicCheck[0];
      
      if (topic.teacher_id !== userId) {
        return {
          hasAccess: false,
          status: 403,
          message: 'You do not have permission to add materials to this class',
          code: 'ACCESS_DENIED'
        };
      }

      return { hasAccess: true };
    } catch (error) {
      throw error;
    }
  }

  async createMaterial({ title, description, topicId, userId, files }) {
    // Start transaction
    const connection = await this.pool.getConnection();
    await connection.beginTransaction();

    try {
      // Generate ID for material
      const materialId = crypto.randomUUID(); // Use crypto instead of generateUuid
      
      // Insert material record
      await connection.query(
        'INSERT INTO tbl_materials (id, topic_id, title, description, created_by) VALUES (?, ?, ?, ?, ?)',
        [materialId, topicId, title, description, userId]
      );

      // Process attachments
      const attachments = [];
      for (const file of files) {
        const attachmentId = crypto.randomUUID(); // Use crypto instead of generateUuid
        const fileUrl = getFileUrl(file.filename);
        
        await connection.query(
          'INSERT INTO tbl_material_attachments (id, material_id, file_name, file_path, file_size, file_type) VALUES (?, ?, ?, ?, ?, ?)',
          [attachmentId, materialId, file.originalname, fileUrl, file.size, file.mimetype]
        );
        
        attachments.push({
          id: attachmentId,
          fileName: file.originalname,
          fileSize: file.size,
          fileType: file.mimetype,
          fileUrl: fileUrl
        });
      }

      // Get topic name
      const [topicInfo] = await connection.query(
        'SELECT name FROM tbl_topics WHERE id = ?',
        [topicId]
      );

      // Commit transaction
      await connection.commit();

      // Return formatted response
      return {
        id: materialId,
        title,
        description,
        topicId,
        topicName: topicInfo[0].name,
        createdAt: new Date(),
        attachments
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = router;
