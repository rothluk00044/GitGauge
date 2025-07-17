const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const path = require("path")
const fs = require("fs-extra")
require("dotenv").config()

const { analyzeRepository } = require("./analyzer")
const logger = require("./utils/logger")

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)

// Analysis rate limiting (more restrictive)
const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 analysis requests per hour
  message: "Too many analysis requests, please try again later.",
})

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://rothluk00044.github.io"]
        : ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
)

app.use(express.json({ limit: "10mb" }))
app.use(express.static("public"))

// Ensure reports directory exists
const reportsDir = path.join(__dirname, "reports")
fs.ensureDirSync(reportsDir)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    uptime: process.uptime(),
  })
})

// Repository analysis endpoint
app.post("/api/analyze", analysisLimiter, async (req, res) => {
  const startTime = Date.now()

  try {
    const { repoUrl } = req.body

    if (!repoUrl) {
      return res.status(400).json({
        error: "Repository URL is required",
        code: "MISSING_REPO_URL",
      })
    }

    // Validate GitHub URL format
    const githubUrlPattern = /^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/
    if (!githubUrlPattern.test(repoUrl)) {
      return res.status(400).json({
        error: "Invalid GitHub repository URL format",
        code: "INVALID_URL_FORMAT",
      })
    }

    logger.info(`Starting analysis for repository: ${repoUrl}`, {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    })

    const report = await analyzeRepository(repoUrl)

    // Add performance metrics
    report.performance = {
      analysisTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    }

    // Save report with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const reportFilename = `${report.metadata.repoName}-${timestamp}.json`
    const reportPath = path.join(reportsDir, reportFilename)

    await fs.writeJson(reportPath, report, { spaces: 2 })

    logger.info(`Analysis completed for ${repoUrl}`, {
      analysisTime: Date.now() - startTime,
      reportFile: reportFilename,
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
    })

    // Return appropriate error based on error type
    if (error.message.includes("rate limit")) {
      return res.status(429).json({
        error: "GitHub API rate limit exceeded",
        message: "Please try again later",
        code: "RATE_LIMIT_EXCEEDED",
      })
    }

    if (error.message.includes("Not Found")) {
      return res.status(404).json({
        error: "Repository not found",
        message: "The repository may be private or does not exist",
        code: "REPO_NOT_FOUND",
      })
    }

    res.status(500).json({
      error: "Analysis failed",
      message: error.message,
      code: "ANALYSIS_FAILED",
      analysisTime,
    })
  }
})

// Get list of reports
app.get("/api/reports", async (req, res) => {
  try {
    const files = await fs.readdir(reportsDir)
    const reports = []

    for (const file of files.filter((f) => f.endsWith(".json"))) {
      try {
        const report = await fs.readJson(path.join(reportsDir, file))
        reports.push({
          filename: file,
          metadata: report.metadata,
          timestamp: report.timestamp || report.metadata.analyzedAt,
          performance: report.performance,
        })
      } catch (error) {
        logger.warn(`Failed to read report file: ${file}`, error)
      }
    }

    res.json(reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
  } catch (error) {
    logger.error("Failed to fetch reports:", error)
    res.status(500).json({
      error: "Failed to fetch reports",
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

    const report = await fs.readJson(reportPath)
    res.json(report)
  } catch (error) {
    logger.error("Failed to fetch report:", error)
    res.status(500).json({
      error: "Failed to fetch report",
      code: "FETCH_REPORT_FAILED",
    })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error("Unhandled error:", error)
  res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_ERROR",
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    code: "NOT_FOUND",
  })
})

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully")
  process.exit(0)
})

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully")
  process.exit(0)
})

app.listen(PORT, () => {
  logger.info(`GitGauge backend server running on port ${PORT}`, {
    environment: process.env.NODE_ENV,
    port: PORT,
  })
})

module.exports = app