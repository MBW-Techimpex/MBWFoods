const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AtelierHour = sequelize.define('AtelierHour', {
  day: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hours: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isClosed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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
  tableName: 'atelierhours'
});

module.exports = AtelierHour;
