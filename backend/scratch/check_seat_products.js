const Product = require('../src/models/Product');

async function checkSeatProducts() {
    try {
        console.log('Checking products for SEAT UPGRADES...');
        const products = await Product.findAll({
            where: { sub_category: 'SEAT UPGRADES' }
        });
        console.log(`Found ${products.length} products.`);
        if (products.length > 0) {
            console.log('First product status:', products[0].status);
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

checkSeatProducts();
