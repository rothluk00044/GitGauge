const config = require('../config');

/**
 * Health check endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.healthCheck = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'GitGauge API is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
};