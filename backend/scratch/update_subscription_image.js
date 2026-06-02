const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const sequelize = require('../src/config/database');
const SectionSetting = require('../src/models/SectionSetting');

async function main() {
  console.log('Updating subscription image setting in database...');
  try {
    await sequelize.authenticate();
    console.log('Connected to database successfully.');

    // Upsert subscription_image
    const [setting, created] = await SectionSetting.upsert({
      key: 'subscription_image',
      value: '/uploads/subscription_banner.png'
    });
    
    console.log(`Subscription image setting updated successfully (Created new: ${created})!`);

  } catch (err) {
    console.error('Error updating subscription image setting:', err);
  } finally {
    await sequelize.close();
  }
}

main();
