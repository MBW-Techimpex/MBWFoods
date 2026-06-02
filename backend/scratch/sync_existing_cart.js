const sequelize = require('../src/config/database');
async function check() {
    try {
        // Synchronize all existing cart items with their product's current name and image
        // This fixes stale data in carts from before the product data was corrected.
        await sequelize.query(`
            UPDATE cart_items 
            SET 
                name = products.name,
                image = products.image,
                price = products.price::numeric
            FROM products 
            WHERE cart_items.product_id = products.id
        `);
        console.log('Successfully synchronized all existing cart items with current product inventory.');
    } catch (e) {
        console.log('Error:', e.message);
    }
}
check();
