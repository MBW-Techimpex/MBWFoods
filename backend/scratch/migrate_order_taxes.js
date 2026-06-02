const sequelize = require('../src/config/database');
const { DataTypes } = require('sequelize');

async function migrate() {
    const queryInterface = sequelize.getQueryInterface();
    try {
        console.log('Adding tax_amount...');
        await queryInterface.addColumn('orders', 'tax_amount', {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        });
        console.log('Adding cgst...');
        await queryInterface.addColumn('orders', 'cgst', {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        });
        console.log('Adding sgst...');
        await queryInterface.addColumn('orders', 'sgst', {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        });
        console.log('Adding igst...');
        await queryInterface.addColumn('orders', 'igst', {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        });
        console.log('Migration successful: Tax columns added.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
