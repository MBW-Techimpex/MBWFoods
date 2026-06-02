const sequelize = require('../src/config/database');
async function check() {
    try {
        // Sync product images and names for Discovery items
        await sequelize.query('UPDATE products SET image = \'/uploads/door_guards_hq.png\', name = \'Chrome Door Handle Guards\' WHERE id = 373');
        await sequelize.query('UPDATE products SET image = \'/uploads/ambient_lighting_hq.png\', name = \'Ambient Interior Lighting Kit\' WHERE id = 411');
        await sequelize.query('UPDATE products SET image = \'/uploads/vacuum_hq.png\', name = \'Portable Car Vacuum Cleaner\' WHERE id = 332');
        await sequelize.query('UPDATE products SET image = \'/uploads/perfume_hq.png\', name = \'Luxury Car Air Purifier\' WHERE id = 365');
        console.log('Successfully synchronized Discovery product images and names.');
    } catch (e) {
        console.log('Error:', e.message);
    }
}
check();
