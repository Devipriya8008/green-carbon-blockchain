const express = require('express');
const router = express.Router();
const mrvController = require('../controllers/mrvController');

// MRV routes
router.post('/submit', mrvController.submitMRV);
router.get('/all', mrvController.getAllMRV);
router.get('/:id', mrvController.getMRV);
router.get('/ngo/:ngoId', mrvController.getMRVByNGO);

module.exports = router;