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
