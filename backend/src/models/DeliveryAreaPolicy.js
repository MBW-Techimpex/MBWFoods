const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryAreaPolicy = sequelize.define('DeliveryAreaPolicy', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  iconName: {
    type: DataTypes.STRING, // Store icon name or SVG path
    allowNull: true,
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  tableName: 'delivery_area_policies',
  timestamps: true,
});

module.exports = DeliveryAreaPolicy;
