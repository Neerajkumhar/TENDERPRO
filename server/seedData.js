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

    // Create Dummy Clients if none exist
    const clientCount = await Client.count();
    if (clientCount === 0) {
      const dummyClients = [
        { name: 'Apex Infrastructure Ltd.', industry: 'Construction', location: 'New York, NY', email: 'contact@apexinfra.com', phone: '+1 (555) 123-4567', status: 'Active', value: '12400000', firmType: 'Private', manager: 'Sarah Jenkins' },
        { name: 'Global Tech Solutions', industry: 'IT Services', location: 'San Francisco, CA', email: 'info@globaltech.io', phone: '+1 (555) 987-6543', status: 'Active', value: '3800000', firmType: 'Private', manager: 'Michael Chen' },
        { name: 'Metro City Council', industry: 'Government', location: 'Chicago, IL', email: 'tenders@metrocity.gov', phone: '+1 (555) 456-7890', status: 'Active', value: '22100000', firmType: 'Govt', manager: 'Robert Taylor' },
        { name: 'Horizon Healthcare', industry: 'Healthcare', location: 'Boston, MA', email: 'admin@horizonhealth.org', phone: '+1 (555) 234-5678', status: 'Active', value: '5600000', firmType: 'Private', manager: 'Emily White' },
        { name: 'EcoEnergy Systems', industry: 'Renewable Energy', location: 'Austin, TX', email: 'sales@ecoenergy.com', phone: '+1 (555) 345-6789', status: 'Pending', value: '8200000', firmType: 'Private', manager: 'David Miller' }
      ];

      for (const client of dummyClients) {
        await Client.create(client);
      }
      console.log('High-fidelity dummy clients created');
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
