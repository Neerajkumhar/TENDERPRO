const sequelize = require('./config/db');
const User = require('./models/User');
const LeaveRequest = require('./models/LeaveRequest');

const seedLeaves = async () => {
  try {
    await sequelize.authenticate();
    
    const techDept = await User.findOne({ where: { role: 'Core Team' } });
    if (!techDept) {
      console.log('No Core Team user found to create leave requests for.');
      process.exit(0);
    }

    const leaveRequests = [
      {
        userId: techDept.id,
        leaveType: 'Annual Leave',
        startDate: '2026-06-01',
        endDate: '2026-06-05',
        reason: 'Family vacation to the mountains.',
        status: 'Pending'
      },
      {
        userId: techDept.id,
        leaveType: 'Sick Leave',
        startDate: '2026-05-26',
        endDate: '2026-05-27',
        reason: 'Severe flu and fever.',
        status: 'Pending'
      }
    ];

    for (const lr of leaveRequests) {
      await LeaveRequest.create(lr);
      console.log(`Leave request created for ${techDept.name}`);
    }

    console.log('Leave requests seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding leaves failed:', error);
    process.exit(1);
  }
};

seedLeaves();
