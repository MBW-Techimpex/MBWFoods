const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Benefit = sequelize.define('Benefit', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  icon: {
    type: DataTypes.TEXT, // SVG path or icon name
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Active', // 'Active' or 'Inactive'
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
} , { tableName: 'Benefits' });

module.exports = Benefit;
