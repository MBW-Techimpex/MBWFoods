const path = require('path');
const sequelize = require('../src/config/database');

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Helper to query table
    const query = async (sql) => {
      const [results] = await sequelize.query(sql);
      return results;
    };

    console.log('\n--- SETTINGS ---');
    const settings = await query("SELECT id, key, value FROM settings WHERE key IN ('site_name', 'site_description', 'announcement_text');");
    console.log(settings);

    console.log('\n--- BANNERS ---');
    const banners = await query('SELECT id, title, subtitle, image, type FROM banners;');
    console.log(banners);

    console.log('\n--- CATEGORIES ---');
    const categories = await query('SELECT id, name, count, image, status FROM "Categories";');
    console.log(categories);

    console.log('\n--- BENEFITS (WHY CHOOSE US) ---');
    const benefits = await query('SELECT id, title, description, icon, status FROM "Benefits";');
    console.log(benefits);

    console.log('\n--- FAQS ---');
    const faqs = await query('SELECT id, question, answer, status FROM "Faqs";');
    console.log(faqs);

    console.log('\n--- TESTIMONIALS ---');
    const testimonials = await query('SELECT id, name, role, quote, status FROM "Testimonials";');
    console.log(testimonials);

    console.log('\n--- HOME SECTIONS ---');
    const sections = await query('SELECT id, title, subtitle, description, section_type FROM home_sections;');
    console.log(sections);

    console.log('\n--- PRODUCTS COUNT ---');
    const productsCount = await query('SELECT COUNT(*) FROM products;');
    console.log(productsCount);

    console.log('\n--- SAMPLE PRODUCTS (5) ---');
    const products = await query('SELECT id, name, price, image, category, sub_category, badge FROM products LIMIT 5;');
    console.log(products);

  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await sequelize.close();
  }
}

main();
