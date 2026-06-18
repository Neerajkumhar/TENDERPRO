const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tenderId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  assignmentId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  assigneeId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'In Progress', 'Completed', 'Review'),
    defaultValue: 'Pending',
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    defaultValue: 'Medium',
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  attachments: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
  }
}, {
  timestamps: true,
});

// Associations
const Tender = require('./Tender');
const TenderAssignment = require('./TenderAssignment');
const User = require('./User');

Task.belongsTo(Tender, { foreignKey: 'tenderId', as: 'tender' });
Task.belongsTo(TenderAssignment, { foreignKey: 'assignmentId', as: 'assignment' });
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });
Task.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

module.exports = Task;
