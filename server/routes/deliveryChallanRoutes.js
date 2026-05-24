const express = require('express');
const router = express.Router();
const deliveryChallanController = require('../controllers/deliveryChallanController');

// Get all delivery challans
router.get('/', deliveryChallanController.getChallans);

// Get specific delivery challan
router.get('/:id', deliveryChallanController.getChallan);

// Create new delivery challan
router.post('/', deliveryChallanController.createChallan);

// Update delivery challan
router.put('/:id', deliveryChallanController.updateChallan);

// Delete delivery challan
router.delete('/:id', deliveryChallanController.deleteChallan);

module.exports = router;
