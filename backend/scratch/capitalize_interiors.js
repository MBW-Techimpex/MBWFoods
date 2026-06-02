const { Menu, SubMenu } = require('../src/models/Menu');
const Product = require('../src/models/Product');
const sequelize = require('../src/config/database');

async function capitalizeInteriors() {
    try {
        console.log('Capitalizing INTERIOR ACCESSORIES submenus...');
        const menu = await Menu.findOne({
            where: { name: 'INTERIOR ACCESSORIES' },
            include: [{ model: SubMenu, as: 'subItems' }]
        });
        
        if (!menu) {
            console.log('Menu not found');
            return;
        }

        for (const sub of menu.subItems) {
            const oldName = sub.name;
            const newName = oldName.toUpperCase();
            
            if (oldName !== newName) {
                console.log(`Updating ${oldName} -> ${newName}`);
                
                // 1. Update SubMenu
                await sub.update({ name: newName });
                
                // 2. Update Products
                const [affected] = await Product.update(
                    { sub_category: newName },
                    { where: { sub_category: oldName } }
                );
                console.log(`   Updated ${affected} products.`);
            }
        }
        
        console.log('Capitalization complete.');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

capitalizeInteriors();
