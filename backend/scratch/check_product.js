const sequelize = require('../src/config/database');
const Product = require('../src/models/Product');

async function checkProduct() {
    try {
        console.log('Checking product 660...');
        const product = await Product.findByPk(660);
        if (product) {
            console.log('Product found:', JSON.stringify(product, null, 2));
        } else {
            console.log('Product not found with ID 660');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

checkProduct();
