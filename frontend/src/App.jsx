"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Github, Activity, GitPullRequest, AlertCircle, Users, BarChart3, TrendingUp } from "lucide-react"
import Dashboard from "./components/Dashboard"
import AnalyzeForm from "./components/AnalyzeForm"
import LoadingSpinner from "./components/LoadingSpinner"
import ErrorBoundary from "./components/ErrorBoundary"

// Configure axios defaults
axios.defaults.timeout = 300000
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
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center cursor-pointer" onClick={resetView}>
                <div className="bg-slate-900 p-2.5 rounded-xl mr-3">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">GitGauge</h1>
                  <p className="text-sm text-slate-600">Repository Analytics Platform</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="hidden md:flex items-center space-x-6">
                  <div className="flex items-center text-sm text-slate-600">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                    Live Analysis
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Advanced Metrics
                  </div>
                </div>
                <a
                  href="https://github.com/rothluk00044/GitGauge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <Github className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline font-medium">Source</span>
                </a>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!report && !loading && (
            <div className="space-y-12">
              {/* Hero Section */}
              <div className="text-center py-12">
                <div className="mb-8">
                  <div className="inline-flex items-center px-4 py-2 bg-slate-100 border border-slate-200 rounded-full text-slate-700 text-sm font-medium mb-6">
                    <Activity className="h-4 w-4 mr-2" />
                    Enterprise-Grade Repository Intelligence
                  </div>
                </div>
                <h2 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
                  Comprehensive GitHub
                  <br />
                  <span className="text-blue-600">Repository Analysis</span>
                </h2>
                <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                  Deep insights into repository health, development patterns, team productivity, and code quality
                  metrics. Make data-driven decisions with comprehensive analytics.
                </p>
              </div>

              {/* Analyze Form */}
              <div className="max-w-2xl mx-auto">
                <AnalyzeForm onAnalyze={handleAnalyze} />
              </div>

              {/* Recent Reports */}
              {recentReports.length > 0 && (
                <div className="mt-20">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">Recent Analysis Reports</h3>
                      <p className="text-slate-600 mt-1">Previously analyzed repositories</p>
                    </div>
                    <button
                      onClick={fetchRecentReports}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Refresh
                    </button>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {recentReports.map((reportItem) => (
                      <div
                        key={reportItem.filename}
                        className="bg-white rounded-2xl border border-slate-200 p-6 cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all duration-200"
                        onClick={() => loadReport(reportItem.filename)}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="bg-slate-100 p-2 rounded-lg">
                            <Github className="h-5 w-5 text-slate-600" />
                          </div>
                          {reportItem.performance && (
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                              {(reportItem.performance.analysisTime / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-slate-900 text-lg mb-2 truncate">
                          {reportItem.metadata.repoName}
                        </h4>
                        <p className="text-sm text-slate-600 mb-4">
                          {reportItem.metadata.owner}/{reportItem.metadata.repoName}
                        </p>
                        <div className="text-xs text-slate-500">
                          Analyzed {new Date(reportItem.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features Grid */}
              <div className="mt-24">
                <div className="text-center mb-16">
                  <h3 className="text-3xl font-bold text-slate-900 mb-4">Advanced Analytics Suite</h3>
                  <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Comprehensive metrics and insights to understand your repository's health and team performance
                  </p>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      icon: Activity,
                      title: "Commit Analytics",
                      description: "Detailed commit patterns, frequency analysis, and author contribution metrics",
                      color: "blue",
                    },
                    {
                      icon: GitPullRequest,
                      title: "Pull Request Intelligence",
                      description: "PR lifecycle analysis, review times, merge patterns, and collaboration metrics",
                      color: "emerald",
                    },
                    {
                      icon: AlertCircle,
                      title: "Issue Management",
                      description: "Issue lifecycle tracking, resolution patterns, and project health indicators",
                      color: "amber",
                    },
                    {
                      icon: Users,
                      title: "Team Dynamics",
                      description: "Contributor analysis, knowledge distribution, and team collaboration insights",
                      color: "purple",
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl border border-slate-200 p-8 text-center group hover:border-slate-300 transition-colors"
                    >
                      <div
                        className={`bg-${feature.color}-100 rounded-2xl p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center`}
                      >
                        <feature.icon className={`h-8 w-8 text-${feature.color}-600`} />
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-3 text-lg">{feature.title}</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {loading && <LoadingSpinner progress={progress} />}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-8">
              <div className="flex items-start">
                <div className="bg-red-100 p-2 rounded-lg mr-4">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Analysis Failed</h3>
                  <p className="text-red-700 mb-4">{error.message}</p>
                  {error.code && (
                    <p className="text-sm text-red-600 mb-4 font-mono bg-red-100 px-3 py-1 rounded">
                      Error Code: {error.code}
                    </p>
                  )}
                  <button
                    onClick={() => setError(null)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Dismiss Error
                  </button>
                </div>
              </div>
            </div>
          )}

          {report && <Dashboard report={report} onNewAnalysis={resetView} />}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-slate-900 p-2 rounded-lg mr-3">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-slate-900">GitGauge</span>
              </div>
              <p className="text-slate-600 mb-2">
                Built with React, Node.js, and GitHub API for comprehensive repository analytics
              </p>
              <p className="text-sm text-slate-500">
                Open source repository intelligence platform for development teams
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}

export default App
