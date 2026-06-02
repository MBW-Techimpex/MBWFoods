const sequelize = require('../src/config/database');

async function finalCleanup() {
    try {
        console.log('Performing final cleanup of collection filters...');
        
        // 1. Fix Steering Controls typo
        await sequelize.query("UPDATE collections SET filter_value = 'STEERING CONTROLS' WHERE slug = 'steering-controles'");
        
        // 2. Fix DRLs typo
        await sequelize.query("UPDATE collections SET filter_value = 'DRLS' WHERE slug = 'fog-lights/drls'");

        console.log('Cleanup complete.');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

finalCleanup();
