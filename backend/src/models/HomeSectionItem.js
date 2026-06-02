const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HomeSectionItem = sequelize.define('HomeSectionItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  section_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  badge: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stock_status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'In stock'
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
    is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'products',
      key: 'id'
    }
  }
}, {
  tableName: 'home_section_items',
  underscored: true,
  timestamps: true,
});

module.exports = HomeSectionItem;
