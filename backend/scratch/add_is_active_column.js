const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function run() {
  try {
    console.log(`Connecting to database: ${process.env.DB_NAME}...`);
    await pool.query('ALTER TABLE home_section_items ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;');
    console.log('Column "is_active" added successfully (or already exists).');
  } catch (err) {
    console.error('Error adding column:', err.message);
  } finally {
    await pool.end();
  }
}

run();
