require('dotenv').config();

module.exports = {
  // Server configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // GitHub API configuration
  githubToken: process.env.GITHUB_TOKEN,
  
  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 200,
  analysisRateLimitMax: parseInt(process.env.ANALYSIS_RATE_LIMIT_MAX) || 20,
  
  // Temporary directory for cloning repositories
  tempDir: process.env.TEMP_DIR || './.tmp'
};