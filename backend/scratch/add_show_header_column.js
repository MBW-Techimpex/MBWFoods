const { sequelize, HeaderConfig } = require('../src/models/Menu');

async function migrate() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableName = HeaderConfig.tableName;
    console.log(`Checking table: ${tableName}`);
    const tableInfo = await queryInterface.describeTable(tableName);
    
    if (!tableInfo.showHeader) {
      console.log(`Adding showHeader column to ${tableName}...`);
      await queryInterface.addColumn(tableName, 'showHeader', {
        type: require('sequelize').DataTypes.BOOLEAN,
        defaultValue: true
      });
      console.log('Column added successfully.');
    } else {
      console.log('showHeader column already exists.');
    }
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
