const axios = require('axios');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');
const config = require('../config');
const { AppError } = require('../middleware/errorHandler');

class GitHubService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: `token ${config.githubToken}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });
  }

  /**
   * Extract owner and repo from GitHub URL
   * @param {string} repoUrl - GitHub repository URL
   * @returns {Object} - { owner, repo }
   */
  parseRepoUrl(repoUrl) {
    try {
      // Handle different URL formats
      const url = new URL(repoUrl);
      if (url.hostname !== 'github.com') {
        throw new AppError('Invalid GitHub repository URL', 400);
      }
      
      const pathSegments = url.pathname.split('/').filter(Boolean);
      if (pathSegments.length < 2) {
        throw new AppError('Invalid GitHub repository URL format', 400);
      }
      
      return {
        owner: pathSegments[0],
        repo: pathSegments[1]
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Invalid URL format', 400);
    }
  }

  /**
   * Get repository information
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} - Repository data
   */
  async getRepoInfo(owner, repo) {
    try {
      const { data } = await this.axiosInstance.get(`/repos/${owner}/${repo}`);
      return data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get repository commits
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {Object} options - Query parameters
   * @returns {Promise<Array>} - Commits data
   */
  async getCommits(owner, repo, options = {}) {
    try {
      const { data } = await this.axiosInstance.get(`/repos/${owner}/${repo}/commits`, {
        params: {
          per_page: 100,
          ...options
        }
      });
      return data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get repository pull requests
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} state - PR state (open, closed, all)
   * @returns {Promise<Array>} - Pull requests data
   */
  async getPullRequests(owner, repo, state = 'all') {
    try {
      const { data } = await this.axiosInstance.get(`/repos/${owner}/${repo}/pulls`, {
        params: {
          state,
          per_page: 100
        }
      });
      return data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get repository issues
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} state - Issue state (open, closed, all)
   * @returns {Promise<Array>} - Issues data
   */
  async getIssues(owner, repo, state = 'all') {
    try {
      const { data } = await this.axiosInstance.get(`/repos/${owner}/${repo}/issues`, {
        params: {
          state,
          per_page: 100
        }
      });
      // Filter out pull requests which are also returned by the issues endpoint
      return data.filter(issue => !issue.pull_request);
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get repository contributors
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Array>} - Contributors data
   */
  async getContributors(owner, repo) {
    try {
      const { data } = await this.axiosInstance.get(`/repos/${owner}/${repo}/contributors`, {
        params: {
          per_page: 100
        }
      });
      return data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Clone repository for detailed analysis
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<string>} - Path to cloned repository
   */
  async cloneRepository(owner, repo) {
    const repoUrl = `https://github.com/${owner}/${repo}.git`;
    const tempDir = path.join(config.tempDir, `${owner}_${repo}_${Date.now()}`);
    
    try {
      // Ensure temp directory exists
      if (!fs.existsSync(config.tempDir)) {
        fs.mkdirSync(config.tempDir, { recursive: true });
      }
      
      logger.info(`Cloning repository: ${repoUrl} to ${tempDir}`);
      
      const git = simpleGit();
      await git.clone(repoUrl, tempDir, ['--depth=1']);
      
      return tempDir;
    } catch (error) {
      logger.error(`Error cloning repository: ${error.message}`);
      throw new AppError('Failed to clone repository', 500);
    }
  }

  /**
   * Analyze repository code churn using git
   * @param {string} repoPath - Path to cloned repository
   * @returns {Promise<Object>} - Code churn analysis
   */
  async analyzeCodeChurn(repoPath) {
    try {
      const git = simpleGit(repoPath);
      
      // Get file changes over time
      const log = await git.log(['--name-status', '--pretty=format:"%h|%an|%ad|%s"']);
      
      // Process log to extract file changes
      const fileChanges = {};
      let currentCommit = null;
      
      log.all.forEach(commit => {
        const [hash, author, date, message] = commit.hash.replace(/"/g, '').split('|');
        currentCommit = { hash, author, date, message, files: [] };
        
        // Process file changes in this commit
        if (commit.diff && commit.diff.files) {
          commit.diff.files.forEach(file => {
            const fileName = file.file;
            if (!fileChanges[fileName]) {
              fileChanges[fileName] = { additions: 0, deletions: 0, changes: 0 };
            }
            
            fileChanges[fileName].changes += 1;
            currentCommit.files.push(fileName);
          });
        }
      });
      
      return {
        fileChanges,
        totalFiles: Object.keys(fileChanges).length,
        mostChangedFiles: Object.entries(fileChanges)
          .sort((a, b) => b[1].changes - a[1].changes)
          .slice(0, 10)
          .map(([file, stats]) => ({ file, ...stats }))
      };
    } catch (error) {
      logger.error(`Error analyzing code churn: ${error.message}`);
      throw new AppError('Failed to analyze code churn', 500);
    }
  }

  /**
   * Clean up temporary repository directory
   * @param {string} repoPath - Path to cloned repository
   */
  async cleanupRepository(repoPath) {
    try {
      if (fs.existsSync(repoPath)) {
        fs.rmSync(repoPath, { recursive: true, force: true });
        logger.info(`Cleaned up repository at ${repoPath}`);
      }
    } catch (error) {
      logger.error(`Error cleaning up repository: ${error.message}`);
    }
  }

  /**
   * Handle GitHub API errors
   * @param {Error} error - Axios error
   */
  handleApiError(error) {
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle rate limiting
      if (status === 403 && data.message.includes('API rate limit exceeded')) {
        throw new AppError('GitHub API rate limit exceeded. Please try again later.', 429);
      }
      
      // Handle not found
      if (status === 404) {
        throw new AppError('Repository not found', 404);
      }
      
      // Handle unauthorized
      if (status === 401) {
        throw new AppError('Invalid GitHub token or unauthorized access', 401);
      }
      
      throw new AppError(data.message || 'GitHub API error', status);
    }
    
    throw new AppError('Failed to connect to GitHub API', 500);
  }
}

module.exports = new GitHubService();