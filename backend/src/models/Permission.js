const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define('Permission', {
  role: {
    type: DataTypes.STRING,
    allowNull: false, // Admin, Staff, Editor
  },
  section: {
    type: DataTypes.STRING,
    allowNull: false, // General, Home Page, Shop, etc.
  },
  permission_key: {
    type: DataTypes.STRING,
    allowNull: false, // e.g., 'manage_products'
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false, // e.g., 'Manage Products'
  },
  is_granted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  tableName: 'Permissions',
  timestamps: true,
});

module.exports = Permission;
