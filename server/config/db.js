const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Support for Railway, AWS RDS, Vercel and other environments
const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.MYSQL_URL;

let sequelize;

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
const useSsl = process.env.DB_SSL === 'true' || isProduction;

if (process.env.DB_DIALECT === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false
  });
} else if (dbUrl) {
  const isMysql = dbUrl.startsWith('mysql');
  console.log(`Connecting to ${isMysql ? 'MySQL' : 'PostgreSQL'} via URL`);
  
  sequelize = new Sequelize(dbUrl, {
    dialect: isMysql ? 'mysql' : 'postgres',
    dialectModule: isMysql ? require('mysql2') : require('pg'),
    logging: false,
    dialectOptions: {
      connectTimeout: 60000,
      ssl: useSsl ? {
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: isProduction ? 5 : 10,
      min: 0,
      acquire: 60000,
      idle: 10000
    }
  });
} else {
  // Default to PostgreSQL but allow override via environment variables
  const dialect = process.env.DB_DIALECT || 'postgres';
  const isMysql = dialect === 'mysql';
  
  sequelize = new Sequelize(
    process.env.DB_NAME || process.env.MYSQLDATABASE || 'postgres',
    process.env.DB_USER || process.env.MYSQLUSER || 'postgres',
    process.env.DB_PASS || process.env.MYSQLPASSWORD || '',
    {
      host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
      port: process.env.DB_PORT || process.env.MYSQLPORT || (isMysql ? 3306 : 5432),
      dialect: dialect,
      dialectModule: isMysql ? require('mysql2') : require('pg'),
      logging: false,
      dialectOptions: {
        connectTimeout: 60000,
        ssl: useSsl ? {
          rejectUnauthorized: false
        } : false
      },
      pool: {
        max: isProduction ? 5 : 10,
        min: 0,
        acquire: 60000,
        idle: 10000
      }
    }
  );
}

module.exports = sequelize;
