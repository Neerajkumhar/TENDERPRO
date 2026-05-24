const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DeliveryChallan = sequelize.define('DeliveryChallan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  challanNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  client: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  project: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dispatchDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  deliveryDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  transporter: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  vehicleNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lrNo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  driverName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  clientGstin: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contactPerson: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contactPhone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  placeOfSupply: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  invoiceRef: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  poRef: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  poDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  ewayBill: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dispatchFrom: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  dispatchTo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  poAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  materialValue: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0,
  },
  itemsQty: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  estWeight: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  materialRows: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'IN TRANSIT', 'DELIVERED', 'CANCELLED'),
    defaultValue: 'PENDING',
  },
  signedCopy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  documents: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, {
  timestamps: true,
});

module.exports = DeliveryChallan;
