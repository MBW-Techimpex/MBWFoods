const sequelize = require('../src/config/database');

async function main() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query('SELECT * FROM collections;');
    console.log('Collections Table contents:');
    console.log(results);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sequelize.close();
  }
}
main();
