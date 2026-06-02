const sequelize = require('../src/config/database');
const Setting = require('../src/models/Setting');

async function main() {
  try {
    await sequelize.authenticate();
    const siteName = await Setting.findOne({ where: { key: 'site_name' } });
    console.log('Site Name in Database:', siteName ? siteName.value : 'Not Found');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sequelize.close();
  }
}
main();
