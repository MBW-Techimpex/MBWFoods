const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  group: {
    type: DataTypes.STRING, // site, business, shop, notification
    allowNull: false,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING, // string, number, boolean, json
    defaultValue: 'string',
  },
}, {
  tableName: 'settings',
  underscored: true,
  timestamps: true,
});

module.exports = Setting;
