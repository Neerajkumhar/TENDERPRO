const express = require('express');
const { register, login, logout, getAttendance, getDepartmentAttendance, getAllAttendance, initAdmin } = require('../controllers/authController');
const router = express.Router();

// router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/attendance/:userId', getAttendance);
router.get('/attendance/department/:departmentId', getDepartmentAttendance);
router.get('/attendance/all/records', getAllAttendance);
router.get('/init-admin', initAdmin);

module.exports = router;
