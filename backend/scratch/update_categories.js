const { Menu } = require('../src/models/Menu');

async function updateCategories() {
  try {
    console.log('Updating Interior -> Interior Accessories...');
    await Menu.update(
      { name: 'Interior Accessories' },
      { where: { name: ['Interior', 'INTERIOR'] } }
    );
    
    console.log('Updating Exterior -> Exterior Accessories...');
    await Menu.update(
      { name: 'Exterior Accessories' },
      { where: { name: ['Exterior', 'EXTERIOR'] } }
    );
    
    console.log('Database Update Successful.');
    process.exit(0);
  } catch (err) {
    console.error('Update failed:', err);
    process.exit(1);
  }
}

updateCategories();
