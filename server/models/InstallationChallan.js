const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const InstallationChallan = sequelize.define('InstallationChallan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  challanNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  client: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  project: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  installationDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  siteEngineer: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  installationType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  siteAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  supervisorName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contactPerson: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contactPhone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  invoiceRef: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  poRef: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  poDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  itemsQty: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  estValuation: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0,
  },
  materialRows: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  billingStatus: {
    type: DataTypes.ENUM('Draft', 'Pending Billing', 'Invoiced'),
    defaultValue: 'Draft',
  },
  signedCopy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  documents: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, {
  timestamps: true,
});

module.exports = InstallationChallan;
