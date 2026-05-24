const Department = require('../models/Department');

// Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error: error.message });
  }
};

// Create a new department
exports.createDepartment = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const newDepartment = await Department.create({
      name,
      description,
      color
    });
    res.status(201).json(newDepartment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating department', error: error.message });
  }
};

// Delete a department
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await Department.destroy({ where: { id } });
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting department', error: error.message });
  }
};
