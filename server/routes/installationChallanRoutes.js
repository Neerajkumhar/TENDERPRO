const express = require('express');
const router = express.Router();
const installationChallanController = require('../controllers/installationChallanController');

// Get all installation challans
router.get('/', installationChallanController.getChallans);

// Get specific installation challan
router.get('/:id', installationChallanController.getChallan);

// Create new installation challan
router.post('/', installationChallanController.createChallan);

// Update installation challan
router.put('/:id', installationChallanController.updateChallan);

// Delete installation challan
router.delete('/:id', installationChallanController.deleteChallan);

module.exports = router;
