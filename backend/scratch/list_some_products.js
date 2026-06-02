const sequelize = require('../src/config/database');
const Product = require('../src/models/Product');

async function check() {
    try {
        const products = await Product.findAll({ limit: 10 });
        console.log('Some Products:', JSON.stringify(products.map(p => ({ id: p.id, name: p.name })), null, 2));
    } catch (e) {
        console.log('Error:', e.message);
    }
}
check();
