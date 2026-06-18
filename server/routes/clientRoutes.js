const express = require('express');
const router = express.Router();
const { 
  createClient, 
  getClients, 
  updateClient, 
  deleteClient,
  getClientInteractions,
  createClientInteraction
} = require('../controllers/clientController');

router.post('/', createClient);
router.get('/', getClients);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

// Interaction History
router.get('/:clientId/interactions', getClientInteractions);
router.post('/:clientId/interactions', createClientInteraction);


module.exports = router;
