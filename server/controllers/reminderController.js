const Reminder = require('../models/Reminder');

// Get all reminders
exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.findAll({
      order: [['date', 'ASC']]
    });
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ message: 'Error fetching reminders', error: error.message });
  }
};

// Create a new reminder
exports.createReminder = async (req, res) => {
  try {
    const { title, description, date, type, time } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: 'Title and date are required' });
    }

    const newReminder = await Reminder.create({
      title,
      description,
      date,
      type: type || 'Reminder',
      time
    });

    res.status(201).json(newReminder);
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ message: 'Error creating reminder', error: error.message });
  }
};

// Delete a reminder
exports.deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findByPk(id);

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    await reminder.destroy();
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ message: 'Error deleting reminder', error: error.message });
  }
};
