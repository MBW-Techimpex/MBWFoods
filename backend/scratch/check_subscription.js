const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const sequelize = require('../src/config/database');
const SectionSetting = require('../src/models/SectionSetting');

async function main() {
  try {
    await sequelize.authenticate();
    const results = await SectionSetting.findAll({
      where: {
        key: {
          [require('sequelize').Op.like]: 'subscription%'
        }
      }
    });
    console.log(results.map(r => r.toJSON()));
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}
main();
