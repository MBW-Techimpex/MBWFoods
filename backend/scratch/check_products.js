const sequelize = require('../src/config/database');
async function check() {
    try {
        const r1 = await sequelize.query('SELECT count(*) FROM products');
        console.log('Total products:', r1[0][0].count);
        const r2 = await sequelize.query('SELECT count(*) FROM products WHERE stock > 0');
        console.log('In-stock products:', r2[0][0].count);
        const r3 = await sequelize.query('SELECT count(*) FROM home_section_items');
        console.log('Home section items:', r3[0][0].count);
    } catch (e) {
        console.log('Error:', e.message);
    }
}
check();
