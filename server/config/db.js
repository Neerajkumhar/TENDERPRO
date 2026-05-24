const { Sequelize } = require('sequelize');
require('dotenv').config();

// Support for Railway and other environments
const dbUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

let sequelize;

if (dbUrl) {
  sequelize = new Sequelize(dbUrl, {
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  sequelize = new Sequelize(
    process.env.MYSQLDATABASE || process.env.DB_NAME,
    process.env.MYSQLUSER || process.env.DB_USER,
    process.env.MYSQLPASSWORD || process.env.DB_PASS,
    {
      host: process.env.MYSQLHOST || process.env.DB_HOST,
      port: process.env.MYSQLPORT || 3306,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

module.exports = sequelize;
