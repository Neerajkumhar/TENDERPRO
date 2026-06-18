const sequelize = require('./config/db');

// Load all models
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
require('./models/Tender');
require('./models/TenderAssignment');
require('./models/Client');
require('./models/ClientInteraction');
require('./models/Task');
require('./models/Reminder');


async function createTables() {
  try {
    await sequelize.authenticate();
    console.log('Database connection authenticated.');
    
    // Create only missing tables
    await sequelize.sync({ alter: false });
    console.log('All tables created successfully.');
    
  } catch (error) {
    console.error('Error creating tables:', error.message);
  } finally {
    await sequelize.close();
  }
}

createTables();
