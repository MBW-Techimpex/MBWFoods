const sequelize = require('../src/config/database');
const { DataTypes } = require('sequelize');

async function migrate() {
    const queryInterface = sequelize.getQueryInterface();
    try {
        console.log('Adding tax_rate to products...');
        await queryInterface.addColumn('products', 'tax_rate', {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: null
        });
        console.log('Migration successful: tax_rate added to products.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
