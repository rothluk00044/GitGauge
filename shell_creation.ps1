# Run this script in PowerShell from your project root

# Create folders
New-Item -ItemType Directory -Force -Path backend
New-Item -ItemType Directory -Force -Path backend\__tests__
New-Item -ItemType Directory -Force -Path frontend
New-Item -ItemType Directory -Force -Path frontend\public
New-Item -ItemType Directory -Force -Path frontend\src
New-Item -ItemType Directory -Force -Path frontend\src\components
New-Item -ItemType Directory -Force -Path .github
New-Item -ItemType Directory -Force -Path .github\workflows

# .gitignore
@"
node_modules/
.env
frontend/dist/
"@ | Set-Content .gitignore

# README.md (preserves your current content)
# Skipped, as you already have README.md

# backend/package.json
@"
{
  "name": "gitgauge-backend",
  "version": "1.0.0",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "test": "echo \"No tests yet\""
  },
  "dependencies": {
    "@octokit/rest": "^20.0.0",
    "dotenv": "^16.0.0",
    "express": "^4.18.2",
    "simple-git": "^3.19.0"
  }
}
"@ | Set-Content backend\package.json

# backend/.env (sample, you must edit with your PAT)
@"
GITHUB_TOKEN=your_personal_access_token
"@ | Set-Content backend\.env

# backend/index.js
@"
import 'dotenv/config';
import express from 'express';
import { Octokit } from '@octokit/rest';
import simpleGit from 'simple-git';
import fs from 'fs';
import path from 'path';
import { analyzeRepo } from './utils.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.post('/analyze', async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) return res.status(400).json({ error: 'repoUrl required' });
  try {
    const report = await analyzeRepo(repoUrl);
    fs.writeFileSync(path.resolve('./report.json'), JSON.stringify(report, null, 2));
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(\`GitGauge backend running on port \${PORT}\`);
});

// CLI usage
if (process.argv[2]) {
  (async () => {
    const report = await analyzeRepo(process.argv[2]);
    fs.writeFileSync(path.resolve('./report.json'), JSON.stringify(report, null, 2));
    console.log('Report generated at report.json');
  })();
}
"@ | Set-Content backend\index.js

# backend/utils.js
@"
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
"@ | Set-Content backend\utils.js

# frontend/package.json
@"
{
  "name": "gitgauge-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "chart.js": "^4.4.0",
    "react": "^18.2.0",
    "react-chartjs-2": "^5.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0"
  }
}
"@ | Set-Content frontend\package.json

# frontend/vite.config.js
@"
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/analyze': 'http://localhost:3001'
    }
  }
});
"@ | Set-Content frontend\vite.config.js

# frontend/public/report.json
@"
{}
"@ | Set-Content frontend\public\report.json

# frontend/src/index.js
@"
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
"@ | Set-Content frontend\src\index.js

# frontend/src/App.jsx
@"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';

export default function App() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    axios.get('/report.json')
      .then(res => setReport(res.data))
      .catch(() => setReport(null));
  }, []);

  return (
    <div>
      <h1>GitGauge Dashboard</h1>
      {report ? <Dashboard report={report} /> : <div>Loading report...</div>}
    </div>
  );
}
"@ | Set-Content frontend\src\App.jsx

# frontend/src/components/Dashboard.jsx
@"
import React from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

export default function Dashboard({ report }) {
  if (!report) return null;

  const commitData = {
    labels: report.commits.map(c => c.date),
    datasets: [{
      label: 'Commits',
      data: report.commits.map(() => 1),
      backgroundColor: 'rgba(53, 162, 235, 0.5)'
    }]
  };

  const prData = {
    labels: ['Open', 'Closed', 'Merged'],
    datasets: [{
      label: 'PRs',
      data: [
        report.pullRequests.filter(pr => pr.state === 'open').length,
        report.pullRequests.filter(pr => pr.state === 'closed').length,
        report.pullRequests.filter(pr => pr.merged).length
      ],
      backgroundColor: ['#36a2eb', '#ff6384', '#4bc0c0']
    }]
  };

  const churnData = {
    labels: ['Added', 'Deleted'],
    datasets: [{
      label: 'Code Churn',
      data: [report.codeChurn.added, report.codeChurn.deleted],
      backgroundColor: ['#2ecc40', '#ff4136']
    }]
  };

  return (
    <div>
      <h2>Commits Over Time</h2>
      <Line data={commitData} />
      <h2>Pull Request Status</h2>
      <Pie data={prData} />
      <h2>Code Churn</h2>
      <Bar data={churnData} />
      <h2>Contributors</h2>
      <ul>
        {report.contributors.map(c => (
          <li key={c.login}>{c.login}: {c.contributions} contributions</li>
        ))}
      </ul>
    </div>
  );
}
"@ | Set-Content frontend\src\components\Dashboard.jsx

# .github/workflows/analyze-repo.yml
@"
name: Analyze GitHub Repo

on:
  workflow_dispatch:
    inputs:
      repo-url:
        description: 'GitHub repository URL to analyze'
        required: true

jobs:
  analyze:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout this repo
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install backend dependencies
      working-directory: ./backend
      run: npm install

    - name: Run repo analysis
      working-directory: ./backend
      env:
        GITHUB_TOKEN: \$'{{ secrets.GITHUB_TOKEN }}
      run: node index.js \$'{{ github.event.inputs.repo-url }}

    - name: Copy report to frontend
      run: cp ./backend/report.json ./frontend/public/report.json

    - name: Setup frontend dependencies
      working-directory: ./frontend
      run: npm install

    - name: Build frontend
      working-directory: ./frontend
      run: npm run build

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: \$'{{ secrets.GITHUB_TOKEN }}
        publish_dir: ./frontend/dist
"@ | Set-Content .github\workflows\analyze-repo.yml