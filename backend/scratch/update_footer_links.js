const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const sequelize = require('../src/config/database');

async function main() {
  console.log('Updating footer links to food categories...');
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // Delete all existing footer links
    await sequelize.query('DELETE FROM footerlinks;');
    console.log('Cleared old footer links.');

    // Insert new food-themed footer links: 3 categories × 6 links each
    const newLinks = [
      // Category 1: Our Menu
      { category: 'Our Menu',       label: 'Breakfast & Lunch',           url: '/category/idlis',              status: 'Active', position: 1 },
      { category: 'Our Menu',       label: 'Dinner & Specials',           url: '/category/dosas',              status: 'Active', position: 2 },
      { category: 'Our Menu',       label: 'Traditional Sweets',          url: '/category/traditional-sweets', status: 'Active', position: 3 },
      { category: 'Our Menu',       label: 'Crunchy Snacks',              url: '/category/snacks',             status: 'Active', position: 4 },
      { category: 'Our Menu',       label: 'South Indian Filter Coffee',  url: '/category/beverages',          status: 'Active', position: 5 },
      { category: 'Our Menu',       label: 'Festival Gift Packs',         url: '/category/traditional-sweets', status: 'Active', position: 6 },

      // Category 2: Quick Links
      { category: 'Quick Links',    label: 'Home',                        url: '/',                            status: 'Active', position: 1 },
      { category: 'Quick Links',    label: 'About Us',                    url: '/about',                       status: 'Active', position: 2 },
      { category: 'Quick Links',    label: 'Our Restaurant',              url: '/#atelier',                    status: 'Active', position: 3 },
      { category: 'Quick Links',    label: 'Contact Us',                  url: '/contact',                     status: 'Active', position: 4 },
      { category: 'Quick Links',    label: 'My Orders',                   url: '/account',                     status: 'Active', position: 5 },
      { category: 'Quick Links',    label: 'Customer Reviews',            url: '/#testimonials',               status: 'Active', position: 6 },

      // Category 3: Support
      { category: 'Support',        label: 'FAQ',                         url: '/#faq',                        status: 'Active', position: 1 },
      { category: 'Support',        label: 'Privacy Policy',              url: '/privacy-policy',              status: 'Active', position: 2 },
      { category: 'Support',        label: 'Terms & Conditions',          url: '/terms-conditions',            status: 'Active', position: 3 },
      { category: 'Support',        label: 'Return Policy',               url: '/return-policy',               status: 'Active', position: 4 },
      { category: 'Support',        label: 'Delivery Information',        url: '/contact',                     status: 'Active', position: 5 },
      { category: 'Support',        label: 'Book a Table',                url: '/#atelier',                    status: 'Active', position: 6 },
    ];

    for (const link of newLinks) {
      await sequelize.query(
        `INSERT INTO footerlinks (category, label, url, status, position, "createdAt", "updatedAt")
         VALUES (:category, :label, :url, :status, :position, NOW(), NOW())`,
        { replacements: link }
      );
    }

    console.log(`✅ Inserted ${newLinks.length} footer links (3 categories × 6 links each).`);

    // Verify
    const [result] = await sequelize.query('SELECT category, label, url FROM footerlinks ORDER BY category, position');
    console.log('\n--- Current Footer Links ---');
    result.forEach(r => console.log(`[${r.category}] ${r.label} → ${r.url}`));

  } catch (err) {
    console.error('Error updating footer links:', err.message);
  } finally {
    await sequelize.close();
  }
}

main();
