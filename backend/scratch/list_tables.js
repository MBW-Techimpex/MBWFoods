const { Pool } = require('pg');
require('dotenv').config({ path: 'backend/.env' });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function listTables() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables in database:');
    console.log(res.rows.map(r => r.table_name).join(', '));
    
    for (const table of res.rows.map(r => r.table_name)) {
      if (table.toLowerCase() === 'orders') {
        const cols = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = '${table}'
        `);
        console.log(`Columns in ${table}:`);
        console.log(cols.rows.map(r => r.column_name).join(', '));
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

listTables();
