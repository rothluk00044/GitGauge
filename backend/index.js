const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const compression = require("compression")
const rateLimit = require("express-rate-limit")
const { body, validationResult } = require("express-validator")
const path = require("path")
const fs = require("fs-extra")
require("dotenv").config()

const { analyzeRepository } = require("./analyzer")
const logger = require("./utils/logger")

const app = express()
const PORT = process.env.PORT || 3001

// Trust proxy for accurate IP addresses
app.set("trust proxy", 1)

// Compression middleware
app.use(compression())

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "https://api.github.com"],
      },
    },
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: {
    error: "Too many requests from this IP",
    message: "Please try again later",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Analysis rate limiting (more restrictive)
const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 analysis requests per hour
  message: {
    error: "Too many analysis requests",
    message: "Please try again later",
    code: "ANALYSIS_RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://rothluk00044.github.io", "https://gitgauge.vercel.app"]
        : ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
)

app.use(express.json({ limit: "10mb" }))
app.use(express.static("public"))

// Ensure reports directory exists
const reportsDir = path.join(__dirname, "reports")
fs.ensureDirSync(reportsDir)

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  })
  next()
})

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    uptime: Math.floor(process.uptime()),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
    environment: process.env.NODE_ENV || "development",
  })
})

// Repository analysis endpoint with validation
app.post(
  "/api/analyze",
  analysisLimiter,
  [
    body("repoUrl")
      .isURL()
      .withMessage("Must be a valid URL")
      .matches(/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/)
      .withMessage("Must be a valid GitHub repository URL"),
  ],
  async (req, res) => {
    const startTime = Date.now()

    // Check validation results
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Invalid input",
        message: errors.array()[0].msg,
        code: "VALIDATION_ERROR",
        details: errors.array(),
      })
    }

    try {
      const { repoUrl } = req.body

      logger.info(`Starting analysis for repository: ${repoUrl}`, {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      })

      const report = await analyzeRepository(repoUrl)

      // Add performance metrics
      report.performance = {
        analysisTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        version: "2.0.0",
      }

      // Save report with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const reportFilename = `${report.metadata.repoName}-${timestamp}.json`
      const reportPath = path.join(reportsDir, reportFilename)

      await fs.writeJson(reportPath, report, { spaces: 2 })

      logger.info(`Analysis completed for ${repoUrl}`, {
        analysisTime: Date.now() - startTime,
        reportFile: reportFilename,
        totalCommits: report.commits.total,
        totalPRs: report.pullRequests.total,
        totalIssues: report.issues.total,
        totalContributors: report.contributors.total,
      })

      res.json({
        ...report,
        reportId: reportFilename,
      })
    } catch (error) {
      const analysisTime = Date.now() - startTime

      logger.error("Analysis failed:", {
        error: error.message,
        stack: error.stack,
        analysisTime,
        repoUrl: req.body.repoUrl,
        ip: req.ip,
      })

      // Return appropriate error based on error type
      if (error.message.includes("rate limit")) {
        return res.status(429).json({
          error: "GitHub API rate limit exceeded",
          message: "Please try again later or check your GitHub token",
          code: "GITHUB_RATE_LIMIT_EXCEEDED",
          retryAfter: 3600,
        })
      }

      if (error.message.includes("Not Found") || error.message.includes("not found")) {
        return res.status(404).json({
          error: "Repository not found",
          message: "The repository may be private, deleted, or does not exist",
          code: "REPO_NOT_FOUND",
        })
      }

      if (error.message.includes("access denied") || error.message.includes("Forbidden")) {
        return res.status(403).json({
          error: "Access denied",
          message: "Unable to access this repository. It may be private or require authentication",
          code: "ACCESS_DENIED",
        })
      }

      res.status(500).json({
        error: "Analysis failed",
        message: "An unexpected error occurred during analysis",
        code: "ANALYSIS_FAILED",
        analysisTime,
      })
    }
  },
)

// Get list of reports with pagination
app.get("/api/reports", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit

    const files = await fs.readdir(reportsDir)
    const jsonFiles = files.filter((f) => f.endsWith(".json"))

    const reports = []

    for (const file of jsonFiles) {
      try {
        const report = await fs.readJson(path.join(reportsDir, file))
        reports.push({
          filename: file,
          metadata: report.metadata,
          timestamp: report.timestamp || report.metadata.analyzedAt,
          performance: report.performance,
          summary: {
            commits: report.commits.total || 0,
            pullRequests: report.pullRequests.total || 0,
            issues: report.issues.total || 0,
            contributors: report.contributors.total || 0,
          },
        })
      } catch (error) {
        logger.warn(`Failed to read report file: ${file}`, error)
      }
    }

    // Sort by timestamp (newest first)
    reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    // Apply pagination
    const paginatedReports = reports.slice(offset, offset + limit)

    res.json({
      reports: paginatedReports,
      pagination: {
        page,
        limit,
        total: reports.length,
        totalPages: Math.ceil(reports.length / limit),
        hasNext: offset + limit < reports.length,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    logger.error("Failed to fetch reports:", error)
    res.status(500).json({
      error: "Failed to fetch reports",
      message: "Unable to retrieve analysis reports",
      code: "FETCH_REPORTS_FAILED",
    })
  }
})

// Get specific report
app.get("/api/reports/:filename", async (req, res) => {
  try {
    const filename = req.params.filename

    // Validate filename to prevent directory traversal
    if (filename.includes("..") || filename.includes("/") || !filename.endsWith(".json")) {
      return res.status(400).json({
        error: "Invalid filename",
        message: "Filename contains invalid characters",
        code: "INVALID_FILENAME",
      })
    }

    const reportPath = path.join(reportsDir, filename)

    if (!(await fs.pathExists(reportPath))) {
      return res.status(404).json({
        error: "Report not found",
        message: "The requested analysis report does not exist",
        code: "REPORT_NOT_FOUND",
      })
    }

    const report = await fs.readJson(reportPath)

    // Add access timestamp
    report.accessedAt = new Date().toISOString()

    res.json(report)
  } catch (error) {
    logger.error("Failed to fetch report:", error)
    res.status(500).json({
      error: "Failed to fetch report",
      message: "Unable to retrieve the requested report",
      code: "FETCH_REPORT_FAILED",
    })
  }
})

// Delete specific report (optional endpoint for cleanup)
app.delete("/api/reports/:filename", async (req, res) => {
  try {
    const filename = req.params.filename

    // Validate filename
    if (filename.includes("..") || filename.includes("/") || !filename.endsWith(".json")) {
      return res.status(400).json({
        error: "Invalid filename",
        code: "INVALID_FILENAME",
      })
    }

    const reportPath = path.join(reportsDir, filename)

    if (!(await fs.pathExists(reportPath))) {
      return res.status(404).json({
        error: "Report not found",
        code: "REPORT_NOT_FOUND",
      })
    }

    await fs.remove(reportPath)

    logger.info(`Report deleted: ${filename}`, {
      ip: req.ip,
      timestamp: new Date().toISOString(),
    })

    res.json({
      message: "Report deleted successfully",
      filename,
    })
  } catch (error) {
    logger.error("Failed to delete report:", error)
    res.status(500).json({
      error: "Failed to delete report",
      code: "DELETE_REPORT_FAILED",
    })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error("Unhandled error:", {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  })

  res.status(500).json({
    error: "Internal server error",
    message: "An unexpected error occurred",
    code: "INTERNAL_ERROR",
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    message: `The requested endpoint ${req.method} ${req.path} does not exist`,
    code: "NOT_FOUND",
  })
})

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully`)

  const server = app.listen(PORT, () => {
    logger.info(`GitGauge backend server running on port ${PORT}`, {
      environment: process.env.NODE_ENV || "development",
      port: PORT,
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    })
  })

  process.on(signal, () => {
    logger.info(`${signal} received, closing server`)
    server.close(() => {
      logger.info("Server closed")
      process.exit(0)
    })
  })
}

// Handle process signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error)
  process.exit(1)
})

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason)
  process.exit(1)
})

// Start server
const server = app.listen(PORT, () => {
  logger.info(`GitGauge backend server running on port ${PORT}`, {
    environment: process.env.NODE_ENV || "development",
    port: PORT,
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  })
})

module.exports = app