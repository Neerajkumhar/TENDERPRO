const express = require('express');
const { register, login, logout, getAttendance, getDepartmentAttendance, getAllAttendance, initAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/attendance/:userId', protect, getAttendance);
router.get('/attendance/department/:departmentId', protect, getDepartmentAttendance);
router.get('/attendance/all/records', protect, getAllAttendance);
router.get('/init-admin', initAdmin);

module.exports = router;
