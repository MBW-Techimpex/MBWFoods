const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const sequelize = require('../src/config/database');

async function main() {
  await sequelize.authenticate();
  console.log('Connected. Clearing old footer links...');
  await sequelize.query('DELETE FROM footerlinks;');

  const links = [
    // 1. Breakfast — 4 sub-categories
    { category: 'Breakfast',         label: 'Soft Steamed Idlis',        url: '/category/idlis',              status: 'Active', position: 1 },
    { category: 'Breakfast',         label: 'Golden Ghee Dosas',         url: '/category/dosas',              status: 'Active', position: 2 },
    { category: 'Breakfast',         label: 'Breakfast Combos',          url: '/category/idlis',              status: 'Active', position: 3 },
    { category: 'Breakfast',         label: 'Morning Specials',          url: '/category/idlis',              status: 'Active', position: 4 },

    // 2. Dinner & Specials — 4 sub-categories
    { category: 'Dinner & Specials', label: 'Dinner Specials',           url: '/category/dosas',              status: 'Active', position: 1 },
    { category: 'Dinner & Specials', label: 'Traditional Appetizers',    url: '/category/snacks',             status: 'Active', position: 2 },
    { category: 'Dinner & Specials', label: 'House Specials',            url: '/category/dosas',              status: 'Active', position: 3 },
    { category: 'Dinner & Specials', label: 'Kitchen Stories',           url: '/about',                       status: 'Active', position: 4 },

    // 3. Sweets — 4 sub-categories
    { category: 'Sweets',            label: 'Traditional Sweets',        url: '/category/traditional-sweets', status: 'Active', position: 1 },
    { category: 'Sweets',            label: 'Sweet Mysore Pak',          url: '/category/traditional-sweets', status: 'Active', position: 2 },
    { category: 'Sweets',            label: 'Crunchy Kara Snacks',       url: '/category/snacks',             status: 'Active', position: 3 },
    { category: 'Sweets',            label: 'Filter Coffee & Beverages', url: '/category/beverages',          status: 'Active', position: 4 },
  ];

  for (const l of links) {
    await sequelize.query(
      `INSERT INTO footerlinks (category, label, url, status, position, "createdAt", "updatedAt")
       VALUES (:category, :label, :url, :status, :position, NOW(), NOW())`,
      { replacements: l }
    );
  }

  const [rows] = await sequelize.query(
    'SELECT category, label FROM footerlinks ORDER BY category, position'
  );
  console.log('\n✅ Footer links saved:');
  rows.forEach(r => console.log(`  [${r.category}] ${r.label}`));
  await sequelize.close();
}

main().catch(e => { console.error(e.message); process.exit(1); });
