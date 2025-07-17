const express = require('express');
const analyzeController = require('../controllers/analyzeController');

const router = express.Router();

// POST /api/analyze - Start repository analysis
router.post('/', analyzeController.analyzeRepository);

// GET /api/analyze/:id - Get analysis status
router.get('/:id', analyzeController.getAnalysisStatus);

module.exports = router;