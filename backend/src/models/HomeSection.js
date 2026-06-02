const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HomeSection = sequelize.define('HomeSection', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  section_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subtitle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'home_sections',
  underscored: true,
  timestamps: true,
});

module.exports = HomeSection;
