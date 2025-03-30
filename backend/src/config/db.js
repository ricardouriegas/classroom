/**
 * Database Configuration Module
 * Sets up MySQL connection pool using environment variables
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Database Configuration
 */
class DatabaseManager {
  constructor() {
    this.config = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '8889', 10),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

    // Create connection pool
    this.connectionPool = mysql.createPool(this.config);
    
    console.log(`Database pool created for ${this.config.database} on ${this.config.host}:${this.config.port}`);
  }

  /**
   * Test database connection
   * @returns {Promise<boolean>} Connection success status
   */
  async testConnection() {
    try {
      const connection = await this.connectionPool.getConnection();
      console.log('✅ Database connection verified successfully');
      connection.release();
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  /**
   * Get the connection pool
   * @returns {Object} MySQL connection pool
   */
  getPool() {
    return this.connectionPool;
  }
}

// Create database manager instance
const dbManager = new DatabaseManager();

module.exports = {
  pool: dbManager.getPool(),
  testConnection: dbManager.testConnection.bind(dbManager)
};
