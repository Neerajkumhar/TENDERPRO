const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DocumentRequest = sequelize.define('DocumentRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tenderId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  documentName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
    defaultValue: 'Pending',
  }
}, {
  timestamps: true,
});

module.exports = DocumentRequest;
