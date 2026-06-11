const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gstAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  industry: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Lead', 'Pending', 'Inactive'),
    defaultValue: 'Active',
  },
  manager: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  managerEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isEmail: true }
  },
  managerPhone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  managerPhoto: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  firmType: {
    type: DataTypes.ENUM('Private', 'Govt'),
    defaultValue: 'Private',
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  value: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = Client;
