const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Get all messages between two users
router.get('/:userId1/:userId2', messageController.getConversation);

// Send a new message
router.post('/', messageController.sendMessage);

// Get unread message counts for a user
router.get('/:userId/unread', messageController.getUnreadCounts);

// Mark messages from senderId to receiverId as read
router.put('/:senderId/:receiverId/read', messageController.markAsRead);

module.exports = router;
