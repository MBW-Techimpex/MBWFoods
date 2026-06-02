const sequelize = require('../src/config/database');
const { SubMenu } = require('../src/models/Menu');

async function syncCollections() {
    try {
        console.log('Syncing Collections filter_value with SubMenu names...');
        
        // 1. Get all active submenus
        const subMenus = await SubMenu.findAll({ where: { status: 'active' } });
        
        // 2. Get all collections filtered by sub_category
        const [collections] = await sequelize.query("SELECT id, slug, filter_value FROM collections WHERE filter_field = 'sub_category'");
        
        for (const col of collections) {
            // Find a matching submenu (case-insensitive or partial)
            const match = subMenus.find(s => 
                s.name.toLowerCase() === col.filter_value.toLowerCase() ||
                s.name.toLowerCase().includes(col.filter_value.toLowerCase()) ||
                col.filter_value.toLowerCase().includes(s.name.toLowerCase())
            );
            
            if (match && match.name !== col.filter_value) {
                console.log(`Updating Collection ${col.slug}: ${col.filter_value} -> ${match.name}`);
                await sequelize.query(`UPDATE collections SET filter_value = ? WHERE id = ?`, {
                    replacements: [match.name, col.id]
                });
            } else if (!match) {
                console.warn(`No match found for collection: ${col.slug} (${col.filter_value})`);
            }
        }
        
        console.log('Sync complete.');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

syncCollections();
