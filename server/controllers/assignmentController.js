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

    try {
      const tender = await Tender.findByPk(tenderId);
      const department = await Department.findByPk(departmentId);
      await require('../models/Notification').create({
        message: `Tender ${tender?.title || tenderId} assigned to department: ${department?.name || departmentId}`,
        type: 'TENDER_ASSIGNED',
        targetPanel: 'admin',
        userId: null
      });

      // Notify Project and Tender Managers of the assigned department
      const managers = await User.findAll({
        where: { 
          role: { [require('sequelize').Op.in]: ['Project Manager', 'Tender Manager'] },
          departmentId: departmentId 
        }
      });
      for (const m of managers) {
        await require('../models/Notification').create({
          message: `New tender assigned to your department: ${tender?.title || tenderId}`,
          type: 'TENDER_ASSIGNED',
          targetPanel: 'client',
          userId: m.id
        });
      }
    } catch(e) { console.error('Notification error on assignment:', e); }

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating assignment', error: error.message });
  }
};

// Get all assignments with tender and department info
exports.getAssignments = async (req, res) => {
  try {
    let assignments = await TenderAssignment.findAll({
      include: [
        { 
          model: Tender, 
          as: 'tender', 
          attributes: ['title', 'budget', 'status', 'reference', 'teamAssignments'],
          include: [{ model: require('../models/Client'), as: 'client', attributes: ['name'] }]
        },
        { model: Department, as: 'department', attributes: ['name'] },
        { model: User, as: 'assignee', attributes: ['name', 'image'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    assignments = assignments.map(a => {
      const assignmentObj = a.toJSON();
      if (assignmentObj.tender && assignmentObj.tender.teamAssignments) {
        let ta = assignmentObj.tender.teamAssignments;
        if (typeof ta === 'string') {
          try {
            assignmentObj.tender.teamAssignments = JSON.parse(ta);
          } catch(e) {
            assignmentObj.tender.teamAssignments = {};
          }
        }
      }
      return assignmentObj;
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
