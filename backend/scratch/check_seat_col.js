const sequelize = require('../src/config/database');

async function checkSeatCollection() {
    try {
        console.log('Checking collection seat...');
        const [results] = await sequelize.query("SELECT * FROM collections WHERE slug = 'seat'");
        if (results.length > 0) {
            console.log('Collection found:', JSON.stringify(results[0], null, 2));
        } else {
            console.log('Collection not found');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

checkSeatCollection();
