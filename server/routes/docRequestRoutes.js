const express = require('express');
const router = express.Router();
const DocumentRequest = require('../models/DocumentRequest');
const Tender = require('../models/Tender');
const User = require('../models/User');

// Create a new request
router.post('/', async (req, res) => {
  try {
    const { tenderId, documentName, userId } = req.body;
    
    // Check if a request already exists
    const existing = await DocumentRequest.findOne({
      where: { tenderId, documentName, userId }
    });

    if (existing) {
      if (existing.status === 'Rejected') {
        existing.status = 'Pending';
        await existing.save();
        return res.status(200).json(existing);
      }
      return res.status(400).json({ message: `Request already exists with status: ${existing.status}` });
    }

    const docReq = await DocumentRequest.create({
      tenderId,
      documentName,
      userId,
      status: 'Pending'
    });
    
    res.status(201).json(docReq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all pending requests (for Admin)
router.get('/', async (req, res) => {
  try {
    const requests = await DocumentRequest.findAll({
      where: { status: 'Pending' },
      include: [
        { model: User, attributes: ['id', 'name', 'email', 'role', 'image'] },
        { model: Tender, attributes: ['id', 'title', 'reference'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get requests by a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const requests = await DocumentRequest.findAll({
      where: { userId: req.params.userId }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update request status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const request = await DocumentRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    request.status = status;
    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
