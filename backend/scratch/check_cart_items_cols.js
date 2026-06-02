const sequelize = require('../src/config/database');
async function check() {
    try {
        const [cartCols] = await sequelize.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'cart_items\'');
        console.log('Cart Item Columns:', cartCols);
    } catch (e) {
        console.log('Error:', e.message);
    }
}
check();
