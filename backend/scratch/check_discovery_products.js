const sequelize = require('../src/config/database');
async function check() {
    try {
        const pIds = [373, 411, 332, 365];
        const r2 = await sequelize.query(`SELECT id, name, image FROM products WHERE id IN (${pIds.join(',')})`);
        console.log('Linked Discovery Products:', JSON.stringify(r2[0], null, 2));
    } catch (e) {
        console.log('Error:', e.message);
    }
}
check();
