const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SectionSetting = sequelize.define('SectionSetting', {
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  timestamps: true,
  tableName: 'sectionsettings'
});

module.exports = SectionSetting;
