const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FuneralContent = sequelize.define('FuneralContent', {
  bannerImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bannerTitle: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Funeral & Memorial',
  },
  bannerSubtitle: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Delivery Services',
  },
  bannerDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: 'A tribute of beauty and respect. We coordinate directly with funeral homes to ensure your sympathy flowers arrive on time for the service.',
  },
  introText: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: 'Gallatin Flower & Gift Shoppe maintains a prestigious partnership with the nation\'s most respected funeral directors.',
  },
  introSubtext: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Please provide the name of the deceased and the service start time during checkout.',
  }
}, {
  timestamps: true,
  tableName: 'funeral_contents'
});

module.exports = FuneralContent;
