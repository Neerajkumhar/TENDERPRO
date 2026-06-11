const sequelize = require('./config/db');

async function checkTables() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query('SHOW TABLES');
    const tableNames = results.map(r => Object.values(r)[0]);
    
    for (const tableName of tableNames) {
      console.log(`\nTable: ${tableName}`);
      const [columns] = await sequelize.query(`SHOW COLUMNS FROM \`${tableName}\``);
      console.table(columns);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkTables();
