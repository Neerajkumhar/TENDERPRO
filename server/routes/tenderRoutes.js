const express = require('express');
const router = express.Router();
const tenderController = require('../controllers/tenderController');

router.get('/', tenderController.getTenders);
router.get('/reports', tenderController.getReports);
router.get('/:id', tenderController.getTenderById);
router.post('/', tenderController.createTender);
router.put('/:id', tenderController.updateTender);
router.delete('/:id', tenderController.deleteTender);

module.exports = router;
