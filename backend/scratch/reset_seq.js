const sequelize = require('../src/config/database');

async function resetSequence() {
    try {
        console.log('Resetting product ID sequence using Sequelize...');
        const [results] = await sequelize.query("SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));");
        console.log('Sequence reset successful:', results);
    } catch (err) {
        console.error('Failed to reset sequence:', err.message);
    } finally {
        process.exit(0);
    }
}

resetSequence();
