const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const sequelize = require('../src/config/database');
const Testimonial = require('../src/models/Testimonial');

async function main() {
  console.log('Updating testimonial images in database to high-resolution assets...');
  try {
    await sequelize.authenticate();
    console.log('Connected to database successfully.');

    // Update Priya Ramanathan testimonial
    const [updatedPriya] = await Testimonial.update(
      { image: '/uploads/priya_ramanathan.png' },
      { where: { name: 'Priya Ramanathan' } }
    );
    console.log(`Priya Ramanathan testimonial updated: ${updatedPriya}`);

    // Update Umesh Vaidya testimonial
    const [updatedUmesh] = await Testimonial.update(
      { image: '/uploads/umesh_vaidya.png' },
      { where: { name: 'Umesh Vaidya' } }
    );
    console.log(`Umesh Vaidya testimonial updated: ${updatedUmesh}`);

    console.log('All testimonial images updated to high-quality locally hosted PNG assets successfully!');

  } catch (err) {
    console.error('Error updating testimonial images:', err);
  } finally {
    await sequelize.close();
  }
}

main();
