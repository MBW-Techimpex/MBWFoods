const sequelize = require('../src/config/database');

async function checkInteriors() {
    try {
        console.log('Checking interior collections...');
        const [results] = await sequelize.query("SELECT id, slug, title, filter_field, filter_value FROM collections WHERE slug LIKE '%interior%'");
        console.table(results);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

checkInteriors();
