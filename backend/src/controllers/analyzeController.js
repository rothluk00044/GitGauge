const analysisService = require('../services/analysisService');
const { logger } = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

/**
 * Analyze a GitHub repository
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.analyzeRepository = async (req, res, next) => {
  try {
    const { repoUrl } = req.body;
    
    if (!repoUrl) {
      return next(new AppError('Repository URL is required', 400));
    }
    
    logger.info(`Received analysis request for: ${repoUrl}`);
    
    // Start analysis
    const analysis = await analysisService.analyzeRepository(repoUrl);
    
    // Return analysis results
    res.status(200).json({
      status: 'success',
      data: analysis
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get analysis status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAnalysisStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // This would be implemented with a database to track analysis jobs
    // For now, return a mock response
    res.status(200).json({
      status: 'success',
      data: {
        id,
        status: 'completed',
        progress: 100
      }
    });
  } catch (error) {
    next(error);
  }
};