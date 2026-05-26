const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

exports.initAdmin = async (req, res) => {
  try {
    const adminEmail = 'vikash@vagwiin.com';
    const adminPass = '12345678';
    const adminName = 'Vikash';

    const existingUser = await User.findOne({ where: { email: adminEmail } });
    if (existingUser) {
      existingUser.password = adminPass;
      existingUser.role = 'Admin';
      await existingUser.save();
      return res.json({ message: 'Admin user updated successfully' });
    }

    await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPass,
      role: 'Admin'
    });

    res.json({ message: 'Admin user created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.register = async (req, res) => {
...
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Record dynamic login dashboard session
    const Attendance = require('../models/Attendance');
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const hrs = now.getHours();
    const mins = now.getMinutes();
    const status = (hrs > 9 || (hrs === 9 && mins > 15)) ? 'LATE' : 'ON TIME';

    const session = await Attendance.create({
      userId: user.id,
      date: todayStr,
      inTime: now,
      status
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      token: generateToken(user.id),
      sessionId: session.id,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (sessionId) {
      const Attendance = require('../models/Attendance');
      const session = await Attendance.findByPk(sessionId);
      if (session) {
        const now = new Date();
        const workMin = Math.round((now - new Date(session.inTime)) / 60000);
        await session.update({
          outTime: now,
          workMin
        });
      }
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    const Attendance = require('../models/Attendance');
    const records = await Attendance.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDepartmentAttendance = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const Attendance = require('../models/Attendance');
    const User = require('../models/User');

    const users = await User.findAll({
      where: { departmentId },
      attributes: ['id', 'name', 'email', 'role', 'createdAt']
    });

    const userIds = users.map(u => u.id);
    const records = await Attendance.findAll({
      where: { userId: userIds },
      order: [['createdAt', 'DESC']]
    });

    const userMap = {};
    users.forEach(u => { userMap[u.id] = u; });
    const formatted = records.map(r => ({
      ...r.toJSON(),
      User: userMap[r.userId]
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const Attendance = require('../models/Attendance');
    const User = require('../models/User');

    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt']
    });

    const records = await Attendance.findAll({
      order: [['createdAt', 'DESC']]
    });

    const userMap = {};
    users.forEach(u => { userMap[u.id] = u; });
    const formatted = records.map(r => ({
      ...r.toJSON(),
      User: userMap[r.userId]
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
