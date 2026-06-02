const sequelize = require('../src/config/database');
const { SubMenu } = require('../src/models/Menu');

async function findMismatches() {
    try {
        console.log('Finding mismatches between Collections and SubMenus...');
        
        // 1. Get all collections that filter by sub_category
        const [collections] = await sequelize.query("SELECT id, slug, filter_value FROM collections WHERE filter_field = 'sub_category'");
        
        // 2. Get all active submenus
        const subMenus = await SubMenu.findAll({ where: { status: 'active' } });
        const subMenuNames = subMenus.map(s => s.name);
        
        console.log(`Checking ${collections.length} collections against ${subMenuNames.length} submenus...`);
        
        const mismatches = [];
        for (const col of collections) {
            // Check if filter_value exists exactly in subMenuNames
            if (!subMenuNames.includes(col.filter_value)) {
                // Try to find a partial match or similar name
                const similar = subMenuNames.find(s => s.toLowerCase().includes(col.filter_value.toLowerCase()) || col.filter_value.toLowerCase().includes(s.toLowerCase()));
                mismatches.push({
                    colId: col.id,
                    slug: col.slug,
                    currentFilter: col.filter_value,
                    suggestedFilter: similar || 'NO MATCH'
                });
            }
        }
        
        console.table(mismatches);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

findMismatches();
