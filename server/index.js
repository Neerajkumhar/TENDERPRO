const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
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
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Load models to ensure they are registered with Sequelize
require('./models/User');
require('./models/Department');
require('./models/Attendance');
require('./models/Invoice');
require('./models/DeliveryChallan');
require('./models/InstallationChallan');
require('./models/Expense');
require('./models/Message');
require('./models/LeaveRequest');
require('./models/LeaveBalance');
require('./models/Notification');
require('./models/Payment');
require('./models/DocumentRequest');

// Set up associations
const User = require('./models/User');
const Message = require('./models/Message');
const LeaveRequest = require('./models/LeaveRequest');
const LeaveBalance = require('./models/LeaveBalance');
const Invoice = require('./models/Invoice');
const Payment = require('./models/Payment');

User.hasMany(LeaveRequest, { foreignKey: 'userId' });
LeaveRequest.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(LeaveBalance, { foreignKey: 'userId' });
LeaveBalance.belongsTo(User, { foreignKey: 'userId' });

// Message associations
User.hasMany(Message, { as: 'SentMessages', foreignKey: 'senderId' });
User.hasMany(Message, { as: 'ReceivedMessages', foreignKey: 'receiverId' });
Message.belongsTo(User, { as: 'Sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'Receiver', foreignKey: 'receiverId' });

// Payment associations
Invoice.hasMany(Payment, { foreignKey: 'invoiceId' });
Payment.belongsTo(Invoice, { foreignKey: 'invoiceId' });

// DocumentRequest associations
const DocumentRequest = require('./models/DocumentRequest');
const Tender = require('./models/Tender');

User.hasMany(DocumentRequest, { foreignKey: 'userId' });
DocumentRequest.belongsTo(User, { foreignKey: 'userId' });
Tender.hasMany(DocumentRequest, { foreignKey: 'tenderId' });
DocumentRequest.belongsTo(Tender, { foreignKey: 'tenderId' });

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
    
    if (sequelize.options.dialect === 'sqlite') {
      await sequelize.sync({ force: true });
      console.log('SQLite database synced successfully.');

      const User = require('./models/User');
      const Client = require('./models/Client');
      const Department = require('./models/Department');

      // Create a default department
      const dept = await Department.create({
        name: 'Tendering & Procurement',
        description: 'Handles all tender acquisitions and client bidding activities.',
        color: 'blue'
      });

      // Create Admin user
      await User.create({
        name: 'Vikash Kumar',
        email: 'vikash@vagwiin.com',
        password: '12345678',
        role: 'Admin',
        departmentId: dept.id
      });

      // Create Tender Manager user
      await User.create({
        name: 'Tender Manager User',
        email: 'manager@vagwiin.com',
        password: '12345678',
        role: 'Tender Manager',
        departmentId: dept.id
      });

      // Create Finance Manager user
      await User.create({
        name: 'Finance Manager User',
        email: 'finance@vagwiin.com',
        password: '12345678',
        role: 'Finance Manager',
        departmentId: dept.id
      });

      // Create a default client
      await Client.create({
        name: 'Jaipur Development Authority',
        email: 'jda@rajasthan.gov.in',
        phone: '0141-2563211',
        location: 'Jaipur, Rajasthan',
        industry: 'Infrastructure',
        status: 'Active',
        firmType: 'Govt'
      });

      console.log('Database seeded successfully with local admin, tender manager, and client!');
    } else {
      // Skip sync to avoid conflicts with existing tables and foreign keys
      // Tables already exist in the database, no need to sync
      console.log('Database ready for operations');
    }
    
    isDbInitialized = true;
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    // In serverless, we don't necessarily want to kill the process here
    // as it might succeed on a subsequent request
  }
}

// Middleware to ensure DB is initialized before handling requests
app.use(async (req, res, next) => {
  try {
    if (!isDbInitialized) {
      await initializeDatabase();
    }
    
    if (!isDbInitialized && !req.path.includes('/health')) {
      return res.status(500).json({ 
        error: 'Database not initialized', 
        message: 'The server is unable to connect to the database. Please check connection settings.' 
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server initialization error', message: err.message });
  }
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
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/leave-requests', require('./routes/leaveRequestRoutes'));
app.use('/api/doc-requests', require('./routes/docRequestRoutes'));

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
if (!process.env.VERCEL) {
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
