const sequelize = require('./config/db');
const User = require('./models/User');

async function resetPassword() {
  try {
    await sequelize.authenticate();
    const user = await User.findOne({ where: { email: 'krish@vagwiin.com' } });
    if (user) {
      user.password = 'password123';
      await user.save();
      console.log('Password reset successfully for krish@vagwiin.com');
    } else {
      console.log('User krish@vagwiin.com not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

resetPassword();
