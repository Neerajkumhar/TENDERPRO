const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LeaveBalance = sequelize.define('LeaveBalance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: new Date().getFullYear(),
  },
  annual: {
    type: DataTypes.FLOAT,
    defaultValue: 20.0,
  },
  sick: {
    type: DataTypes.FLOAT,
    defaultValue: 10.0,
  },
  casual: {
    type: DataTypes.FLOAT,
    defaultValue: 8.0,
  },
  unpaid: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
  }
}, {
  timestamps: true,
});

module.exports = LeaveBalance;
