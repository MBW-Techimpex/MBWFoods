const sequelize = require('../src/config/database');
async function check() {
    try {
        const r1 = await sequelize.query('SELECT slug, title, is_active FROM collections');
        console.log('Collections:', JSON.stringify(r1[0], null, 2));
    } catch (e) {
        console.log('Error:', e.message);
    }
}
check();
