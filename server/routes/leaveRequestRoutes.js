const express = require('express');
const router = express.Router();
const leaveRequestController = require('../controllers/leaveRequestController');

router.post('/', leaveRequestController.createLeaveRequest);
router.get('/', leaveRequestController.getAllLeaveRequests);
router.get('/user/:userId', leaveRequestController.getLeaveRequestsByUser);
router.get('/department/:departmentId', leaveRequestController.getLeaveRequestsByDepartment);
router.get('/balance/:userId', leaveRequestController.getLeaveBalance);
router.put('/:id/status', leaveRequestController.updateLeaveRequestStatus);

module.exports = router;
