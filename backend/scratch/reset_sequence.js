const sequelize = require('../src/config/database');
async function reset() {
  try {
    const [results] = await sequelize.query('SELECT MAX(id) as "maxId" FROM products');
    const maxId = results[0].maxId || 0;
    console.log('Max ID:', maxId);
    
    // Postgres reset sequence
    try {
      await sequelize.query(`SELECT setval(pg_get_serial_sequence('products', 'id'), ${maxId})`);
      console.log('Postgres sequence updated');
    } catch (e) {
      console.log('Could not update Postgres sequence:', e.message);
    }
  } catch (err) {
    console.error('Error resetting sequence:', err);
  } finally {
    process.exit();
  }
}
reset();
