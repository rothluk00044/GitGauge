const githubService = require('./githubService');
const { logger } = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

class AnalysisService {
  /**
   * Analyze a GitHub repository
   * @param {string} repoUrl - GitHub repository URL
   * @returns {Promise<Object>} - Complete repository analysis
   */
  async analyzeRepository(repoUrl) {
    let repoPath = null;
    try {
      // Parse repository URL
      const { owner, repo } = githubService.parseRepoUrl(repoUrl);
      
      logger.info(`Starting analysis for ${owner}/${repo}`);
      
      // Get basic repository information
      const repoInfo = await githubService.getRepoInfo(owner, repo);
      
      // Get commits, PRs, issues, and contributors in parallel
      const [
        commits,
        pullRequests,
        issues,
        contributors
      ] = await Promise.all([
        githubService.getCommits(owner, repo),
        githubService.getPullRequests(owner, repo),
        githubService.getIssues(owner, repo),
        githubService.getContributors(owner, repo)
      ]);
      
      // Clone repository for detailed analysis
      repoPath = await githubService.cloneRepository(owner, repo);
      
      // Analyze code churn
      const codeChurn = await githubService.analyzeCodeChurn(repoPath);
      
      // Process and analyze the data
      const analysis = {
        repository: this.processRepositoryInfo(repoInfo),
        commitAnalytics: this.analyzeCommits(commits),
        pullRequestIntelligence: this.analyzePullRequests(pullRequests),
        issueManagement: this.analyzeIssues(issues),
        teamDynamics: this.analyzeTeamDynamics(contributors, commits),
        codeChurnAnalysis: codeChurn
      };
      
      logger.info(`Completed analysis for ${owner}/${repo}`);
      
      return analysis;
    } catch (error) {
      logger.error(`Analysis failed: ${error.message}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Repository analysis failed', 500);
    } finally {
      // Clean up cloned repository
      if (repoPath) {
        await githubService.cleanupRepository(repoPath);
      }
    }
  }

  /**
   * Process repository information
   * @param {Object} repoInfo - Repository data from GitHub API
   * @returns {Object} - Processed repository information
   */
  processRepositoryInfo(repoInfo) {
    return {
      name: repoInfo.name,
      fullName: repoInfo.full_name,
      description: repoInfo.description,
      url: repoInfo.html_url,
      stars: repoInfo.stargazers_count,
      forks: repoInfo.forks_count,
      watchers: repoInfo.watchers_count,
      openIssues: repoInfo.open_issues_count,
      defaultBranch: repoInfo.default_branch,
      language: repoInfo.language,
      createdAt: repoInfo.created_at,
      updatedAt: repoInfo.updated_at,
      pushedAt: repoInfo.pushed_at,
      size: repoInfo.size,
      license: repoInfo.license ? repoInfo.license.name : null,
      isPrivate: repoInfo.private
    };
  }

  /**
   * Analyze commit data
   * @param {Array} commits - Commit data from GitHub API
   * @returns {Object} - Commit analytics
   */
  analyzeCommits(commits) {
    // Count total commits
    const totalCommits = commits.length;
    
    // Extract commit dates and authors
    const commitDates = commits.map(commit => new Date(commit.commit.author.date));
    const commitAuthors = {};
    
    commits.forEach(commit => {
      const author = commit.author ? commit.author.login : commit.commit.author.name;
      commitAuthors[author] = (commitAuthors[author] || 0) + 1;
    });
    
    // Sort dates for time-based analysis
    commitDates.sort((a, b) => a - b);
    
    // Calculate date range
    const firstCommitDate = commitDates[0];
    const lastCommitDate = commitDates[commitDates.length - 1];
    const daysDiff = Math.max(1, Math.ceil((lastCommitDate - firstCommitDate) / (1000 * 60 * 60 * 24)));
    
    // Calculate average commits per day
    const averageCommitsPerDay = totalCommits / daysDiff;
    
    // Group commits by month for trend analysis
    const commitsByMonth = {};
    commitDates.forEach(date => {
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      commitsByMonth[monthKey] = (commitsByMonth[monthKey] || 0) + 1;
    });
    
    // Convert to array and sort by month
    const monthlyTrends = Object.entries(commitsByMonth)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    // Get top contributors by commit count
    const authorContributions = Object.entries(commitAuthors)
      .map(([author, count]) => ({ author, count }))
      .sort((a, b) => b.count - a.count);
    
    return {
      totalCommits,
      averageCommitsPerDay,
      firstCommitDate,
      lastCommitDate,
      activeDays: daysDiff,
      monthlyTrends,
      authorContributions
    };
  }

  /**
   * Analyze pull request data
   * @param {Array} pullRequests - PR data from GitHub API
   * @returns {Object} - Pull request analytics
   */
  analyzePullRequests(pullRequests) {
    // Count total PRs
    const totalPRs = pullRequests.length;
    
    // Count PRs by state
    const openPRs = pullRequests.filter(pr => pr.state === 'open').length;
    const closedPRs = totalPRs - openPRs;
    
    // Calculate merge rate
    const mergedPRs = pullRequests.filter(pr => pr.merged_at).length;
    const mergeRate = totalPRs > 0 ? mergedPRs / totalPRs : 0;
    
    // Calculate review times for merged PRs
    const reviewTimes = [];
    pullRequests.forEach(pr => {
      if (pr.merged_at) {
        const createdAt = new Date(pr.created_at);
        const mergedAt = new Date(pr.merged_at);
        const reviewTimeHours = (mergedAt - createdAt) / (1000 * 60 * 60);
        reviewTimes.push(reviewTimeHours);
      }
    });
    
    // Calculate average review time
    const averageReviewTimeHours = reviewTimes.length > 0
      ? reviewTimes.reduce((sum, time) => sum + time, 0) / reviewTimes.length
      : 0;
    
    // Status distribution
    const statusDistribution = {
      open: openPRs,
      closed: closedPRs - mergedPRs,
      merged: mergedPRs
    };
    
    return {
      totalPRs,
      openPRs,
      closedPRs,
      mergedPRs,
      mergeRate,
      averageReviewTimeHours,
      statusDistribution
    };
  }

  /**
   * Analyze issue data
   * @param {Array} issues - Issue data from GitHub API
   * @returns {Object} - Issue analytics
   */
  analyzeIssues(issues) {
    // Count total issues
    const totalIssues = issues.length;
    
    // Count issues by state
    const openIssues = issues.filter(issue => issue.state === 'open').length;
    const closedIssues = totalIssues - openIssues;
    
    // Calculate resolution rate
    const resolutionRate = totalIssues > 0 ? closedIssues / totalIssues : 0;
    
    // Calculate resolution times for closed issues
    const resolutionTimes = [];
    issues.forEach(issue => {
      if (issue.state === 'closed' && issue.closed_at) {
        const createdAt = new Date(issue.created_at);
        const closedAt = new Date(issue.closed_at);
        const resolutionTimeHours = (closedAt - createdAt) / (1000 * 60 * 60);
        resolutionTimes.push(resolutionTimeHours);
      }
    });
    
    // Calculate average resolution time
    const averageResolutionTimeHours = resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
      : 0;
    
    // Analyze issue labels
    const labelDistribution = {};
    issues.forEach(issue => {
      if (issue.labels && issue.labels.length > 0) {
        issue.labels.forEach(label => {
          const labelName = label.name;
          labelDistribution[labelName] = (labelDistribution[labelName] || 0) + 1;
        });
      }
    });
    
    // Convert to array and sort by count
    const labels = Object.entries(labelDistribution)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    return {
      totalIssues,
      openIssues,
      closedIssues,
      resolutionRate,
      averageResolutionTimeHours,
      labels
    };
  }

  /**
   * Analyze team dynamics
   * @param {Array} contributors - Contributor data from GitHub API
   * @param {Array} commits - Commit data from GitHub API
   * @returns {Object} - Team dynamics analytics
   */
  analyzeTeamDynamics(contributors, commits) {
    // Sort contributors by contributions
    const sortedContributors = [...contributors].sort((a, b) => b.contributions - a.contributions);
    
    // Calculate bus factor (number of contributors responsible for 80% of contributions)
    const totalContributions = contributors.reduce((sum, contributor) => sum + contributor.contributions, 0);
    const threshold = totalContributions * 0.8;
    
    let cumulativeContributions = 0;
    let busFactor = 0;
    
    for (const contributor of sortedContributors) {
      cumulativeContributions += contributor.contributions;
      busFactor++;
      
      if (cumulativeContributions >= threshold) {
        break;
      }
    }
    
    // Get top contributors
    const topContributors = sortedContributors.slice(0, 10).map(contributor => ({
      username: contributor.login,
      contributions: contributor.contributions,
      profileUrl: contributor.html_url,
      avatarUrl: contributor.avatar_url
    }));
    
    // Analyze contributor activity over time
    const contributorActivity = {};
    commits.forEach(commit => {
      const author = commit.author ? commit.author.login : commit.commit.author.name;
      const date = new Date(commit.commit.author.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!contributorActivity[author]) {
        contributorActivity[author] = {};
      }
      
      contributorActivity[author][monthKey] = (contributorActivity[author][monthKey] || 0) + 1;
    });
    
    return {
      totalContributors: contributors.length,
      busFactor,
      topContributors,
      contributorActivity
    };
  }
}

module.exports = new AnalysisService();