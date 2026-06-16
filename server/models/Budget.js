const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Budget = sequelize.define('Budget', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  allocated: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'ON TRACK',
  },
  trend: {
    type: DataTypes.STRING,
    defaultValue: '0.0%',
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: 'bg-blue-600',
  },
  fiscalYear: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  period: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  threshold: {
    type: DataTypes.INTEGER,
    defaultValue: 80,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  timestamps: true,
});

module.exports = Budget;
