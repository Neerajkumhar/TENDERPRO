const sequelize = require('./config/db');
const Department = require('./models/Department');
const User = require('./models/User');
const Client = require('./models/Client');

const seed = async () => {
  try {
    await sequelize.sync({ force: false }); // Don't wipe everything if it exists

    // Create Departments
    const depts = [
      { name: 'Technical', color: '#3b82f6', description: 'Technical and Engineering department' },
      { name: 'Finance', color: '#10b981', description: 'Financial and Accounts department' },
      { name: 'Legal', color: '#6366f1', description: 'Legal and Compliance department' },
      { name: 'Operations', color: '#f59e0b', description: 'Operations and Logistics department' }
    ];

    for (const dept of depts) {
      const [d] = await Department.findOrCreate({
        where: { name: dept.name },
        defaults: dept
      });
      console.log(`Department ${d.name} ready`);
    }

    const allDepts = await Department.findAll();
    const techDept = allDepts.find(d => d.name === 'Technical');
    const financeDept = allDepts.find(d => d.name === 'Finance');

    // Create Users (Team Members)
    const users = [
      { 
        name: 'John Doe', 
        email: 'john@example.com', 
        password: 'password123', 
        role: 'Tender Manager', 
        departmentId: techDept.id,
        status: 'Active'
      },
      { 
        name: 'Sarah Wilson', 
        email: 'sarah@example.com', 
        password: 'password123', 
        role: 'Admin', 
        departmentId: financeDept.id,
        status: 'Active'
      },
      { 
        name: 'Mike Ross', 
        email: 'mike@example.com', 
        password: 'password123', 
        role: 'Core Team', 
        departmentId: techDept.id,
        status: 'Active'
      }
    ];

    for (const user of users) {
      const [u, created] = await User.findOrCreate({
        where: { email: user.email },
        defaults: user
      });
      if (created) {
        // Update member count
        const dept = await Department.findByPk(u.departmentId);
        if (dept) await dept.increment('memberCount');
        console.log(`User ${u.name} created`);
      } else {
        console.log(`User ${u.name} already exists`);
      }
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
