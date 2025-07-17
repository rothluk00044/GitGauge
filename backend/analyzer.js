const { Octokit } = require("@octokit/rest")
const simpleGit = require("simple-git")
const fs = require("fs-extra")
const path = require("path")
const moment = require("moment")
const logger = require("./utils/logger")

// Initialize Octokit with authentication
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: "GitGauge/1.0.0",
  timeZone: "UTC",
  baseUrl: "https://api.github.com",
})

async function analyzeRepository(repoUrl) {
  const startTime = Date.now()
  logger.info(`Starting repository analysis for: ${repoUrl}`)

  try {
    // Parse repository URL
    const { owner, repo } = parseRepoUrl(repoUrl)
    logger.info(`Parsed repository: ${owner}/${repo}`)

    // Create temporary directory for cloning
    const tempDir = path.join(__dirname, "temp", `${repo}-${Date.now()}`)
    await fs.ensureDir(tempDir)

    try {
      // Fetch repository metadata first
      logger.info("Fetching repository metadata...")
      const repoData = await fetchRepositoryData(owner, repo)

      // Clone repository for git analysis (shallow clone for performance)
      logger.info("Cloning repository for analysis...")
      const git = simpleGit()

      try {
        await git.clone(repoUrl, tempDir, [
          "--depth",
          "500", // Increased depth for better analysis
          "--single-branch",
          "--branch",
          repoData.defaultBranch || "main",
        ])
      } catch (cloneError) {
        // Try with main branch if default branch fails
        logger.warn("Clone with default branch failed, trying main branch")
        await git.clone(repoUrl, tempDir, ["--depth", "500"])
      }

      const repoGit = simpleGit(tempDir)

      // Perform various analyses in parallel for better performance
      logger.info("Running parallel analysis...")
      const [
        commitAnalysis,
        pullRequestAnalysis,
        issueAnalysis,
        contributorAnalysis,
        codeChurnAnalysis,
        branchAnalysis,
      ] = await Promise.allSettled([
        analyzeCommits(repoGit, owner, repo),
        analyzePullRequests(owner, repo),
        analyzeIssues(owner, repo),
        analyzeContributors(owner, repo),
        analyzeCodeChurn(repoGit),
        analyzeBranches(owner, repo),
      ])

      // Process results and handle any failures
      const report = {
        metadata: {
          repoUrl,
          owner,
          repoName: repo,
          analyzedAt: new Date().toISOString(),
          analysisTime: Date.now() - startTime,
          version: "1.0.0",
        },
        repository: repoData,
        commits:
          commitAnalysis.status === "fulfilled"
            ? commitAnalysis.value
            : { error: commitAnalysis.reason?.message, total: 0 },
        pullRequests:
          pullRequestAnalysis.status === "fulfilled"
            ? pullRequestAnalysis.value
            : { error: pullRequestAnalysis.reason?.message, total: 0 },
        issues:
          issueAnalysis.status === "fulfilled"
            ? issueAnalysis.value
            : { error: issueAnalysis.reason?.message, total: 0 },
        contributors:
          contributorAnalysis.status === "fulfilled"
            ? contributorAnalysis.value
            : { error: contributorAnalysis.reason?.message, total: 0 },
        codeChurn:
          codeChurnAnalysis.status === "fulfilled"
            ? codeChurnAnalysis.value
            : { error: codeChurnAnalysis.reason?.message, totalAdditions: 0, totalDeletions: 0 },
        branches:
          branchAnalysis.status === "fulfilled"
            ? branchAnalysis.value
            : { error: branchAnalysis.reason?.message, total: 0 },
        timestamp: new Date().toISOString(),
      }

      logger.info(`Analysis completed successfully in ${Date.now() - startTime}ms`)
      return report
    } finally {
      // Cleanup temporary directory
      try {
        await fs.remove(tempDir)
        logger.info("Temporary directory cleaned up")
      } catch (cleanupError) {
        logger.warn("Failed to cleanup temporary directory:", cleanupError)
      }
    }
  } catch (error) {
    logger.error("Repository analysis failed:", error)
    throw new Error(`Analysis failed: ${error.message}`)
  }
}

function parseRepoUrl(url) {
  const patterns = [/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/)?$/, /github\.com\/([^/]+)\/([^/]+)/]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(".git", ""),
      }
    }
  }

  throw new Error("Invalid GitHub repository URL format")
}

async function fetchRepositoryData(owner, repo) {
  try {
    const { data } = await octokit.rest.repos.get({ owner, repo })
    return {
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      language: data.language,
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      size: data.size,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      defaultBranch: data.default_branch,
      isPrivate: data.private,
      hasWiki: data.has_wiki,
      hasPages: data.has_pages,
      license: data.license?.name || null,
      topics: data.topics || [],
    }
  } catch (error) {
    if (error.status === 404) {
      throw new Error("Repository not found or access denied")
    }
    throw error
  }
}

async function analyzeCommits(git, owner, repo) {
  try {
    logger.info("Analyzing commits...")

    // Get commit log with comprehensive data
    const log = await git.log(["--all", "--since=1 year ago", "--pretty=fuller"])
    const commits = log.all

    if (commits.length === 0) {
      return {
        total: 0,
        byMonth: {},
        byDay: {},
        byAuthor: {},
        averagePerDay: 0,
        recentActivity: [],
      }
    }

    // Group commits by various time periods
    const commitsByMonth = {}
    const commitsByWeek = {}
    const commitsByDay = {}
    const commitsByAuthor = {}
    const commitsByHour = {}

    commits.forEach((commit) => {
      const date = moment(commit.date)
      const month = date.format("YYYY-MM")
      const week = date.format("YYYY-[W]WW")
      const day = date.format("YYYY-MM-DD")
      const hour = date.format("HH")
      const author = commit.author_name

      commitsByMonth[month] = (commitsByMonth[month] || 0) + 1
      commitsByWeek[week] = (commitsByWeek[week] || 0) + 1
      commitsByDay[day] = (commitsByDay[day] || 0) + 1
      commitsByHour[hour] = (commitsByHour[hour] || 0) + 1
      commitsByAuthor[author] = (commitsByAuthor[author] || 0) + 1
    })

    // Calculate activity patterns
    const daysSinceFirstCommit = moment().diff(moment(commits[commits.length - 1].date), "days") || 1
    const averagePerDay = commits.length / Math.max(daysSinceFirstCommit, 1)

    return {
      total: commits.length,
      byMonth: commitsByMonth,
      byWeek: commitsByWeek,
      byDay: commitsByDay,
      byHour: commitsByHour,
      byAuthor: commitsByAuthor,
      averagePerDay: Number(averagePerDay.toFixed(2)),
      daysSinceFirstCommit,
      recentActivity: commits.slice(0, 10).map((c) => ({
        hash: c.hash.substring(0, 7),
        message: c.message.split("\n")[0].substring(0, 100),
        author: c.author_name,
        date: c.date,
        insertions: c.diff?.insertions || 0,
        deletions: c.diff?.deletions || 0,
      })),
    }
  } catch (error) {
    logger.error("Commit analysis failed:", error)
    return {
      total: 0,
      byMonth: {},
      byDay: {},
      byAuthor: {},
      averagePerDay: 0,
      recentActivity: [],
      error: error.message,
    }
  }
}

async function analyzePullRequests(owner, repo) {
  try {
    logger.info("Analyzing pull requests...")

    // Fetch multiple pages of PRs for comprehensive analysis
    const allPulls = []
    let page = 1
    const perPage = 100

    while (page <= 5) {
      // Limit to 500 PRs for performance
      const { data: pulls } = await octokit.rest.pulls.list({
        owner,
        repo,
        state: "all",
        per_page: perPage,
        page: page,
        sort: "updated",
        direction: "desc",
      })

      if (pulls.length === 0) break
      allPulls.push(...pulls)
      page++
    }

    if (allPulls.length === 0) {
      return {
        total: 0,
        open: 0,
        closed: 0,
        merged: 0,
        mergeRate: 0,
        averageReviewTime: 0,
        recent: [],
      }
    }

    const open = allPulls.filter((pr) => pr.state === "open")
    const closed = allPulls.filter((pr) => pr.state === "closed")
    const merged = allPulls.filter((pr) => pr.merged_at)

    // Calculate review times for merged PRs
    const reviewTimes = merged
      .filter((pr) => pr.created_at && pr.merged_at)
      .map((pr) => {
        const created = moment(pr.created_at)
        const merged = moment(pr.merged_at)
        return merged.diff(created, "hours")
      })
      .filter((time) => time > 0 && time < 8760) // Filter out invalid times (> 1 year)

    const avgReviewTime = reviewTimes.length > 0 ? reviewTimes.reduce((a, b) => a + b, 0) / reviewTimes.length : 0

    // Analyze PR patterns
    const prsByMonth = {}
    allPulls.forEach((pr) => {
      const month = moment(pr.created_at).format("YYYY-MM")
      prsByMonth[month] = (prsByMonth[month] || 0) + 1
    })

    return {
      total: allPulls.length,
      open: open.length,
      closed: closed.length,
      merged: merged.length,
      mergeRate: allPulls.length > 0 ? Number(((merged.length / allPulls.length) * 100).toFixed(1)) : 0,
      averageReviewTime: Math.round(avgReviewTime),
      byMonth: prsByMonth,
      recent: allPulls.slice(0, 10).map((pr) => ({
        number: pr.number,
        title: pr.title.substring(0, 100),
        state: pr.state,
        author: pr.user.login,
        createdAt: pr.created_at,
        mergedAt: pr.merged_at,
        additions: pr.additions || 0,
        deletions: pr.deletions || 0,
      })),
    }
  } catch (error) {
    logger.error("Pull request analysis failed:", error)
    return {
      total: 0,
      open: 0,
      closed: 0,
      merged: 0,
      mergeRate: 0,
      averageReviewTime: 0,
      recent: [],
      error: error.message,
    }
  }
}

async function analyzeIssues(owner, repo) {
  try {
    logger.info("Analyzing issues...")

    // Fetch issues with pagination
    const allIssues = []
    let page = 1

    while (page <= 5) {
      // Limit to 500 issues
      const { data: issues } = await octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: "all",
        per_page: 100,
        page: page,
        sort: "updated",
        direction: "desc",
      })

      if (issues.length === 0) break
      allIssues.push(...issues)
      page++
    }

    // Filter out pull requests (GitHub API includes PRs in issues)
    const actualIssues = allIssues.filter((issue) => !issue.pull_request)

    if (actualIssues.length === 0) {
      return {
        total: 0,
        open: 0,
        closed: 0,
        closeRate: 0,
        labels: {},
        recent: [],
      }
    }

    const open = actualIssues.filter((issue) => issue.state === "open")
    const closed = actualIssues.filter((issue) => issue.state === "closed")

    // Analyze labels
    const labelCounts = {}
    actualIssues.forEach((issue) => {
      issue.labels.forEach((label) => {
        labelCounts[label.name] = (labelCounts[label.name] || 0) + 1
      })
    })

    // Calculate resolution times for closed issues
    const resolutionTimes = closed
      .filter((issue) => issue.created_at && issue.closed_at)
      .map((issue) => {
        const created = moment(issue.created_at)
        const closedAt = moment(issue.closed_at)
        return closedAt.diff(created, "days")
      })
      .filter((time) => time >= 0)

    const avgResolutionTime =
      resolutionTimes.length > 0 ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length : 0

    return {
      total: actualIssues.length,
      open: open.length,
      closed: closed.length,
      closeRate: actualIssues.length > 0 ? Number(((closed.length / actualIssues.length) * 100).toFixed(1)) : 0,
      averageResolutionTime: Math.round(avgResolutionTime),
      labels: Object.fromEntries(
        Object.entries(labelCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10),
      ),
      recent: actualIssues.slice(0, 10).map((issue) => ({
        number: issue.number,
        title: issue.title.substring(0, 100),
        state: issue.state,
        author: issue.user.login,
        createdAt: issue.created_at,
        closedAt: issue.closed_at,
        labels: issue.labels.map((l) => l.name).slice(0, 3),
      })),
    }
  } catch (error) {
    logger.error("Issue analysis failed:", error)
    return {
      total: 0,
      open: 0,
      closed: 0,
      closeRate: 0,
      labels: {},
      recent: [],
      error: error.message,
    }
  }
}

async function analyzeContributors(owner, repo) {
  try {
    logger.info("Analyzing contributors...")

    const { data: contributors } = await octokit.rest.repos.listContributors({
      owner,
      repo,
      per_page: 100,
    })

    if (contributors.length === 0) {
      return {
        total: 0,
        top: [],
        busFactor: 0,
        distribution: {},
      }
    }

    // Calculate contribution distribution
    const totalContributions = contributors.reduce((sum, c) => sum + c.contributions, 0)
    const distribution = {
      top10Percent: 0,
      top25Percent: 0,
      others: 0,
    }

    const top10Count = Math.max(1, Math.ceil(contributors.length * 0.1))
    const top25Count = Math.max(1, Math.ceil(contributors.length * 0.25))

    contributors.slice(0, top10Count).forEach((c) => {
      distribution.top10Percent += c.contributions
    })

    contributors.slice(0, top25Count).forEach((c) => {
      distribution.top25Percent += c.contributions
    })

    distribution.others = totalContributions - distribution.top25Percent

    // Calculate bus factor (simplified)
    let cumulativeContributions = 0
    let busFactor = 0
    const threshold = totalContributions * 0.5

    for (const contributor of contributors) {
      cumulativeContributions += contributor.contributions
      busFactor++
      if (cumulativeContributions >= threshold) break
    }

    return {
      total: contributors.length,
      totalContributions,
      top: contributors.slice(0, 15).map((contributor) => ({
        login: contributor.login,
        contributions: contributor.contributions,
        avatarUrl: contributor.avatar_url,
        percentage: Number(((contributor.contributions / totalContributions) * 100).toFixed(1)),
      })),
      busFactor: Math.min(busFactor, contributors.length),
      distribution,
    }
  } catch (error) {
    logger.error("Contributor analysis failed:", error)
    return {
      total: 0,
      top: [],
      busFactor: 0,
      distribution: {},
      error: error.message,
    }
  }
}

async function analyzeCodeChurn(git) {
  try {
    logger.info("Analyzing code churn...")

    // Get detailed commit statistics with numstat
    const log = await git.raw([
      "log",
      "--numstat",
      "--since=6 months ago",
      "--pretty=format:%H|%an|%ad|%s",
      "--date=iso",
    ])

    if (!log || log.trim() === "") {
      return {
        totalAdditions: 0,
        totalDeletions: 0,
        netChange: 0,
        topChurnedFiles: [],
        churnRate: 0,
        commitCount: 0,
      }
    }

    const commits = log.split("\n\n").filter((block) => block.trim())

    let totalAdditions = 0
    let totalDeletions = 0
    const churnByFile = {}
    const churnByMonth = {}

    commits.forEach((commitBlock) => {
      const lines = commitBlock.split("\n")
      const commitInfo = lines[0]
      const fileStats = lines.slice(1).filter((line) => line.includes("\t"))

      if (commitInfo) {
        const [hash, author, date, message] = commitInfo.split("|")
        const month = moment(date).format("YYYY-MM")

        if (!churnByMonth[month]) {
          churnByMonth[month] = { additions: 0, deletions: 0 }
        }

        fileStats.forEach((fileStat) => {
          const parts = fileStat.split("\t")
          if (parts.length >= 3) {
            const additions = parts[0] === "-" ? 0 : Number.parseInt(parts[0]) || 0
            const deletions = parts[1] === "-" ? 0 : Number.parseInt(parts[1]) || 0
            const fileName = parts[2]

            totalAdditions += additions
            totalDeletions += deletions

            churnByMonth[month].additions += additions
            churnByMonth[month].deletions += deletions

            if (!churnByFile[fileName]) {
              churnByFile[fileName] = { additions: 0, deletions: 0, commits: 0 }
            }
            churnByFile[fileName].additions += additions
            churnByFile[fileName].deletions += deletions
            churnByFile[fileName].commits += 1
          }
        })
      }
    })

    // Get top churned files
    const topChurnedFiles = Object.entries(churnByFile)
      .map(([file, churn]) => ({
        file: file.length > 50 ? "..." + file.slice(-47) : file,
        fullPath: file,
        additions: churn.additions,
        deletions: churn.deletions,
        total: churn.additions + churn.deletions,
        commits: churn.commits,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 15)

    return {
      totalAdditions,
      totalDeletions,
      netChange: totalAdditions - totalDeletions,
      topChurnedFiles,
      churnRate: commits.length > 0 ? Number(((totalAdditions + totalDeletions) / commits.length).toFixed(1)) : 0,
      commitCount: commits.length,
      byMonth: churnByMonth,
    }
  } catch (error) {
    logger.error("Code churn analysis failed:", error)
    return {
      totalAdditions: 0,
      totalDeletions: 0,
      netChange: 0,
      topChurnedFiles: [],
      churnRate: 0,
      commitCount: 0,
      error: error.message,
    }
  }
}

async function analyzeBranches(owner, repo) {
  try {
    logger.info("Analyzing branches...")

    const { data: branches } = await octokit.rest.repos.listBranches({
      owner,
      repo,
      per_page: 50,
    })

    const branchInfo = await Promise.all(
      branches.slice(0, 10).map(async (branch) => {
        try {
          const { data: commits } = await octokit.rest.repos.listCommits({
            owner,
            repo,
            sha: branch.name,
            per_page: 1,
          })

          return {
            name: branch.name,
            protected: branch.protected,
            lastCommit: commits[0]
              ? {
                  sha: commits[0].sha.substring(0, 7),
                  message: commits[0].commit.message.split("\n")[0].substring(0, 50),
                  author: commits[0].commit.author.name,
                  date: commits[0].commit.author.date,
                }
              : null,
          }
        } catch (error) {
          return {
            name: branch.name,
            protected: branch.protected,
            lastCommit: null,
            error: error.message,
          }
        }
      }),
    )

    return {
      total: branches.length,
      branches: branchInfo,
      protected: branches.filter((b) => b.protected).length,
    }
  } catch (error) {
    logger.error("Branch analysis failed:", error)
    return {
      total: 0,
      branches: [],
      protected: 0,
      error: error.message,
    }
  }
}

module.exports = {
  analyzeRepository,
}
