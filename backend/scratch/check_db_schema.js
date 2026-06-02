const sequelize = require('../src/config/database');
async function check() {
    try {
        const [results] = await sequelize.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\'');
        console.log('Tables:', results.map(r => r.table_name));
        
        const [cartCols] = await sequelize.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'carts\'');
        console.log('Cart Columns:', cartCols);
    } catch (e) {
        console.log('Error:', e.message);
    }
}
check();
