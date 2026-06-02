const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  action_type: {
    type: DataTypes.STRING, // login, porduct_add, order_update, settings_change
    allowNull: false,
  },
  module: {
    type: DataTypes.STRING, // auth, products, orders, settings
    allowNull: false,
  },
  details: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  ip_address: {
    type: DataTypes.STRING,
  },
  user_agent: {
    type: DataTypes.STRING,
  }
}, {
  tableName: 'activity_logs',
  underscored: true,
  timestamps: true,
});

module.exports = ActivityLog;
