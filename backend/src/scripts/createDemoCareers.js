/**
 * Demo Careers Creation Script
 * Populates the database with example academic careers
 */

require('dotenv').config({ path: '../../.env' });
const { pool } = require('../config/db');
const crypto = require('crypto'); // Replace uuid with native crypto

// Career data to be inserted
const careers = [
  {
    name: 'Ingeniería en Sistemas Computacionales',
    description: 'Carrera enfocada en desarrollo de software, redes y sistemas informáticos.'
  },
  {
    name: 'Licenciatura en Administración',
    description: 'Formación en gestión empresarial, recursos humanos y administración organizacional.'
  },
  {
    name: 'Ingeniería Industrial',
    description: 'Optimización de procesos productivos y sistemas industriales.'
  },
  {
    name: 'Licenciatura en Contaduría',
    description: 'Especialización en contabilidad, auditoría y finanzas empresariales.'
  },
  {
    name: 'Ingeniería Mecatrónica',
    description: 'Integración de sistemas mecánicos, electrónicos y de control.'
  },
  {
    name: 'Licenciatura en Psicología',
    description: 'Estudio del comportamiento humano y procesos mentales.'
  }
];

/**
 * Creates demonstration academic careers
 */
async function createCareers() {
  try {
    console.log('📚 Initializing demo careers creation...');
    
    // Check if careers already exist
    const [existingCareers] = await pool.query('SELECT COUNT(*) as count FROM tbl_careers');
    
    if (existingCareers[0].count > 0) {
      console.log('ℹ️ Careers already exist in the database. Skipping creation.');
      process.exit(0);
    }
    
    // Insert each career with a unique ID
    for (const career of careers) {
      const careerId = crypto.randomUUID(); // Use crypto instead of uuidv4
      await pool.query(
        'INSERT INTO tbl_careers (id, name, description) VALUES (?, ?, ?)',
        [careerId, career.name, career.description]
      );
      console.log(`✅ Created career: ${career.name}`);
    }
    
    console.log('🎓 Demo careers created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating demo careers:', error);
    process.exit(1);
  }
}

// Execute the function
createCareers();
