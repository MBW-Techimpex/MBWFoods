const sequelize = require('../src/config/database');
async function check() {
    try {
        const [results] = await sequelize.query('SELECT title, section_type, product_id FROM home_section_items');
        console.log('All Home Section Items:', JSON.stringify(results, null, 2));
    } catch (e) {
        console.log('Error:', e.message);
    }
}
check();
