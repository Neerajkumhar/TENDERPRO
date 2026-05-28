const Message = require('../models/Message');
const { Op } = require('sequelize');

exports.getConversation = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    
    if (!userId1 || !userId2) {
      return res.status(400).json({ message: 'Both user IDs are required' });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 }
        ]
      },
      order: [['createdAt', 'ASC']]
    });
    
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Error fetching conversation', error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  console.log("SENDING MESSAGE REQUEST:", req.body);
  try {
    const { senderId, receiverId, text, attachmentUrl } = req.body;
    
    if (!senderId || !receiverId) {
      console.warn("MISSING IDs:", { senderId, receiverId });
      return res.status(400).json({ message: 'Sender and receiver IDs are required' });
    }

    const message = await Message.create({
      senderId,
      receiverId,
      text,
      attachmentUrl,
      read: false
    });
    
    console.log("MESSAGE CREATED SUCCESSFULLY:", message.id);
    res.status(201).json(message);
  } catch (error) {
    console.error('SERVER ERROR SENDING MESSAGE:', error);
    res.status(500).json({ 
      message: 'Server error creating message', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    
    await Message.update(
      { read: true },
      {
        where: {
          senderId: senderId,
          receiverId: receiverId,
          read: false
        }
      }
    );
    
    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Error updating messages', error: error.message });
  }
};

exports.getUnreadCounts = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const unreadCounts = await Message.findAll({
      where: {
        receiverId: userId,
        read: false
      },
      attributes: ['senderId', [Message.sequelize.fn('COUNT', 'id'), 'count']],
      group: ['senderId']
    });
    
    const result = {};
    unreadCounts.forEach(item => {
      result[item.senderId] = parseInt(item.getDataValue('count'), 10);
    });
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching unread counts:', error);
    res.status(500).json({ message: 'Error fetching unread counts', error: error.message });
  }
};
