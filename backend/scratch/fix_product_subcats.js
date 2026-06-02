const { SubMenu } = require('../src/models/Menu');
const Product = require('../src/models/Product');
const sequelize = require('../src/config/database');

async function fixProductSubCats() {
    try {
        console.log('Fixing product sub_category names to match SubMenu names...');
        
        // 1. Get all active submenus
        const subMenus = await SubMenu.findAll({ where: { status: 'active' } });
        
        // 2. Get all distinct subcategories from products
        const [results] = await sequelize.query("SELECT DISTINCT sub_category FROM products");
        const productSubCats = results.map(r => r.sub_category).filter(Boolean);
        
        for (const cat of productSubCats) {
            // Find a matching submenu (case-insensitive or partial)
            const match = subMenus.find(s => 
                s.name.toLowerCase() === cat.toLowerCase() ||
                s.name.toLowerCase().includes(cat.toLowerCase()) ||
                cat.toLowerCase().includes(s.name.toLowerCase())
            );
            
            if (match && match.name !== cat) {
                console.log(`Updating Product sub_category: "${cat}" -> "${match.name}"`);
                const [affected] = await Product.update(
                    { sub_category: match.name },
                    { where: { sub_category: cat } }
                );
                console.log(`   Updated ${affected} products.`);
            } else if (!match) {
                console.warn(`No match found for product sub_category: "${cat}"`);
            }
        }
        
        console.log('Fix complete.');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

fixProductSubCats();
