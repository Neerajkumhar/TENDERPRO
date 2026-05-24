const Task = require('../models/Task');
const User = require('../models/User');
const Tender = require('../models/Tender');
const TenderAssignment = require('../models/TenderAssignment');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { tenderId, assignmentId, assigneeId, creatorId, title, description, priority, deadline } = req.body;
    
    const task = await Task.create({
      tenderId,
      assignmentId,
      assigneeId: assigneeId || null,
      creatorId: creatorId || null,
      title,
      description,
      priority,
      deadline: deadline || null
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

// Get tasks (optionally filtered by tender/assignment)
exports.getTasks = async (req, res) => {
  try {
    const { tenderId, assignmentId } = req.query;
    const where = {};
    if (tenderId) where.tenderId = tenderId;
    if (assignmentId) where.assignmentId = assignmentId;

    const tasks = await Task.findAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['name', 'image', 'role'] },
        { model: User, as: 'creator', attributes: ['name', 'image', 'role'] },
        { model: Tender, as: 'tender', attributes: ['title'] },
        { model: TenderAssignment, as: 'assignment', attributes: ['departmentId'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

// Get task by ID
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id, {
      include: [
        { model: User, as: 'assignee', attributes: ['name', 'image', 'role'] },
        { model: User, as: 'creator', attributes: ['name', 'image', 'role'] },
        { model: Tender, as: 'tender', attributes: ['title'] },
        { model: TenderAssignment, as: 'assignment', attributes: ['departmentId'] }
      ]
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error: error.message });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    await task.update(updateData);
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    await task.destroy();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};
