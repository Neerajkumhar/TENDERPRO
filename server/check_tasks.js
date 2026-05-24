const sequelize = require('./config/db');
const Task = require('./models/Task');
const User = require('./models/User');
const Tender = require('./models/Tender');

async function check() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    
    // Check Task columns
    const [results] = await sequelize.query('DESCRIBE Tasks');
    console.log('Task table columns:', results.map(r => r.Field));

    const tasks = await Task.findAll({
      include: [
        { model: User, as: 'assignee', attributes: ['name'] },
        { model: User, as: 'creator', attributes: ['name'] },
        { model: Tender, as: 'tender', attributes: ['title'] }
      ]
    });
    console.log('Tasks fetched successfully:', tasks.length);
    process.exit(0);
  } catch (err) {
    console.error('Error during check:', err);
    process.exit(1);
  }
}

check();
