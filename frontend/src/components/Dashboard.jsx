"use client"
import { ArrowLeft, Github, Star, GitFork, AlertCircle, Clock } from "lucide-react"
import CommitChart from "./charts/CommitChart"
import PullRequestChart from "./charts/PullRequestChart"
import IssueChart from "./charts/IssueChart"
import ContributorChart from "./charts/ContributorChart"
import CodeChurnChart from "./charts/CodeChurnChart"
import MetricCard from "./MetricCard"

const Dashboard = ({ report, onNewAnalysis }) => {
  const { metadata, repository, commits, pullRequests, issues, contributors, codeChurn } = report

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onNewAnalysis} className="flex items-center text-primary-600 hover:text-primary-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          New Analysis
        </button>
        <div className="text-sm text-gray-500">Analyzed {new Date(metadata.analyzedAt).toLocaleString()}</div>
      </div>

      {/* Repository Info */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Github className="h-8 w-8 text-gray-600 mr-4" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{repository.fullName}</h2>
              {repository.description && <p className="text-gray-600 mt-1">{repository.description}</p>}
              <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  {repository.stars.toLocaleString()} stars
                </span>
                <span className="flex items-center">
                  <GitFork className="h-4 w-4 mr-1" />
                  {repository.forks.toLocaleString()} forks
                </span>
                {repository.language && <span>Primary: {repository.language}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Commits"
          value={commits.total?.toLocaleString() || "N/A"}
          subtitle={`${commits.averagePerDay?.toFixed(1) || 0} per day avg`}
          icon={<Github className="h-5 w-5" />}
        />
        <MetricCard
          title="Pull Requests"
          value={pullRequests.total?.toLocaleString() || "N/A"}
          subtitle={`${pullRequests.mergeRate || 0}% merge rate`}
          icon={<GitFork className="h-5 w-5" />}
        />
        <MetricCard
          title="Issues"
          value={issues.total?.toLocaleString() || "N/A"}
          subtitle={`${issues.closeRate || 0}% close rate`}
          icon={<AlertCircle className="h-5 w-5" />}
        />
        <MetricCard
          title="Contributors"
          value={contributors.total?.toLocaleString() || "N/A"}
          subtitle={`Bus factor: ${contributors.busFactor || "N/A"}`}
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Commit Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Commit Activity</h3>
          <CommitChart data={commits} />
        </div>

        {/* Pull Request Stats */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pull Request Overview</h3>
          <PullRequestChart data={pullRequests} />
        </div>

        {/* Issue Trends */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Status</h3>
          <IssueChart data={issues} />
        </div>

        {/* Top Contributors */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Contributors</h3>
          <ContributorChart data={contributors} />
        </div>
      </div>

      {/* Code Churn */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Code Churn (Last 3 Months)</h3>
        <CodeChurnChart data={codeChurn} />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Commits */}
        {commits.recentActivity && commits.recentActivity.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Commits</h3>
            <div className="space-y-3">
              {commits.recentActivity.map((commit, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                  <code className="text-xs bg-gray-200 px-2 py-1 rounded">{commit.hash}</code>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{commit.message}</p>
                    <p className="text-xs text-gray-500">
                      by {commit.author} • {new Date(commit.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent PRs */}
        {pullRequests.recent && pullRequests.recent.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Pull Requests</h3>
            <div className="space-y-3">
              {pullRequests.recent.map((pr, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      pr.state === "open" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    #{pr.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{pr.title}</p>
                    <p className="text-xs text-gray-500">
                      by {pr.author} • {new Date(pr.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
