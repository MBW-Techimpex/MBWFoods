const sequelize = require('../src/config/database');

async function checkMenu() {
    try {
        console.log('Checking menu INTERIOR ACCESSORIES...');
        const [results] = await sequelize.query("SELECT * FROM menus WHERE name = 'INTERIOR ACCESSORIES'");
        if (results.length > 0) {
            console.log('Menu found:', JSON.stringify(results[0], null, 2));
        } else {
            console.log('Menu not found');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

checkMenu();
