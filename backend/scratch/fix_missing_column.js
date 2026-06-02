const { Pool } = require('pg');
require('dotenv').config({ path: 'backend/.env' });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function checkColumns() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders'
    `);
    console.log('Columns in orders table:');
    console.log(res.rows.map(r => r.column_name).join(', '));
    
    // Check if shipping_state exists
    const hasState = res.rows.some(r => r.column_name === 'shipping_state');
    if (!hasState) {
      console.log('Column shipping_state is MISSING. Attempting to add it...');
      await pool.query('ALTER TABLE orders ADD COLUMN shipping_state VARCHAR(255)');
      console.log('Column shipping_state added successfully.');
    } else {
      console.log('Column shipping_state already exists.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkColumns();
