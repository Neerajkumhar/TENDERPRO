const Budget = require('../models/Budget');

const defaultBudgets = [
  { name: 'Logistics Expansion', department: 'OPERATIONS', status: 'ON TRACK', allocated: 150000, trend: '+2.4%', color: 'bg-blue-600', fiscalYear: '2024-25', period: 'ANNUAL', threshold: 80 },
  { name: 'Digital Ad Spend', department: 'MARKETING', status: 'ON TRACK', allocated: 85000, trend: '+1.2%', color: 'bg-emerald-500', fiscalYear: '2024-25', period: 'ANNUAL', threshold: 80 },
  { name: 'Core Infrastructure R&D', department: 'R&D', status: 'OVER BUDGET', allocated: 120000, trend: '+5.8%', color: 'bg-rose-500', fiscalYear: '2024-25', period: 'ANNUAL', threshold: 80 },
  { name: 'Recruitment Drive', department: 'HUMAN RESOURCES', status: 'ON TRACK', allocated: 45000, trend: '+0.5%', color: 'bg-amber-500', fiscalYear: '2024-25', period: 'ANNUAL', threshold: 80 },
  { name: 'Cloud Server Upgrades', department: 'IT INFRASTRUCTURE', status: 'UNDER BUDGET', allocated: 90000, trend: '-1.1%', color: 'bg-indigo-500', fiscalYear: '2024-25', period: 'ANNUAL', threshold: 80 },
];

exports.getBudgets = async (req, res) => {
  try {
    let budgets = await Budget.findAll({
      order: [['createdAt', 'ASC']]
    });

    // Seed default budgets if table is empty
    if (budgets.length === 0) {
      await Budget.bulkCreate(defaultBudgets);
      budgets = await Budget.findAll({
        order: [['createdAt', 'ASC']]
      });
    }

    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findByPk(req.params.id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json(budget);
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createBudget = async (req, res) => {
  try {
    const { name, department, allocated, status, trend, color, fiscalYear, period, threshold, description } = req.body;
    
    // Check if a budget with this name already exists
    const existing = await Budget.findOne({ where: { name: name.toUpperCase() } });
    if (existing) {
      return res.status(400).json({ message: `Budget category "${name.toUpperCase()}" already exists.` });
    }

    const newBudget = await Budget.create({
      name: name.toUpperCase(),
      department: department || 'OPERATIONS',
      allocated: parseFloat(allocated) || 0,
      status: status || 'ON TRACK',
      trend: trend || '0.0%',
      color: color || 'bg-indigo-500',
      fiscalYear: fiscalYear || '2024-25',
      period: period || 'ANNUAL',
      threshold: parseInt(threshold) || 80,
      description
    });

    res.status(201).json(newBudget);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const { name, department, allocated, status, trend, color, fiscalYear, period, threshold, description } = req.body;
    const budget = await Budget.findByPk(req.params.id);
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    await budget.update({
      name: name ? name.toUpperCase() : budget.name,
      department: department || budget.department,
      allocated: allocated !== undefined ? parseFloat(allocated) : budget.allocated,
      status: status || budget.status,
      trend: trend || budget.trend,
      color: color || budget.color,
      fiscalYear: fiscalYear || budget.fiscalYear,
      period: period || budget.period,
      threshold: threshold !== undefined ? parseInt(threshold) : budget.threshold,
      description: description !== undefined ? description : budget.description
    });

    res.json(budget);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findByPk(req.params.id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    await budget.destroy();
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
