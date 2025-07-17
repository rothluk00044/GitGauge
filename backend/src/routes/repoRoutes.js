const express = require('express');
const repoController = require('../controllers/repoController');

const router = express.Router();

// GET /api/repo/info - Get repository information
router.get('/info', repoController.getRepoInfo);

module.exports = router;