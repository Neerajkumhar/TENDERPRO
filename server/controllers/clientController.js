const Client = require('../models/Client');

// Add new client
exports.createClient = async (req, res) => {
  try {
    const { name, email, phone, website, location, industry, status, manager, value, firmType, managerEmail, managerPhone, managerPhoto } = req.body;

    const newClient = await Client.create({
      name,
      email,
      phone,
      website,
      location,
      industry,
      status,
      manager,
      value,
      firmType,
      managerEmail,
      managerPhone,
      managerPhoto,
      date: new Date()
    });

    try {
      await require('../models/Notification').create({
        message: `New client added: ${newClient.name}`,
        type: 'CLIENT_CREATED',
        targetPanel: 'admin',
        userId: null
      });

      // Notify all Tender Managers
      const User = require('../models/User');
      const tenderManagers = await User.findAll({ where: { role: 'Tender Manager' } });
      for (const tm of tenderManagers) {
        await require('../models/Notification').create({
          message: `New client added: ${newClient.name}`,
          type: 'CLIENT_CREATED',
          targetPanel: 'client',
          userId: tm.id
        });
      }
    } catch(e) { console.error('Notification error on client creation:', e); }

    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all clients
exports.getClients = async (req, res) => {
  try {
    const clients = await Client.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update client
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Client.update(req.body, {
      where: { id: id }
    });
    
    if (updated) {
      const updatedClient = await Client.findByPk(id);
      return res.status(200).json(updatedClient);
    }
    throw new Error('Client not found');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete client
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Client.destroy({
      where: { id: id }
    });
    
    if (deleted) {
      return res.status(204).send("Client deleted");
    }
    throw new Error('Client not found');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all interactions for a specific client
exports.getClientInteractions = async (req, res) => {
  try {
    const { clientId } = req.params;
    const ClientInteraction = require('../models/ClientInteraction');
    const interactions = await ClientInteraction.findAll({
      where: { clientId: clientId },
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });
    res.json(interactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new interaction for a client
exports.createClientInteraction = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { type, text, user, date } = req.body;
    const ClientInteraction = require('../models/ClientInteraction');

    const newInteraction = await ClientInteraction.create({
      clientId,
      type,
      text,
      user: user || 'System',
      date: date || new Date()
    });

    res.status(201).json(newInteraction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

