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

    try {
      // Notify Assignee
      if (task.assigneeId) {
        await require('../models/Notification').create({
          message: `New task assigned: ${task.title}`,
          type: 'TASK_CREATED',
          targetPanel: 'both',
          userId: task.assigneeId
        });
      }
      
      // Notify Admin
      await require('../models/Notification').create({
        message: `New task assigned: ${task.title}`,
        type: 'TASK_CREATED',
        targetPanel: 'admin',
        userId: null
      });

      // Notify Project Manager of the assignment's department
      if (task.assignmentId) {
        const assignment = await TenderAssignment.findByPk(task.assignmentId);
        if (assignment && assignment.departmentId) {
          const managers = await User.findAll({
            where: { role: 'Project Manager', departmentId: assignment.departmentId }
          });
          for (const m of managers) {
            await require('../models/Notification').create({
              message: `New task assigned in your department: ${task.title}`,
              type: 'TASK_CREATED',
              targetPanel: 'client',
              userId: m.id
            });
          }
        }
      }
    } catch(e) { console.error('Notification error:', e); }

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
    
    try {
      if (updateData.status && ['In Progress', 'Completed'].includes(updateData.status)) {
        // Notify Admin of task status changes
        await require('../models/Notification').create({
          message: `Task status updated to ${updateData.status}: ${task.title}`,
          type: 'TASK_UPDATED',
          targetPanel: 'admin',
          userId: null
        });

        // Notify Project Manager
        if (task.assignmentId) {
          const assignment = await TenderAssignment.findByPk(task.assignmentId);
          if (assignment && assignment.departmentId) {
            const managers = await User.findAll({
              where: { role: 'Project Manager', departmentId: assignment.departmentId }
            });
            for (const m of managers) {
              await require('../models/Notification').create({
                message: `Task status updated to ${updateData.status}: ${task.title}`,
                type: 'TASK_UPDATED',
                targetPanel: 'client',
                userId: m.id
              });
            }
          }
        }
      }
    } catch(e) { console.error('Notification error on task update:', e); }

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
