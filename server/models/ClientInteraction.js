const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ClientInteraction = sequelize.define('ClientInteraction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING, // e.g. 'Meeting', 'Email', 'Call', 'Document'
    allowNull: false,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  user: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'System'
  }
}, {
  timestamps: true,
});

module.exports = ClientInteraction;
