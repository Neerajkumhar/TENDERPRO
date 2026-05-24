const { Sequelize } = require('sequelize');
// Explicitly require mysql2 and pass it to Sequelize to bypass Vercel's dynamic import issues
const mysql2 = require('mysql2');
require('dotenv').config();

// Support for Railway and other environments
const dbUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

let sequelize;

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

if (dbUrl) {
  sequelize = new Sequelize(dbUrl, {
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: false,
    dialectOptions: {
      connectTimeout: 60000,
      ssl: {
        rejectUnauthorized: false // Often needed for remote DBs
      }
    },
    pool: {
      max: isProduction ? 1 : 5, // Serverless should have small pools
      min: 0,
      acquire: 60000,
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
      dialectModule: mysql2,
      logging: false,
      dialectOptions: {
        connectTimeout: 60000,
        ssl: {
          rejectUnauthorized: false
        }
      },
      pool: {
        max: isProduction ? 1 : 5,
        min: 0,
        acquire: 60000,
        idle: 10000
      }
    }
  );
}

module.exports = sequelize;
