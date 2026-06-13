const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Support for Railway and other environments
const dbUrl = process.env.DATABASE_URL;

let sequelize;

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

if (dbUrl) {
  console.log('Connecting to DB via URL:', dbUrl.split('@')[1] || 'URL present');
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      connectTimeout: 60000,
      ssl: isProduction ? {
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: isProduction ? 1 : 5,
      min: 0,
      acquire: 60000,
      idle: 10000
    }
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        connectTimeout: 60000,
        ssl: isProduction ? {
          rejectUnauthorized: false
        } : false
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
