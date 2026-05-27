const User = require('./models/User');
const sequelize = require('./config/db');

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
    
    const adminData = {
      name: 'Vikash',
      email: 'vikash@vagwiin.com',
      password: '12345678',
      role: 'Admin'
    };

    const [user, created] = await User.findOrCreate({
      where: { email: adminData.email },
      defaults: adminData
    });

    if (!created) {
      user.password = adminData.password;
      user.role = 'Admin';
      await user.save();
      console.log('User already existed. Updated password and ensured Admin role.');
    } else {
      console.log('Admin user created successfully.');
    }
  } catch (error) {
    console.error('Operation failed:', error.message);
    if (error.message.includes('ETIMEDOUT')) {
      console.log('\nTIP: Your database is blocking the connection. Ensure you have added 0.0.0.0/0 to your Railway MySQL Allow List.');
    }
  } finally {
    await sequelize.close();
  }
}

createAdmin();
