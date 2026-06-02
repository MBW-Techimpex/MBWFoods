const sequelize = require('../src/config/database');

async function checkSeat() {
    try {
        const [results] = await sequelize.query("SELECT count(*) FROM products WHERE sub_category = 'seat'");
        console.log('Count for seat:', results[0].count);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

checkSeat();
