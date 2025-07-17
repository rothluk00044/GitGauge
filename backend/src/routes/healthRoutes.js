const express = require('express');
const healthController = require('../controllers/healthController');

const router = express.Router();

// GET /api/health - Health check endpoint
router.get('/', healthController.healthCheck);

module.exports = router;