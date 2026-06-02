const { Menu } = require('../src/models/Menu');

async function checkMenuLink() {
    try {
        console.log('Checking menu link for INTERIOR ACCESSORIES...');
        const menu = await Menu.findOne({ where: { name: 'INTERIOR ACCESSORIES' } });
        if (menu) {
            console.log('Menu:', menu.name);
            console.log('Link:', menu.link);
        } else {
            console.log('Menu not found');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

checkMenuLink();
