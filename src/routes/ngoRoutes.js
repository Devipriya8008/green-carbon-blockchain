const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngoController');

// NGO Registration routes
router.post('/register', ngoController.registerNGO);
router.get('/pending', ngoController.getPendingRegistrations);
router.get('/:id', ngoController.getNGO);
router.post('/:id/approve', ngoController.approveNGO);
router.post('/:id/reject', ngoController.rejectNGO);

module.exports = router;