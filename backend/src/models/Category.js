const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false, // can be a URL or local path
  },
  count: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "0 Items"
  },
  shape: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "rounded-t-full"
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "#"
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Active',
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
} , { tableName: 'Categories' });

module.exports = Category;
