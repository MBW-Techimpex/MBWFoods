const { Menu, SubMenu } = require('../src/models/Menu');

async function checkSubMenus() {
    try {
        console.log('Fetching submenus for INTERIOR ACCESSORIES...');
        const menu = await Menu.findOne({
            where: { name: 'INTERIOR ACCESSORIES' },
            include: [{ model: SubMenu, as: 'subItems' }]
        });
        
        if (menu) {
            console.log('Menu found:', menu.name);
            console.log('Sub-categories:', menu.subItems.map(s => s.name));
        } else {
            console.log('Menu not found');
            const allMenus = await Menu.findAll();
            console.log('Available menus:', allMenus.map(m => m.name));
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

checkSubMenus();
