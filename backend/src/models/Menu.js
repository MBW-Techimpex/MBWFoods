const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Menu = sequelize.define('Menu', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Main Link', // 'Main Link' or 'Mega Menu'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active', // 'active' or 'inactive'
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Mega Menu Specific Fields
  collectionTitle: { type: DataTypes.STRING, defaultValue: '' },
  collectionSubtitle: { type: DataTypes.STRING, defaultValue: '' },
  collectionDescription: { type: DataTypes.STRING, defaultValue: '' },
  collectionBadgeText: { type: DataTypes.STRING, defaultValue: '' },
  megaMenuTitle: { type: DataTypes.STRING, defaultValue: '' },
  featuredImageUrl: { type: DataTypes.STRING, defaultValue: '' },
  specimenId: { type: DataTypes.STRING, defaultValue: '' },
  specimenTitle: { type: DataTypes.STRING, defaultValue: '' },
  hideMegaMenu: { type: DataTypes.BOOLEAN, defaultValue: false },
});

const SubMenu = sequelize.define('SubMenu', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active', // 'active' or 'inactive'
  },
   listHeader: {
    type: DataTypes.STRING,
    defaultValue: 'Top Categories', // 'Top Categories' or 'Navigation Links'
  },
});

const HeaderConfig = sequelize.define('HeaderConfig', {
  logoUrl: { type: DataTypes.STRING, defaultValue: null },
  logoTitle: { type: DataTypes.STRING, defaultValue: 'Gallatin Flower' },
  logoSubtitle: { type: DataTypes.STRING, defaultValue: 'And Gift Shoppe' },
  searchPlaceholder: { type: DataTypes.STRING, defaultValue: 'Search for lilies, roses, or dried flowers...' },
  accountTopText: { type: DataTypes.STRING, defaultValue: 'Hello, Sign In' },
  accountBottomText: { type: DataTypes.STRING, defaultValue: 'My Account' },
  homeIconName: { type: DataTypes.STRING, defaultValue: 'IconLayoutDashboard' },
  homeLink: { type: DataTypes.STRING, defaultValue: '/' },
   showHeader: { type: DataTypes.BOOLEAN, defaultValue: true },
});

Menu.hasMany(SubMenu, { as: 'subItems', foreignKey: 'menuId', onDelete: 'CASCADE' });
SubMenu.belongsTo(Menu, { foreignKey: 'menuId' });

module.exports = { Menu, SubMenu, HeaderConfig, sequelize };
