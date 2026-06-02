const { Menu, SubMenu } = require('../src/models/Menu');

async function checkExteriorSubs() {
    try {
        console.log('Fetching submenus for EXTERIOR ACCESSORIES...');
        const menu = await Menu.findOne({
            where: { name: 'EXTERIOR ACCESSORIES' },
            include: [{ model: SubMenu, as: 'subItems' }]
        });
        
        if (menu) {
            console.log('Menu found:', menu.name);
            console.log('Sub-categories:', menu.subItems.map(s => s.name));
        } else {
            console.log('Menu not found');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

checkExteriorSubs();
