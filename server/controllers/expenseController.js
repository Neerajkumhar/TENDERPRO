const Expense = require('../models/Expense');

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const { id, department, category, vendor, date, description, amount, status, document } = req.body;
    
    let existing = null;
    if (id) {
      existing = await Expense.findByPk(id);
    }

    if (existing) {
      await existing.update({
        department, category, vendor, date, description, amount, status, document
      });
      return res.status(200).json(existing);
    }

    const count = await Expense.count();
    const newId = id || `EXP-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const newExpense = await Expense.create({
      id: newId,
      department,
      category,
      vendor,
      date,
      description,
      amount,
      status: status || 'PENDING',
      document
    });

    try {
      await require('../models/Notification').create({
        message: `New expense added: ${newExpense.id}`,
        type: 'EXPENSE_CREATED',
        targetPanel: 'both'
      });
    } catch (e) {}

    res.status(201).json(newExpense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { department, category, vendor, date, description, amount, status, document } = req.body;
    const expense = await Expense.findByPk(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await expense.update({
      department, category, vendor, date, description, amount, status, document
    });

    res.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await expense.destroy();
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
