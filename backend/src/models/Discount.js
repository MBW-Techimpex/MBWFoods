const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Discount = sequelize.define('Discount', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.ENUM('amount_off_products', 'buy_x_get_y', 'amount_off_order', 'free_shipping'),
    allowNull: false,
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  value_type: {
    type: DataTypes.ENUM('percentage', 'fixed_amount'),
    allowNull: true,
  },
  min_requirement_type: {
    type: DataTypes.ENUM('none', 'min_purchase_amount', 'min_quantity_items'),
    defaultValue: 'none',
  },
  min_requirement_value: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  usage_limit: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  usage_limit_per_customer: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  used_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
  applies_to: {
    type: DataTypes.ENUM('all', 'specific_products', 'specific_categories'),
    defaultValue: 'all',
  },
  specific_product_ids: {
    type: DataTypes.JSON, // Array of product IDs
    allowNull: true,
  },
  specific_category_ids: {
    type: DataTypes.JSON, // Array of category names
    allowNull: true,
  },
}, {
  tableName: 'discounts',
  underscored: true,
  timestamps: true,
});

module.exports = Discount;
