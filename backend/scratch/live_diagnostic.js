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
    console.log('--- LIVE SERVER DIAGNOSTIC ---');
    console.log(`Database: ${process.env.DB_NAME}`);
    
    // 1. Check if column exists
    const colCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'home_section_items' AND column_name = 'is_active';
    `);
    
    if (colCheck.rowCount === 0) {
      console.log('❌ COLUMN MISSING: "is_active" was not found in home_section_items table.');
      console.log('Action: Run "node scratch/add_is_active_column.js"');
    } else {
      console.log('✅ COLUMN EXISTS: "is_active" found.');
    }

    // 2. Check for NULL values
    const nullCheck = await pool.query('SELECT COUNT(*) FROM home_section_items WHERE is_active IS NULL;');
    const nullCount = parseInt(nullCheck.rows[0].count);
    if (nullCount > 0) {
      console.log(`⚠️  DATA ISSUE: ${nullCount} items have NULL visibility status.`);
      console.log('Action: Run "UPDATE home_section_items SET is_active = true WHERE is_active IS NULL;"');
    } else {
      console.log('✅ DATA CONSISTENT: No NULL values found.');
    }

    // 3. Check model (Informational)
    console.log('\n--- NEXT STEPS ---');
    console.log('1. Ensure you uploaded "backend/src/models/HomeSectionItem.js"');
    console.log('2. Ensure you RESTARTED the backend server (e.g., pm2 restart all)');

  } catch (err) {
    console.error('Diagnostic error:', err.message);
  } finally {
    await pool.end();
  }
}

run();
