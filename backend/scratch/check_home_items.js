const sequelize = require('../src/config/database');
async function check() {
    try {
        const r1 = await sequelize.query('SELECT title, product_id FROM home_section_items WHERE section_type = \'signature\'');
        console.log('Signature Items:', JSON.stringify(r1[0], null, 2));
    } catch (e) {
        console.log('Error:', e.message);
    }
}
check();
