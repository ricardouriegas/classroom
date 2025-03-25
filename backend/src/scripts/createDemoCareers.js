
require('dotenv').config({ path: '../../.env' });
const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

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

async function createCareers() {
  try {
    console.log('Creating demo careers...');
    
    // Check if careers already exist
    const [existingCareers] = await pool.query('SELECT COUNT(*) as count FROM careers');
    
    if (existingCareers[0].count > 0) {
      console.log('Careers already exist in the database. Skipping creation.');
      process.exit(0);
    }
    
    // Insert careers
    for (const career of careers) {
      const careerId = uuidv4();
      await pool.query(
        'INSERT INTO careers (id, name, description) VALUES (?, ?, ?)',
        [careerId, career.name, career.description]
      );
      console.log(`Created career: ${career.name}`);
    }
    
    console.log('Demo careers created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating demo careers:', error);
    process.exit(1);
  }
}

// Run the function
createCareers();
