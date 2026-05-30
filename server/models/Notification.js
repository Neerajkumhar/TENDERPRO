const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetPanel: {
    type: DataTypes.ENUM('admin', 'client', 'both'),
    allowNull: false,
    defaultValue: 'both',
  },
  userId: {
    type: DataTypes.UUID, // Optional, for targeting specific user
    allowNull: true,
  },
  readBy: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
  },
  actionUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  timestamps: true,
});

module.exports = Notification;
