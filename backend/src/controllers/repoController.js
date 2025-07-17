const githubService = require('../services/githubService');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get repository information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getRepoInfo = async (req, res, next) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return next(new AppError('Repository URL is required', 400));
    }
    
    const { owner, repo } = githubService.parseRepoUrl(url);
    const repoInfo = await githubService.getRepoInfo(owner, repo);
    
    res.status(200).json({
      status: 'success',
      data: repoInfo
    });
  } catch (error) {
    next(error);
  }
};