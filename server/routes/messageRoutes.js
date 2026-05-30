const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');


// Send a new message
router.post('/', messageController.sendMessage);

// Get unread message counts for a user
router.get('/:userId/unread', messageController.getUnreadCounts);

// Get last message for each conversation of a user
router.get('/:userId/last-messages', messageController.getLastMessages);

// Mark messages from senderId to receiverId as read
router.put('/:senderId/:receiverId/read', messageController.markAsRead);

// Get sent-unread message counts for a user
router.get('/:userId/sent-unread', messageController.getSentUnreadCounts);

// Get all messages between two users (must be last to not catch /unread etc)
router.get('/:userId1/:userId2', messageController.getConversation);

module.exports = router;
