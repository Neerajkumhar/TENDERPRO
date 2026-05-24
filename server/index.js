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

app.get('/', (req, res) => {
  res.json({ message: 'Tender Management API is running', env: process.env.NODE_ENV });
});

app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
let server;

// Database connection and initialization
async function initializeDatabase() {
  // Use a flag to avoid multiple syncs in a single process lifetime
  if (global.dbInitialized) return;
  
  try {
    await sequelize.authenticate();
    console.log('Database connection authenticated successfully.');
    
    // In production/Vercel, we might want to skip heavy syncs on every request
    // but for now we'll just keep it simple but catch errors
    await sequelize.sync({ alter: false }); // Avoid 'alter: true' in serverless if possible
    console.log('Database connected and synced');
    
    global.dbInitialized = true;
  } catch (err) {
    console.error('Database initialization failed:', err.message);
  }
}

// Only start the server if not running on Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  initializeDatabase().then(() => {
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
      }
    });
  });
} else {
  // On Vercel, we still want to ensure DB is initialized
  // This is a simple way to run it on cold start
  initializeDatabase();
}

module.exports = app;

// Global error handling...
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

// Deployment Update: 2026-05-24
// Triggering auto-restart after freeing port 5000
