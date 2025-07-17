const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
const { logger } = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const config = require('./config');

// Import routes
const analyzeRoutes = require('./routes/analyzeRoutes');
const repoRoutes = require('./routes/repoRoutes');
const healthRoutes = require('./routes/healthRoutes');

// Initialize express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression for better performance
app.use(compression());

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', apiLimiter);

// Analysis-specific rate limiting
const analysisLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.analysisRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many analysis requests from this IP, please try again later.'
});

app.use('/api/analyze', analysisLimiter);

// Routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api/repo', repoRoutes);
app.use('/api/health', healthRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = config.port || 3001;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
});

module.exports = app; // For testing