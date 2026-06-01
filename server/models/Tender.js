const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Tender = sequelize.define('Tender', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  category: {
    type: DataTypes.ENUM('Government', 'Private', 'PSU', 'Non-Profit'),
    defaultValue: 'Private',
  },
  submissionDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  scope: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  milestones: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  techCriteria: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  certifications: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  terms: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  budget: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  tax: {
    type: DataTypes.STRING,
    defaultValue: '18',
  },
  paymentTerms: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Registered', 'Active', 'Won', 'Lost', 'Archived', 'Completed'),
    defaultValue: 'Registered',
  },
  documents: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  teamAssignments: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  submissionMode: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Online Portal',
  },
  submissionURL: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  timestamps: true,
});

Tender.belongsTo(require('./Client'), { foreignKey: 'clientId', as: 'client' });

module.exports = Tender;
