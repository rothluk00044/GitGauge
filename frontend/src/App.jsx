"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Github, Activity, GitPullRequest, AlertCircle, Users, Zap } from "lucide-react"
import Dashboard from "./components/Dashboard"
import AnalyzeForm from "./components/AnalyzeForm"
import LoadingSpinner from "./components/LoadingSpinner"
import ErrorBoundary from "./components/ErrorBoundary"

// Configure axios defaults
axios.defaults.timeout = 300000 // 5 minutes timeout for analysis
axios.defaults.baseURL = import.meta.env.PROD ? "https://rothluk00044.github.io/GitGauge" : "http://localhost:3001"

function App() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [recentReports, setRecentReports] = useState([])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    fetchRecentReports()
    checkBackendHealth()
  }, [])

  const checkBackendHealth = async () => {
    try {
      await axios.get("/api/health")
    } catch (error) {
      console.warn("Backend health check failed:", error.message)
    }
  }

  const fetchRecentReports = async () => {
    try {
      const response = await axios.get("/api/reports")
      setRecentReports(response.data.slice(0, 6))
    } catch (error) {
      console.error("Failed to fetch recent reports:", error)
    }
  }

  const handleAnalyze = async (repoUrl) => {
    setLoading(true)
    setError(null)
    setProgress(0)

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        return prev + Math.random() * 10
      })
    }, 1000)

    try {
      const response = await axios.post("/api/analyze", { repoUrl })
      setReport(response.data)
      setProgress(100)
      await fetchRecentReports()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Analysis failed"
      const errorCode = error.response?.data?.code || "UNKNOWN_ERROR"

      setError({
        message: errorMessage,
        code: errorCode,
        status: error.response?.status,
      })
    } finally {
      clearInterval(progressInterval)
      setLoading(false)
      setProgress(0)
    }
  }

  const loadReport = async (filename) => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/reports/${filename}`)
      setReport(response.data)
      setError(null)
    } catch (error) {
      setError({
        message: "Failed to load report",
        code: "LOAD_FAILED",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetView = () => {
    setReport(null)
    setError(null)
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center cursor-pointer" onClick={resetView}>
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg mr-3">
                  <Github className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    GitGauge
                  </h1>
                  <p className="text-sm text-gray-600">Repository Health Dashboard</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-1 text-green-500" />
                    Real-time Analysis
                  </div>
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-1 text-yellow-500" />
                    AI-Powered Insights
                  </div>
                </div>
                <a
                  href="https://github.com/rothluk00044/GitGauge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Github className="h-5 w-5 mr-1" />
                  <span className="hidden sm:inline">View Source</span>
                </a>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!report && !loading && (
            <div className="space-y-8">
              {/* Hero Section */}
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm font-medium mb-4">
                    <Zap className="h-4 w-4 mr-2" />
                    Powered by GitHub API & Advanced Analytics
                  </div>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Analyze Your GitHub Repository</h2>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  Get comprehensive insights into your repository's health, including commit patterns, pull request
                  metrics, issue trends, contributor activity, and code churn analysis.
                </p>
              </div>

              {/* Analyze Form */}
              <div className="max-w-2xl mx-auto">
                <AnalyzeForm onAnalyze={handleAnalyze} />
              </div>

              {/* Recent Reports */}
              {recentReports.length > 0 && (
                <div className="mt-16">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">Recent Analysis Reports</h3>
                    <button
                      onClick={fetchRecentReports}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Refresh
                    </button>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {recentReports.map((reportItem) => (
                      <div
                        key={reportItem.filename}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200"
                        onClick={() => loadReport(reportItem.filename)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 truncate text-lg">
                            {reportItem.metadata.repoName}
                          </h4>
                          <Github className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {reportItem.metadata.owner}/{reportItem.metadata.repoName}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{new Date(reportItem.timestamp).toLocaleDateString()}</span>
                          {reportItem.performance && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {(reportItem.performance.analysisTime / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features Grid */}
              <div className="mt-20">
                <h3 className="text-2xl font-bold text-gray-900 mb-12 text-center">
                  Comprehensive Repository Analysis
                </h3>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      icon: Activity,
                      title: "Commit Activity",
                      description: "Track commit frequency, patterns, and author contributions over time",
                      color: "blue",
                    },
                    {
                      icon: GitPullRequest,
                      title: "Pull Request Metrics",
                      description: "Analyze PR status, merge rates, and average review times",
                      color: "green",
                    },
                    {
                      icon: AlertCircle,
                      title: "Issue Tracking",
                      description: "Monitor issue trends, resolution rates, and label distribution",
                      color: "yellow",
                    },
                    {
                      icon: Users,
                      title: "Contributor Analysis",
                      description: "Understand team dynamics, bus factor, and contribution patterns",
                      color: "purple",
                    },
                  ].map((feature, index) => (
                    <div key={index} className="text-center group">
                      <div
                        className={`bg-${feature.color}-100 rounded-2xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                      >
                        <feature.icon className={`h-8 w-8 text-${feature.color}-600`} />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2 text-lg">{feature.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {loading && <LoadingSpinner progress={progress} />}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Analysis Error</h3>
                  <p className="text-red-700 mb-3">{error.message}</p>
                  {error.code && <p className="text-sm text-red-600">Error Code: {error.code}</p>}
                  <button
                    onClick={() => setError(null)}
                    className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {report && <Dashboard report={report} onNewAnalysis={resetView} />}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600">
              <p className="mb-2">Built with ❤️ using React, Node.js, and GitHub API</p>
              <p className="text-sm">© 2024 GitGauge. Open source project for repository analytics.</p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}

export default App
