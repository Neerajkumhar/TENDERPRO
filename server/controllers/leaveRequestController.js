const LeaveRequest = require('../models/LeaveRequest');
const LeaveBalance = require('../models/LeaveBalance');
const User = require('../models/User');
const { Op } = require('sequelize');

// Helper to calculate business days between dates
const calculateDays = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  const diffTime = Math.abs(e - s);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

exports.createLeaveRequest = async (req, res) => {
  try {
    const { userId, leaveType, startDate, endDate } = req.body;
    
    // 1. Check for overlapping requests
    const overlap = await LeaveRequest.findOne({
      where: {
        userId,
        status: { [Op.ne]: 'Rejected' },
        [Op.or]: [
          { startDate: { [Op.between]: [startDate, endDate] } },
          { endDate: { [Op.between]: [startDate, endDate] } }
        ]
      }
    });

    if (overlap) {
      return res.status(400).json({ message: 'You already have a leave request during these dates.' });
    }

    // 2. Check balance (if not unpaid)
    if (leaveType !== 'Unpaid Leave') {
      const balance = await LeaveBalance.findOne({ where: { userId, year: new Date().getFullYear() } });
      if (!balance) return res.status(400).json({ message: 'Leave balance record not found.' });
      
      const requestedDays = calculateDays(startDate, endDate);
      const typeKey = leaveType.split(' ')[0].toLowerCase(); // 'annual', 'sick', etc.
      
      if (balance[typeKey] < requestedDays) {
        return res.status(400).json({ message: `Insufficient ${leaveType} balance. Remaining: ${balance[typeKey]} days.` });
      }
    }

    const leaveRequest = await LeaveRequest.create(req.body);
    res.status(201).json(leaveRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateLeaveRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approverId, managerComment } = req.body;
    
    const leaveRequest = await LeaveRequest.findByPk(id);
    if (!leaveRequest) return res.status(404).json({ message: 'Leave request not found' });
    
    if (leaveRequest.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending requests can be updated.' });
    }

    // If approved, deduct from balance
    if (status === 'Approved' && leaveRequest.leaveType !== 'Unpaid Leave') {
      const balance = await LeaveBalance.findOne({ 
        where: { userId: leaveRequest.userId, year: new Date(leaveRequest.startDate).getFullYear() } 
      });
      
      if (balance) {
        const days = calculateDays(leaveRequest.startDate, leaveRequest.endDate);
        const typeKey = leaveRequest.leaveType.split(' ')[0].toLowerCase();
        balance[typeKey] -= days;
        await balance.save();
      }
    }

    leaveRequest.status = status;
    leaveRequest.approverId = approverId;
    leaveRequest.managerComment = managerComment;
    await leaveRequest.save();
    
    res.json(leaveRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLeaveBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const balance = await LeaveBalance.findOne({ where: { userId, year: new Date().getFullYear() } });
    res.json(balance || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLeaveRequestsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const leaveRequests = await LeaveRequest.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.findAll({
      include: [{ 
        model: User, 
        attributes: ['id', 'name', 'email', 'role', 'image'] 
      }],
      order: [['createdAt', 'DESC']]
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
        attributes: ['id', 'name', 'email', 'role', 'image'] 
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
