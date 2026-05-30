const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// GET all expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET single expense by ID
router.get('/:id', async (req, res) => {
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
});

// POST create new expense
router.post('/', async (req, res) => {
  try {
    const { id, category, vendor, date, description, amount, status, document } = req.body;
    
    // Check if ID already exists
    let existing = null;
    if (id) {
      existing = await Expense.findByPk(id);
    }

    if (existing) {
      // Update existing instead
      await existing.update({
        category, vendor, date, description, amount, status, document
      });
      try {
        await require('../models/Notification').create({
          message: `Expense ${existing.id} updated`,
          type: 'EXPENSE_UPDATED',
          targetPanel: 'both'
        });
      } catch (e) {}
      return res.status(200).json(existing);
    }

    const newExpense = await Expense.create({
      id: id || `EXP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
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
});

// PUT update expense
router.put('/:id', async (req, res) => {
  try {
    const { category, vendor, date, description, amount, status, document } = req.body;
    const expense = await Expense.findByPk(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await expense.update({
      category, vendor, date, description, amount, status, document
    });

    res.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE expense
router.delete('/:id', async (req, res) => {
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
});

module.exports = router;
