const sequelize = require('../src/config/database');
async function check() {
    try {
        const r1 = await sequelize.query('SELECT id, name, link FROM "Categories"');
        console.log('Categories:', JSON.stringify(r1[0], null, 2));
    } catch (e) {
        console.log('Error:', e.message);
    }
}
check();
