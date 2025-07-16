GitGauge
- GitGuage is an automated GitHub repository health dashboard designed to give developers and engineering teams real-time, data-driven insights into the state of their codebases

Overview
- GitGauge helps developers, open-source maintainers, and engineering teams track the health and momentum of GitHub repositories by automating repository analysis and providing an interactive dashboard displaying key metrics like commits, pull requests, issues, contributors, and code churn.

Features
- Analyze any GitHub repository by simply inputting the repo URL.

- View commit frequency, pull request status, issue trends, and contributor activity.

- Monitor test coverage trends and code churn metrics.

- AI-powered summary reports.

- Fully automated analysis and deployment using GitHub Actions.


Installation Prerequisites
- Node.js v16+

- Git CLI

- GitHub account

- Personal Access Token (PAT) with repo access (if working with private repos)

Clone the repository
bash
Copy
Edit
git clone https://github.com/your-username/gitgauge.git
cd gitgauge
Backend setup
bash
Copy
Edit
cd backend
npm install
Create a .env file in /backend:

ini
Copy
Edit
GITHUB_TOKEN=your_personal_access_token_here
Frontend setup
bash
Copy
Edit
cd ../frontend
npm install
Usage
Running locally
From /backend, run analysis script on a repo URL:

bash
Copy
Edit
node index.js https://github.com/facebook/react
This generates a report.json file with metrics.

Serve the frontend (which reads report.json from /frontend/public):

bash
Copy
Edit
npm run dev
Open your browser at http://localhost:3000 to see the dashboard.

Running via GitHub Actions
Push all changes to GitHub.

In your repo, go to Actions → Analyze GitHub Repo workflow.

Click Run workflow, enter the repo URL, and start the analysis.

Wait for the workflow to finish; the dashboard will be deployed to GitHub Pages.

Access it at: https://rothluk00044.github.io/gitgauge

Technology Stack
- Backend: Node.js, @octokit/rest, simple-git

- Frontend: React, Chart.js, Vite

- CI/CD: GitHub Actions

Hosting: GitHub Pages

Contact
Created by Luke Roth -> rothluk00044@gmail.com
GitHub: https://github.com/rothluk00044
