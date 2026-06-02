const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HospitalContent = sequelize.define('HospitalContent', {
  bannerImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bannerTitle: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Healing & Wellness',
  },
  bannerSubtitle: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Hospital Delivery',
  },
  bannerDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: 'Bringing comfort and sunshine to your loved ones. We coordinate directly with local medical centers to ensure your flowers are delivered fresh to patient rooms.',
  },
  introText: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: 'Gallatin Flower & Gift Shoppe provides direct, hand-delivered arrangements to patients and staff across all major medical facilities. Please provide the patient\'s full name and room number during checkout.',
  },
}, {
  timestamps: true,
  tableName: 'hospital_contents'
});

module.exports = HospitalContent;
