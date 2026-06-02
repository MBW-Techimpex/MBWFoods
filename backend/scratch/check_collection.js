const sequelize = require('../src/config/database');
async function main() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query("SELECT * FROM collections WHERE slug = 'dosas';");
    console.log('Collection dosas:', results);
  } catch (e) {
    console.error(e);
  } finally {
    await sequelize.close();
  }
}
main();
