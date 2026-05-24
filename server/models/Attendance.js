const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  date: {
    type: DataTypes.STRING, // Format: YYYY-MM-DD
    allowNull: false,
  },
  inTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  outTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  workMin: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('ON TIME', 'LATE'),
    defaultValue: 'ON TIME',
  }
}, {
  timestamps: true,
});

module.exports = Attendance;
