const TenderAssignment = require('../models/TenderAssignment');
const Tender = require('../models/Tender');
const Department = require('../models/Department');
const User = require('../models/User');

// Create a new assignment
exports.createAssignment = async (req, res) => {
  try {
    const { title, tenderId, departmentId, assigneeId, description, priority, deadline } = req.body;
    
    if (!tenderId || !departmentId || !description) {
      return res.status(400).json({ message: 'Tender ID, Department ID, and Description are required' });
    }

    const assignment = await TenderAssignment.create({
      title: title || null,
      tenderId: tenderId || null,
      departmentId: departmentId || null,
      assigneeId: (assigneeId && assigneeId !== '') ? assigneeId : null,
      description,
      priority,
      deadline: deadline || null
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating assignment', error: error.message });
  }
};

// Get all assignments with tender and department info
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await TenderAssignment.findAll({
      include: [
        { 
          model: Tender, 
          as: 'tender', 
          attributes: ['title', 'budget', 'status', 'reference'],
          include: [{ model: require('../models/Client'), as: 'client', attributes: ['name'] }]
        },
        { model: Department, as: 'department', attributes: ['name'] },
        { model: User, as: 'assignee', attributes: ['name', 'image'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignments', error: error.message });
  }
};

// Update assignment status
exports.updateAssignmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const assignment = await TenderAssignment.findByPk(id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    
    assignment.status = status;
    await assignment.save();
    
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating assignment status', error: error.message });
  }
};

// Get single assignment details
exports.getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await TenderAssignment.findByPk(id, {
      include: [
        { 
          model: Tender, 
          as: 'tender',
          include: [{ model: require('../models/Client'), as: 'client', attributes: ['name'] }]
        },
        { model: Department, as: 'department', attributes: ['name'] },
        { model: User, as: 'assignee', attributes: ['name', 'email', 'image', 'role'] }
      ]
    });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignment details', error: error.message });
  }
};

// Update assignment details
exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, tenderId, departmentId, assigneeId, description, priority, deadline, status } = req.body;
    
    const assignment = await TenderAssignment.findByPk(id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    
    await assignment.update({
      title,
      tenderId,
      departmentId,
      assigneeId,
      description,
      priority,
      deadline: deadline || null,
      status
    });
    
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating assignment', error: error.message });
  }
};

// Delete assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await TenderAssignment.findByPk(id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    
    await assignment.destroy();
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting assignment', error: error.message });
  }
};
