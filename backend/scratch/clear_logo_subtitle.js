const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const sequelize = require('../src/config/database');

async function main() {
  await sequelize.authenticate();

  // Find actual table name
  const [tables] = await sequelize.query(
    "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"
  );
  console.log('All tables:', tables.map(t => t.tablename).join(', '));

  // Try to find the header config table
  const headerTable = tables.find(t =>
    t.tablename.toLowerCase().includes('header') ||
    t.tablename.toLowerCase().includes('config')
  );

  if (headerTable) {
    console.log('Found header table:', headerTable.tablename);
    // Clear logoSubtitle
    await sequelize.query(
      `UPDATE "${headerTable.tablename}" SET "logoSubtitle" = '', "updatedAt" = NOW()`
    );
    const [rows] = await sequelize.query(`SELECT * FROM "${headerTable.tablename}"`);
    console.log('Updated row:', JSON.stringify(rows[0]));
  } else {
    console.log('No header/config table found. Checking MenuConfigs...');
    try {
      const [rows] = await sequelize.query('SELECT * FROM "MenuConfigs"');
      console.log('MenuConfigs rows:', JSON.stringify(rows));
    } catch (e) {
      console.log('MenuConfigs error:', e.message);
    }
  }

  await sequelize.close();
}

main().catch(e => { console.error(e.message); process.exit(1); });
