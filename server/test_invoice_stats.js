const sequelize = require('./config/db');
const Invoice = require('./models/Invoice');
const Expense = require('./models/Expense');
const Payment = require('./models/Payment');

async function testStats() {
  try {
    await sequelize.authenticate();
    console.log('Database connection authenticated.');

    console.log('Querying Invoices...');
    const invoices = await Invoice.findAll();
    console.log(`Successfully fetched ${invoices.length} invoices.`);

    console.log('Querying Expenses...');
    const expenses = await Expense.findAll({
      where: { status: 'APPROVED' }
    });
    console.log(`Successfully fetched ${expenses.length} expenses.`);

    console.log('Querying Payments...');
    const payments = await Payment.findAll({
      where: { status: 'RECEIVED' }
    });
    console.log(`Successfully fetched ${payments.length} payments.`);
  } catch (error) {
    console.error('ERROR OCCURRED during stats test:', error);
  } finally {
    process.exit();
  }
}

testStats();
