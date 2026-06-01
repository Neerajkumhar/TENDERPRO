const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  tenderId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  client: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Paid', 'Pending', 'Overdue'),
    defaultValue: 'Pending',
  },
  billingAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  poNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  amount_due: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0,
  },
  paid_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0,
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  items: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  gstDetails: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  poAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  companyAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  companyPhone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  companyEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  companyGSTIN: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  companyPAN: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  companyWebsite: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  companyLogo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bankIFSC: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bankBranch: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  authorizedSignature: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  project: { type: DataTypes.STRING, allowNull: true },
  invoiceRef: { type: DataTypes.STRING, allowNull: true },
  poRef: { type: DataTypes.STRING, allowNull: true },
  poDate: { type: DataTypes.DATEONLY, allowNull: true },
  ewayBill: { type: DataTypes.STRING, allowNull: true },
  dispatchDate: { type: DataTypes.DATEONLY, allowNull: true },
  deliveryDate: { type: DataTypes.DATEONLY, allowNull: true },
  transporter: { type: DataTypes.STRING, allowNull: true },
  vehicleNumber: { type: DataTypes.STRING, allowNull: true },
  lrNo: { type: DataTypes.STRING, allowNull: true },
  driverName: { type: DataTypes.STRING, allowNull: true },
  clientGstin: { type: DataTypes.STRING, allowNull: true },
  contactPerson: { type: DataTypes.STRING, allowNull: true },
  contactPhone: { type: DataTypes.STRING, allowNull: true },
  placeOfSupply: { type: DataTypes.STRING, allowNull: true },
  dispatchFrom: { type: DataTypes.STRING, allowNull: true },
  dispatchTo: { type: DataTypes.STRING, allowNull: true },
  shippingAddress: { type: DataTypes.TEXT, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true }
}, {
  timestamps: true,
});

module.exports = Invoice;
