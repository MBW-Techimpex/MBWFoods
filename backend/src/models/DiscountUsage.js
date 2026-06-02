const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DiscountUsage = sequelize.define('DiscountUsage', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  discount_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  customer_email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'discount_usages',
  underscored: true,
  timestamps: true,
});

module.exports = DiscountUsage;
