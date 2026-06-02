const sequelize = require('../src/config/database');
async function check() {
    try {
        // Sync product images and names with home section items
        await sequelize.query('UPDATE products SET image = \'/uploads/steering_detail.png\', name = \'Carbon Fiber Steering Wheel\' WHERE id = 543');
        await sequelize.query('UPDATE products SET image = \'/uploads/floor_mats_hq.png\', name = \'7D Premium Floor Mats\' WHERE id = 465');
        await sequelize.query('UPDATE products SET image = \'/uploads/roof_rack_hq.png\', name = \'Sleek Roof Rack System\' WHERE id = 368');
        await sequelize.query('UPDATE products SET image = \'/uploads/headlight_detail.png\', name = \'Matrix LED Headlights\' WHERE id = 400');
        console.log('Successfully synchronized 4 signature product images and names.');
    } catch (e) {
        console.log('Error:', e.message);
    }
}
check();
