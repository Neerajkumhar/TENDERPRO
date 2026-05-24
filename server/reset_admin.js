const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: 'server/.env' });

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false
});

async function reset() {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('admin123', salt);
  await sequelize.query(`UPDATE Users SET password = '${hash}' WHERE email = 'vikash@vagwiin.com'`);
  console.log('Password reset to admin123 for vikash@vagwiin.com');
}
reset();
