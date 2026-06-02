const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Banner = sequelize.define('Banner', {
  title: { type: DataTypes.STRING, allowNull: false, },
  subtitle: { type: DataTypes.TEXT, allowNull: true, },
  image: { type: DataTypes.STRING, allowNull: false, },
  imageSecondary: { type: DataTypes.STRING, allowNull: true, },
  imageTertiary: { type: DataTypes.STRING, allowNull: true, },
  type: { type: DataTypes.STRING, defaultValue: 'Hero Slider', },
  status: { type: DataTypes.STRING, defaultValue: 'Active', },
  position: { type: DataTypes.INTEGER, defaultValue: 0, },

  // Custom Action Buttons
  btnOneText: { type: DataTypes.STRING, allowNull: true },
  btnOneLink: { type: DataTypes.STRING, allowNull: true },
  btnTwoText: { type: DataTypes.STRING, allowNull: true },
  btnTwoLink: { type: DataTypes.STRING, allowNull: true },

  // Stats Row
  statOneNum: { type: DataTypes.STRING, allowNull: true },
  statOneLabel: { type: DataTypes.STRING, allowNull: true },
  statTwoNum: { type: DataTypes.STRING, allowNull: true },
  statTwoLabel: { type: DataTypes.STRING, allowNull: true },
  statThreeNum: { type: DataTypes.STRING, allowNull: true },
  statThreeLabel: { type: DataTypes.STRING, allowNull: true },

  // New Fields from Screenshot
  topTagline: { type: DataTypes.STRING, allowNull: true },
  promoBadge: { type: DataTypes.STRING, allowNull: true },
  promoTitle: { type: DataTypes.STRING, allowNull: true },
  promoSubtitle: { type: DataTypes.STRING, allowNull: true },
  promoInfo: { type: DataTypes.STRING, allowNull: true },
} , { tableName: 'banners' });

module.exports = Banner;
