const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryAreaContent = sequelize.define('DeliveryAreaContent', {
  bannerImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bannerTitle: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Flower Delivery Area',
  },
  bannerSubtitle: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Delivery',
  },
  bannerDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: 'Find out if we deliver to your neighborhood. We serve Murfreesboro and surrounding areas with premium floral care.',
  },
  specializedTitle: {
    type: DataTypes.STRING,
    defaultValue: 'Specialized Care Locations',
  },
  specializedDescription: {
    type: DataTypes.TEXT,
    defaultValue: 'We have established protocols for seamless delivery to sensitive locations like hospitals and funeral homes.',
  },
  hospitalTitle: {
    type: DataTypes.STRING,
    defaultValue: 'Hospitals',
  },
  hospitalText: {
    type: DataTypes.TEXT,
    defaultValue: 'Same-day delivery available. Please provide the patient\'s full name and room number for prompt service.',
  },
  funeralTitle: {
    type: DataTypes.STRING,
    defaultValue: 'Funeral Homes',
  },
  funeralText: {
    type: DataTypes.TEXT,
    defaultValue: 'We prioritize funeral services. Include service time and the name of the deceased in your order notes.',
  },
}, {
  tableName: 'delivery_area_contents',
  timestamps: true,
});

module.exports = DeliveryAreaContent;
