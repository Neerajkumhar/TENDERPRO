const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const memberRoutes = require('./routes/memberRoutes');
const tenderRoutes = require('./routes/tenderRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const taskRoutes = require('./routes/taskRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const deliveryChallanRoutes = require('./routes/deliveryChallanRoutes');
const installationChallanRoutes = require('./routes/installationChallanRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const messageRoutes = require('./routes/messageRoutes');

const Attendance = require('./models/Attendance');
const Invoice = require('./models/Invoice');
const DeliveryChallan = require('./models/DeliveryChallan');
const InstallationChallan = require('./models/InstallationChallan');
const Expense = require('./models/Expense');
const Message = require('./models/Message');
require('dotenv').config();

// Dev reload trigger for models
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/delivery-challans', deliveryChallanRoutes);
app.use('/api/installation-challans', installationChallanRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5000;
let server;

// Retry connection to Database up to 5 times
const MAX_RETRIES = 5;
async function startServer(retries = MAX_RETRIES) {
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log('Database connection authenticated successfully.');
      
      await sequelize.sync();
      console.log('Database connected and synced');
      
      try {
        await sequelize.query("ALTER TABLE Tasks ADD COLUMN attachments TEXT NULL");
        console.log("Added attachments column to Tasks table");
      } catch (err) {
        console.log("Tasks table attachments column is ready");
      }

      const invoiceColumns = [
        { sql: "ALTER TABLE Invoices ADD COLUMN billingAddress TEXT NULL", label: 'billingAddress' },
        { sql: "ALTER TABLE Invoices ADD COLUMN reference VARCHAR(255) NULL", label: 'reference' },
        { sql: "ALTER TABLE Invoices ADD COLUMN poNumber VARCHAR(255) NULL", label: 'poNumber' },
        { sql: "ALTER TABLE Invoices ADD COLUMN dueDate DATE NULL", label: 'dueDate' },
        { sql: "ALTER TABLE Invoices ADD COLUMN amount_due DECIMAL(15,2) NULL DEFAULT 0", label: 'amount_due' },
        { sql: "ALTER TABLE Invoices ADD COLUMN paid_amount DECIMAL(15,2) NULL DEFAULT 0", label: 'paid_amount' },
        { sql: "ALTER TABLE Invoices ADD COLUMN bankName VARCHAR(255) NULL", label: 'bankName' },
        { sql: "ALTER TABLE Invoices ADD COLUMN accountNumber VARCHAR(255) NULL", label: 'accountNumber' },
        { sql: "ALTER TABLE Invoices ADD COLUMN paidAt DATE NULL", label: 'paidAt' },
        { sql: "ALTER TABLE Invoices ADD COLUMN sentAt DATE NULL", label: 'sentAt' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN items JSON NULL", label: 'items' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN attachments JSON NULL", label: 'attachments' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN gstDetails VARCHAR(255) NULL", label: 'gstDetails' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN poAddress TEXT NULL", label: 'poAddress' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN companyName VARCHAR(255) NULL", label: 'companyName' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN companyAddress TEXT NULL", label: 'companyAddress' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN companyPhone VARCHAR(255) NULL", label: 'companyPhone' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN companyEmail VARCHAR(255) NULL", label: 'companyEmail' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN companyGSTIN VARCHAR(255) NULL", label: 'companyGSTIN' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN companyPAN VARCHAR(255) NULL", label: 'companyPAN' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN companyWebsite VARCHAR(255) NULL", label: 'companyWebsite' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN companyLogo VARCHAR(255) NULL", label: 'companyLogo' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN bankIFSC VARCHAR(255) NULL", label: 'bankIFSC' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN bankBranch VARCHAR(255) NULL", label: 'bankBranch' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN authorizedSignature VARCHAR(255) NULL", label: 'authorizedSignature' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN project VARCHAR(255) NULL", label: 'project' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN invoiceRef VARCHAR(255) NULL", label: 'invoiceRef' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN poRef VARCHAR(255) NULL", label: 'poRef' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN poDate DATE NULL", label: 'poDate' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN ewayBill VARCHAR(255) NULL", label: 'ewayBill' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN dispatchDate DATE NULL", label: 'dispatchDate' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN deliveryDate DATE NULL", label: 'deliveryDate' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN transporter VARCHAR(255) NULL", label: 'transporter' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN vehicleNumber VARCHAR(255) NULL", label: 'vehicleNumber' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN lrNo VARCHAR(255) NULL", label: 'lrNo' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN driverName VARCHAR(255) NULL", label: 'driverName' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN clientGstin VARCHAR(255) NULL", label: 'clientGstin' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN contactPerson VARCHAR(255) NULL", label: 'contactPerson' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN contactPhone VARCHAR(255) NULL", label: 'contactPhone' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN placeOfSupply VARCHAR(255) NULL", label: 'placeOfSupply' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN dispatchFrom VARCHAR(255) NULL", label: 'dispatchFrom' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN dispatchTo VARCHAR(255) NULL", label: 'dispatchTo' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN shippingAddress TEXT NULL", label: 'shippingAddress' }
        , { sql: "ALTER TABLE Invoices ADD COLUMN notes TEXT NULL", label: 'notes' }
      ];

      for (const column of invoiceColumns) {
        try {
          await sequelize.query(column.sql);
          console.log(`Added ${column.label} column to Invoices table`);
        } catch (err) {
          console.log(`Invoices table ${column.label} column is ready`);
        }
      }
      
      server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });

      // Gracefully handle server startup errors (e.g. port already in use)
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.error(`\n💥 FATAL ERROR: Port ${PORT} is already in use by another process!`);
          console.error(`👉 This usually means 'npm run dev' or 'nodemon' is already running in another terminal window.`);
          console.error(`👉 To fix this, stop the other server instance or change the PORT in your .env file.\n`);
          process.exit(1);
        } else {
          console.error('Server error:', err);
        }
      });
      
      return; // Successfully started
    } catch (err) {
      retries -= 1;
      console.error(`Database connection/sync failed (retries left: ${retries}):`, err.message);
      if (retries === 0) {
        console.error('💥 Critical Error: Could not establish a database connection after multiple attempts.');
        process.exit(1);
      }
      // Wait 3 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

startServer();

// Global error handling to prevent crashes
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  if (server && typeof server.close === 'function') {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Triggering auto-restart after freeing port 5000
