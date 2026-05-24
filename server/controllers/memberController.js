const User = require('../models/User');
const Department = require('../models/Department');

// Get all members
exports.getMembers = async (req, res) => {
  try {
    const Attendance = require('../models/Attendance');
    const members = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    const membersWithAttendance = await Promise.all(members.map(async (member) => {
      const latestAttendance = await Attendance.findOne({
        where: { userId: member.id },
        order: [['createdAt', 'DESC']]
      });

      const memberJSON = member.toJSON();

      if (latestAttendance) {
        memberJSON.lastLoginDate = latestAttendance.date;
        memberJSON.lastLoginTime = latestAttendance.inTime;
        // Dynamically override status: if outTime is null, they are currently Online/Active!
        if (!latestAttendance.outTime) {
          memberJSON.status = 'Active';
        } else {
          memberJSON.status = 'Offline';
        }
      } else {
        memberJSON.lastLoginDate = 'Never';
        memberJSON.lastLoginTime = null;
        memberJSON.status = 'Offline';
      }

      return memberJSON;
    }));

    res.json(membersWithAttendance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching members', error: error.message });
  }
};

// Get single member
exports.getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching member details', error: error.message });
  }
};

// Create a new member
exports.createMember = async (req, res) => {
  try {
    const { name, email, password, role, departmentId, phone } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const newMember = await User.create({
      name,
      email,
      password,
      role,
      departmentId,
      phone,
      status: 'Active'
    });

    // Update department member count if departmentId is provided
    if (departmentId) {
      const dept = await Department.findByPk(departmentId);
      if (dept) {
        await dept.increment('memberCount');
      }
    }

    // Return without password
    const memberResponse = newMember.toJSON();
    delete memberResponse.password;
    
    res.status(201).json(memberResponse);
  } catch (error) {
    res.status(500).json({ message: 'Error creating member', error: error.message });
  }
};

// Update a member
exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, departmentId, phone, image, status, password } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Member not found' });

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already taken by another user' });
      }
    }

    // Handle department count change
    const newDeptId = departmentId === '' ? null : departmentId;
    if (newDeptId !== user.departmentId) {
      // Decrement old
      if (user.departmentId) {
        const oldDept = await Department.findByPk(user.departmentId);
        if (oldDept) await oldDept.decrement('memberCount');
      }
      // Increment new
      if (newDeptId) {
        const newDept = await Department.findByPk(newDeptId);
        if (newDept) await newDept.increment('memberCount');
      }
    }

    const updateData = {
      name,
      email,
      role,
      departmentId: newDeptId,
      phone,
      image,
      status
    };

    if (password && password.trim() !== '') {
      updateData.password = password;
    }

    console.log('Updating member with data:', updateData);
    await user.update(updateData);

    const updatedUser = await User.findByPk(id, { attributes: { exclude: ['password'] } });
    res.json(updatedUser);
  } catch (error) {
    console.error('MEMBER UPDATE ERROR:', error);
    res.status(500).json({ message: 'Error updating member', error: error.message });
  }
};

// Delete a member
exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Member not found' });

    // Decrement department count
    if (user.departmentId) {
      const dept = await Department.findByPk(user.departmentId);
      if (dept) {
        await dept.decrement('memberCount');
      }
    }

    await user.destroy();
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting member', error: error.message });
  }
};
