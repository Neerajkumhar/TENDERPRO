const User = require('./models/User');
const TenderAssignment = require('./models/TenderAssignment');
const Department = require('./models/Department');
const Tender = require('./models/Tender');
const sequelize = require('./config/db');

async function checkData() {
  try {
    await sequelize.authenticate();
    
    console.log('--- DEPARTMENTS ---');
    const depts = await Department.findAll({ raw: true });
    console.table(depts);

    console.log('\n--- USERS ---');
    const users = await User.findAll({ 
      attributes: ['id', 'name', 'email', 'role', 'departmentId'],
      raw: true 
    });
    console.table(users);

    console.log('\n--- TENDER ASSIGNMENTS ---');
    const assignments = await TenderAssignment.findAll({ 
      include: [
        { model: Tender, as: 'tender', attributes: ['title'] },
        { model: Department, as: 'department', attributes: ['name'] }
      ]
    });
    
    const formattedAssignments = assignments.map(a => ({
      id: a.id,
      tender: a.tender?.title,
      department: a.department?.name,
      departmentId: a.departmentId,
      status: a.status
    }));
    console.table(formattedAssignments);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkData();
