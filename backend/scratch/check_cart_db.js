const sequelize = require('../src/config/database');
async function check() {
    try {
        // Find a cart for a session
        const [cart] = await sequelize.query('SELECT id FROM carts LIMIT 1');
        if (cart.length > 0) {
            const cartId = cart[0].id;
            const [items] = await sequelize.query(`SELECT id, product_id, name, image FROM cart_items WHERE cart_id = ${cartId}`);
            console.log('Cart Items:', JSON.stringify(items, null, 2));
        } else {
            console.log('No carts found.');
        }
    } catch (e) {
        console.log('Error:', e.message);
    }
}
check();
