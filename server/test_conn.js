const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2');
require('dotenv').config();

const dbUrl = process.env.MYSQL_URL;

async function test() {
  console.log('Testing with URL:', dbUrl.split('@')[1]); // Log only host part
  const s1 = new Sequelize(dbUrl, {
    dialect: 'mysql',
    dialectModule: mysql2,
    dialectOptions: { connectTimeout: 10000 }
  });

  try {
    await s1.authenticate();
    console.log('Success with URL');
  } catch (e) {
    console.log('Failed with URL:', e.message);
  }

  console.log('Testing without SSL...');
  const s2 = new Sequelize(
    process.env.MYSQLDATABASE,
    process.env.MYSQLUSER,
    process.env.MYSQLPASSWORD,
    {
      host: process.env.MYSQLHOST,
      port: process.env.MYSQLPORT,
      dialect: 'mysql',
      dialectModule: mysql2,
      dialectOptions: { connectTimeout: 10000 }
    }
  );

  try {
    await s2.authenticate();
    console.log('Success without SSL');
  } catch (e) {
    console.log('Failed without SSL:', e.message);
  }
}

test();
