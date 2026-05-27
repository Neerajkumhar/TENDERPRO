const sequelize = require('./config/db');
const bcrypt = require('bcryptjs');

async function reset() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('12345678', salt);
    await sequelize.query(`UPDATE Users SET password = '${hash}' WHERE email = 'vikash@vagwiin.com'`);
    console.log('Password reset to 12345678 for vikash@vagwiin.com');
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await sequelize.close();
  }
}
reset();
