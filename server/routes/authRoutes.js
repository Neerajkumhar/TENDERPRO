const express = require('express');
const { register, login, logout, getAttendance, getDepartmentAttendance, getAllAttendance } = require('../controllers/authController');
const router = express.Router();

// router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/attendance/:userId', getAttendance);
router.get('/attendance/department/:departmentId', getDepartmentAttendance);
router.get('/attendance/all/records', getAllAttendance);

module.exports = router;
