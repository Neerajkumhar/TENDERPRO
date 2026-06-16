const User = require('./models/User');
const Department = require('./models/Department');
const sequelize = require('./config/db');

async function createFinance() {
  try {
    await sequelize.authenticate();
    console.log('Database connection authenticated.');

    // Find or create the department
    const [dept] = await Department.findOrCreate({
      where: { name: 'Tendering & Procurement' },
      defaults: {
        description: 'Handles all tender acquisitions and client bidding activities.',
        color: 'blue'
      }
    });

    // Find or create Finance Manager
    const [user, created] = await User.findOrCreate({
      where: { email: 'finance@vagwiin.com' },
      defaults: {
        name: 'Finance Manager User',
        password: '12345678',
        role: 'Finance Manager',
        departmentId: dept.id
      }
    });

    if (created) {
      console.log('Finance Manager user created successfully:', user.email);
    } else {
      console.log('Finance Manager user already exists:', user.email);
    }
  } catch (error) {
    console.error('Error creating Finance Manager:', error);
  } finally {
    process.exit(0);
  }
}

createFinance();
