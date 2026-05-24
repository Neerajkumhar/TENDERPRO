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

// Load models to ensure they are registered with Sequelize
require('./models/Attendance');
require('./models/Invoice');
require('./models/DeliveryChallan');
require('./models/InstallationChallan');
require('./models/Expense');
require('./models/Message');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection and initialization
let isDbInitialized = false;
async function initializeDatabase() {
  if (isDbInitialized) return;
  
  try {
    console.log('Initializing database connection...');
    await sequelize.authenticate();
    console.log('Database connection authenticated successfully.');
    
    // Sync models - using alter: false for production performance
    // If you need to update schema, run a migration script instead
    await sequelize.sync(); 
    console.log('Database connected and synced');
    
    isDbInitialized = true;
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    // In serverless, we don't necessarily want to kill the process here
    // as it might succeed on a subsequent request
  }
}

// Middleware to ensure DB is initialized before handling requests
app.use(async (req, res, next) => {
  if (!isDbInitialized) {
    await initializeDatabase();
  }
  next();
});

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
  res.json({ 
    message: 'Tender Management API is running', 
    env: process.env.NODE_ENV,
    dbStatus: isDbInitialized ? 'connected' : 'initializing'
  });
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

// Local development server startup
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  initializeDatabase().then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
      }
    });
  });
}

module.exports = app;

// Global error handling
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥', err.name, err.message);
  // In serverless, we let Vercel handle the crash
  if (process.env.NODE_ENV !== 'production') process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥', err.name, err.message);
  if (process.env.NODE_ENV !== 'production') process.exit(1);
});
