const sequelize = require('../src/config/database');

async function listCollections() {
    try {
        console.log('Listing sub-category collections...');
        const [results] = await sequelize.query("SELECT id, slug, title, filter_field, filter_value FROM collections WHERE filter_field = 'sub_category'");
        console.table(results);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

listCollections();
