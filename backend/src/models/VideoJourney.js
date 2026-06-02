const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VideoJourney = sequelize.define('VideoJourney', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  youtubeLink: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  thumbnail: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active',
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  tableName: 'VideoJourneys'
});

module.exports = VideoJourney;
