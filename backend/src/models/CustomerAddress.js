const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CustomerAddress = sequelize.define('CustomerAddress', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'customer_id'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Home'
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'first_name'
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'last_name'
  },
  street: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  suite: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  zip: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_default'
  }
}, { 
  tableName: 'CustomerAddresses',
  timestamps: true,
  createdAt: 'createdAt', // Force CamelCase mapping
  updatedAt: 'updatedAt'  // Force CamelCase mapping
});

module.exports = CustomerAddress;
