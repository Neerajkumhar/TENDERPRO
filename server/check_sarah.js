const User = require('./models/User');
const Department = require('./models/Department');
const sequelize = require('./config/db');

async function checkSarah() {
  try {
    await sequelize.authenticate();
    
    // Ensure associations
    User.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

    console.log('\n--- FETCHING SARAH\'S DATABASE RECORD ---');
    const sarah = await User.findOne({
      where: { email: 'sarah@vagwiin.com' },
      include: [{ model: Department, as: 'department' }],
      raw: true,
      nest: true
    });

    if (sarah) {
      console.log('User Found:');
      console.log(JSON.stringify(sarah, null, 2));
    } else {
      console.log('Sarah not found in the database.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkSarah();
