const sequelize = require('../src/config/database');
async function check() {
    try {
        await sequelize.query('UPDATE home_section_items SET product_id = 543 WHERE title = \'Carbon Fiber Steering Wheel\'');
        await sequelize.query('UPDATE home_section_items SET product_id = 465 WHERE title = \'7D Premium Floor Mats\'');
        await sequelize.query('UPDATE home_section_items SET product_id = 368 WHERE title = \'Sleek Roof Rack System\'');
        await sequelize.query('UPDATE home_section_items SET product_id = 400 WHERE title = \'Matrix LED Headlights\'');
        console.log('Updated 4 signature items.');
    } catch (e) {
        console.log('Error:', e.message);
    }
}
check();
