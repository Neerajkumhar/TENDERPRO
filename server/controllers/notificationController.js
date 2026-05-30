const Notification = require('../models/Notification');
const { Op } = require('sequelize');

exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { panel } = req.query; // 'admin' or 'client'

    if (!panel) {
      return res.status(400).json({ message: 'Panel query parameter is required' });
    }

    const whereClause = {
      [Op.and]: [
        {
          [Op.or]: [
            { targetPanel: panel },
            { targetPanel: 'both' }
          ]
        },
        {
          [Op.or]: [
            { userId: null },
            { userId: userId }
          ]
        }
      ]
    };

    const notifications = await Notification.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: 100 // Limit to latest 100 notifications for performance
    });

    // Map to include a dynamic isRead for the requesting user
    const result = notifications.map(n => {
      const data = n.toJSON();
      let readArray = [];
      try {
        readArray = JSON.parse(data.readBy || '[]');
      } catch (e) {
        readArray = [];
      }
      data.isRead = readArray.includes(userId);
      return data;
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // Pass userId to mark it as read for them
    
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    let readArray = [];
    try {
      readArray = JSON.parse(notification.readBy || '[]');
    } catch(e) {
      readArray = [];
    }

    if (!readArray.includes(userId)) {
      readArray.push(userId);
      notification.readBy = JSON.stringify(readArray);
      await notification.save();
    }

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
};
