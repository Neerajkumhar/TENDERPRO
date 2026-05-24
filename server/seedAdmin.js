const User = require('./models/User');
const sequelize = require('./config/db');

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Sync models
    await sequelize.sync();
    
    const adminEmail = 'vikash@vagwiin.com';
    const adminPass = '12345678';
    const adminName = 'Vikash';

    const existingUser = await User.findOne({ where: { email: adminEmail } });
    if (existingUser) {
      existingUser.password = adminPass;
      await existingUser.save();
      console.log('Admin user password updated successfully.');
    } else {
      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPass,
      });
      console.log('Admin user created successfully.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

seedAdmin();
