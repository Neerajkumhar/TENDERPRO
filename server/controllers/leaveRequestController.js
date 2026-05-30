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
      let balance = await LeaveBalance.findOne({ where: { userId, year: new Date().getFullYear() } });
      
      // Auto-create balance if not found
      if (!balance) {
        balance = await LeaveBalance.create({
          userId,
          year: new Date().getFullYear(),
          annual: 20,
          sick: 10,
          casual: 8,
          unpaid: 0
        });
      }
      
      const requestedDays = calculateDays(startDate, endDate);
      const typeKey = leaveType.split(' ')[0].toLowerCase(); // 'annual', 'sick', etc.
      
      if (balance[typeKey] < requestedDays) {
        return res.status(400).json({ message: `Insufficient ${leaveType} balance. Remaining: ${balance[typeKey]} days.` });
      }
    }

    const leaveRequest = await LeaveRequest.create(req.body);

    try {
      const requester = await User.findByPk(userId);
      if (requester) {
        let whereClause = {};
        if (['Tender Manager', 'Project Manager', 'Finance Manager'].includes(requester.role)) {
          whereClause.role = 'Admin';
        } else {
          whereClause = {
            [Op.or]: [
              { role: 'Admin' },
              {
                role: { [Op.in]: ['Tender Manager', 'Project Manager', 'Finance Manager'] },
                departmentId: requester.departmentId || null
              }
            ]
          };
        }

        const targetUsers = await User.findAll({
          where: whereClause
        });

        for (const u of targetUsers) {
          await require('../models/Notification').create({
            message: `New leave request from ${requester.name}`,
            type: 'LEAVE_REQUESTED',
            targetPanel: 'both',
            userId: u.id,
            actionUrl: 'Team Attendance'
          });
        }
      }
    } catch(e) { console.error('Notification error:', e); }

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
    
    try {
      const requester = await User.findByPk(leaveRequest.userId);
      
      if (requester) {
        // 1. Notify the team member who requested the leave
        await require('../models/Notification').create({
          message: `Your leave request was ${status}`,
          type: 'LEAVE_UPDATED',
          targetPanel: 'both',
          userId: leaveRequest.userId,
          actionUrl: 'Attendance'
        });

        // 2. Notify Managers and Admins on other panels about the status update
        let whereClause = {};
        if (['Tender Manager', 'Project Manager', 'Finance Manager'].includes(requester.role)) {
          // If a manager's leave was updated, let Admins know
          whereClause.role = 'Admin';
        } else {
          // If a core team member's leave was updated, let their specific department manager AND Admin know
          whereClause = {
            [Op.or]: [
              { role: 'Admin' },
              {
                role: { [Op.in]: ['Tender Manager', 'Project Manager', 'Finance Manager'] },
                departmentId: requester.departmentId || null
              }
            ]
          };
        }

        const targetUsers = await User.findAll({
          where: whereClause
        });

        for (const u of targetUsers) {
          // Don't send the manager notification to the person who requested it (if a manager requested it)
          if (u.id !== leaveRequest.userId) {
            await require('../models/Notification').create({
              message: `Leave request for ${requester.name} was ${status}`,
              type: 'LEAVE_UPDATED',
              targetPanel: 'both',
              userId: u.id,
              actionUrl: 'Team Attendance'
            });
          }
        }
      }
    } catch(e) { console.error('Notification error:', e); }

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
