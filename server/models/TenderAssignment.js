const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TenderAssignment = sequelize.define('TenderAssignment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tenderId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  departmentId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  assigneeId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    defaultValue: 'Medium',
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'In Progress', 'Completed'),
    defaultValue: 'Pending',
  }
}, {
  timestamps: true,
});

TenderAssignment.belongsTo(require('./Tender'), { foreignKey: 'tenderId', as: 'tender' });
TenderAssignment.belongsTo(require('./Department'), { foreignKey: 'departmentId', as: 'department' });
TenderAssignment.belongsTo(require('./User'), { foreignKey: 'assigneeId', as: 'assignee' });

module.exports = TenderAssignment;
