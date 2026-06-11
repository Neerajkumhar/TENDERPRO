const sequelize = require('./config/db');
async function run() {
  try {
    await sequelize.authenticate();
    await sequelize.query('ALTER TABLE Tenders ADD COLUMN completionRemark TEXT;');
    console.log('Column added successfully.');
  } catch (err) {
    if (err.message.includes('Duplicate column name')) {
      console.log('Column already exists.');
    } else {
      console.error('Error:', err.message);
    }
  } finally {
    process.exit();
  }
}
run();
