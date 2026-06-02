const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FooterLink = sequelize.define('FooterLink', {
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    defaultValue: '#',
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active',
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  timestamps: true,
  tableName: 'footerlinks'
});

module.exports = FooterLink;
