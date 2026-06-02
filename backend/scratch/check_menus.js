const sequelize = require('../src/config/database');
async function check() {
    try {
        const r1 = await sequelize.query('SELECT name, link FROM "Menus"');
        console.log('Menus:', JSON.stringify(r1[0], null, 2));
    } catch (e) {
        console.log('Error:', e.message);
    }
}
check();
