#!/usr/bin/env node

const { analyzeRepository } = require("./analyzer")
const logger = require("./utils/logger")

async function main() {
  const repoUrl = process.argv[2]

  if (!repoUrl) {
    console.error("Usage: node analyze.js <repository-url>")
    process.exit(1)
  }

  try {
    logger.info(`Starting analysis for: ${repoUrl}`)
    const report = await analyzeRepository(repoUrl)

    console.log("\n=== GitGauge Analysis Report ===")
    console.log(`Repository: ${report.metadata.repoUrl}`)
    console.log(`Analyzed at: ${report.metadata.analyzedAt}`)
    console.log(`Analysis time: ${report.metadata.analysisTime}ms`)
    console.log("\n--- Summary ---")
    console.log(`Commits: ${report.commits.total}`)
    console.log(`Pull Requests: ${report.pullRequests.total}`)
    console.log(`Issues: ${report.issues.total}`)
    console.log(`Contributors: ${report.contributors.total}`)
    console.log(`Code Churn: +${report.codeChurn.totalAdditions} -${report.codeChurn.totalDeletions}`)

    logger.info("Analysis completed successfully")
  } catch (error) {
    logger.error("Analysis failed:", error)
    console.error("Error:", error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { main }
