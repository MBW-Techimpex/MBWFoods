const sequelize = require('../src/config/database');

async function listSubCats() {
    try {
        console.log('Listing distinct sub-categories from products...');
        const [results] = await sequelize.query("SELECT DISTINCT sub_category FROM products ORDER BY sub_category");
        console.table(results);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

listSubCats();
