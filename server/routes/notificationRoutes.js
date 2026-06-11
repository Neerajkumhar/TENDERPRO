const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Mark all notifications as read
router.put('/read-all', notificationController.markAllAsRead);

// Get notifications for a user/panel
router.get('/:userId', notificationController.getNotifications);

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
