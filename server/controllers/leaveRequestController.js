const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

exports.createLeaveRequest = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.create(req.body);
    res.status(201).json(leaveRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'email', 'role', 'departmentId'] }]
    });
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLeaveRequestsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const leaveRequests = await LeaveRequest.findAll({
      include: [{ 
        model: User, 
        where: { departmentId },
        attributes: ['id', 'name', 'email', 'role'] 
      }]
    });
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateLeaveRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const leaveRequest = await LeaveRequest.findByPk(id);
    if (!leaveRequest) return res.status(404).json({ message: 'Leave request not found' });
    
    leaveRequest.status = status;
    await leaveRequest.save();
    res.json(leaveRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
