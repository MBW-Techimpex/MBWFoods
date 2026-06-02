const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SocialLink = sequelize.define('SocialLink', {
  platform: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    defaultValue: '#',
  },
  icon_type: {
    type: DataTypes.ENUM('Instagram', 'Pinterest', 'Threads', 'Facebook', 'Twitter', 'LinkedIn', 'YouTube', 'TikTok'),
    defaultValue: 'Instagram',
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
  tableName: 'sociallinks'
});

module.exports = SocialLink;
