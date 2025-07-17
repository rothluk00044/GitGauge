"use client"

import {
  ArrowLeft,
  Github,
  Star,
  GitFork,
  AlertCircle,
  Clock,
  Calendar,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react"
import CommitChart from "./charts/CommitChart"
import PullRequestChart from "./charts/PullRequestChart"
import IssueChart from "./charts/IssueChart"
import ContributorChart from "./charts/ContributorChart"
import CodeChurnChart from "./charts/CodeChurnChart"
import MetricCard from "./MetricCard"

const Dashboard = ({ report, onNewAnalysis }) => {
  const { metadata, repository, commits, pullRequests, issues, contributors, codeChurn } = report

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "N/A"
    return num.toLocaleString()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-6">
        <button
          onClick={onNewAnalysis}
          className="flex items-center text-slate-600 hover:text-slate-900 font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          New Analysis
        </button>
        <div className="text-sm text-slate-500 flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Analyzed {formatDate(metadata.analyzedAt)}
        </div>
      </div>

      {/* Repository Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <div className="bg-slate-100 p-4 rounded-2xl mr-6">
              <Github className="h-8 w-8 text-slate-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{repository.fullName}</h1>
              {repository.description && (
                <p className="text-lg text-slate-600 mb-4 max-w-2xl">{repository.description}</p>
              )}
              <div className="flex items-center space-x-6 text-sm text-slate-500">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  <span className="font-medium">{formatNumber(repository.stars)}</span>
                  <span className="ml-1">stars</span>
                </div>
                <div className="flex items-center">
                  <GitFork className="h-4 w-4 mr-1" />
                  <span className="font-medium">{formatNumber(repository.forks)}</span>
                  <span className="ml-1">forks</span>
                </div>
                {repository.language && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span>{repository.language}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Created {new Date(repository.createdAt).getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Commits"
          value={formatNumber(commits.total)}
          subtitle={`${commits.averagePerDay?.toFixed(1) || 0} per day average`}
          icon={<Activity className="h-5 w-5" />}
          trend={commits.total > 100 ? "positive" : commits.total > 50 ? "neutral" : "negative"}
        />
        <MetricCard
          title="Pull Requests"
          value={formatNumber(pullRequests.total)}
          subtitle={`${pullRequests.mergeRate || 0}% merge rate`}
          icon={<GitFork className="h-5 w-5" />}
          trend={pullRequests.mergeRate > 80 ? "positive" : pullRequests.mergeRate > 60 ? "neutral" : "negative"}
        />
        <MetricCard
          title="Issues"
          value={formatNumber(issues.total)}
          subtitle={`${issues.closeRate || 0}% resolution rate`}
          icon={<AlertCircle className="h-5 w-5" />}
          trend={issues.closeRate > 80 ? "positive" : issues.closeRate > 60 ? "neutral" : "negative"}
        />
        <MetricCard
          title="Contributors"
          value={formatNumber(contributors.total)}
          subtitle={`Bus factor: ${contributors.busFactor || "N/A"}`}
          icon={<Users className="h-5 w-5" />}
          trend={contributors.busFactor > 3 ? "positive" : contributors.busFactor > 1 ? "neutral" : "negative"}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Commit Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Commit Activity</h3>
            <div className="flex items-center text-sm text-slate-500">
              <TrendingUp className="h-4 w-4 mr-1" />
              Last 12 months
            </div>
          </div>
          <CommitChart data={commits} />
        </div>

        {/* Pull Request Analysis */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Pull Request Analysis</h3>
            <div className="text-sm text-slate-500">Status Distribution</div>
          </div>
          <PullRequestChart data={pullRequests} />
        </div>

        {/* Issue Management */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Issue Management</h3>
            <div className="text-sm text-slate-500">Resolution Status</div>
          </div>
          <IssueChart data={issues} />
        </div>

        {/* Top Contributors */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Top Contributors</h3>
            <div className="text-sm text-slate-500">By Contributions</div>
          </div>
          <ContributorChart data={contributors} />
        </div>
      </div>

      {/* Code Churn Analysis */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Code Churn Analysis</h3>
          <div className="text-sm text-slate-500">Last 6 months</div>
        </div>
        <CodeChurnChart data={codeChurn} />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Commits */}
        {commits.recentActivity && commits.recentActivity.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Commits</h3>
            <div className="space-y-4">
              {commits.recentActivity.slice(0, 5).map((commit, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-xl">
                  <div className="bg-slate-200 px-2 py-1 rounded text-xs font-mono text-slate-600">{commit.hash}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{commit.message}</p>
                    <div className="flex items-center mt-1 text-xs text-slate-500">
                      <span>{commit.author}</span>
                      <span className="mx-2">•</span>
                      <span>{commit.date ? formatDate(commit.date) : "Unknown date"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Pull Requests */}
        {pullRequests.recent && pullRequests.recent.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Pull Requests</h3>
            <div className="space-y-4">
              {pullRequests.recent.slice(0, 5).map((pr, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-xl">
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      pr.state === "open"
                        ? "bg-emerald-100 text-emerald-700"
                        : pr.state === "merged"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    #{pr.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{pr.title}</p>
                    <div className="flex items-center mt-1 text-xs text-slate-500">
                      <span>{pr.author}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(pr.createdAt)}</span>
                    </div>
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
