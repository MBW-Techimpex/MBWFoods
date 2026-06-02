const sequelize = require('../src/config/database');
async function check() {
    try {
        const r1 = await sequelize.query('SELECT title, image, product_id FROM home_section_items WHERE section_type = \'signature\'');
        console.log('Signature Items:', JSON.stringify(r1[0], null, 2));
        
        const pIds = r1[0].map(i => i.product_id).filter(Boolean);
        if (pIds.length > 0) {
            const r2 = await sequelize.query(`SELECT id, name, image FROM products WHERE id IN (${pIds.join(',')})`);
            console.log('Linked Products:', JSON.stringify(r2[0], null, 2));
        }
    } catch (e) {
        console.log('Error:', e.message);
    }
}
check();
