const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Faq = sequelize.define('Faq', {
  question: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Active',
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
} , { tableName: 'Faqs' });

module.exports = Faq;
