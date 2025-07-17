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
