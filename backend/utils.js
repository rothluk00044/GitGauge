import { Octokit } from '@octokit/rest';
import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs';

export async function analyzeRepo(repoUrl) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) throw new Error('Invalid GitHub repo URL');
  const [, owner, repo] = match;

  const tmpDir = path.resolve('./tmp', repo);
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
  await simpleGit().clone(repoUrl, tmpDir, ['--depth', '100']);
  const git = simpleGit(tmpDir);

  // Commits
  const commits = await git.log();
  // Code churn
  const churn = await git.raw(['log', '--pretty=tformat:', '--numstat']);
  const lines = churn.split('\n').filter(Boolean);
  let added = 0, deleted = 0;
  lines.forEach(line => {
    const [a, d] = line.split('\t');
    added += parseInt(a) || 0;
    deleted += parseInt(d) || 0;
  });

  // PRs
  const pulls = await octokit.rest.pulls.list({ owner, repo, state: 'all', per_page: 100 });
  // Issues
  const issues = await octokit.rest.issues.listForRepo({ owner, repo, state: 'all', per_page: 100 });
  // Contributors
  const contributors = await octokit.rest.repos.listContributors({ owner, repo, per_page: 100 });

  return {
    repo: repoUrl,
    commitCount: commits.total,
    commits: commits.all.map(c => ({ date: c.date, author: c.author_name })),
    codeChurn: { added, deleted },
    pullRequests: pulls.data.map(pr => ({
      id: pr.id,
      state: pr.state,
      merged: pr.merged_at ? true : false,
      created: pr.created_at,
      closed: pr.closed_at,
      user: pr.user.login
    })),
    issues: issues.data.map(i => ({
      id: i.id,
      state: i.state,
      created: i.created_at,
      closed: i.closed_at,
      user: i.user.login
    })),
    contributors: contributors.data.map(c => ({
      login: c.login,
      contributions: c.contributions
    }))
  };
}
