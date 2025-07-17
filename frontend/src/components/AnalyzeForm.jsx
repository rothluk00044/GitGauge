"use client"

import { useState } from "react"
import { Search, Github, Zap } from "lucide-react"

const AnalyzeForm = ({ onAnalyze }) => {
  const [repoUrl, setRepoUrl] = useState("")
  const [isValidUrl, setIsValidUrl] = useState(true)

  const validateGitHubUrl = (url) => {
    const githubUrlPattern = /^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/
    return githubUrlPattern.test(url)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!repoUrl.trim()) {
      setIsValidUrl(false)
      return
    }

    if (!validateGitHubUrl(repoUrl)) {
      setIsValidUrl(false)
      return
    }

    setIsValidUrl(true)
    onAnalyze(repoUrl)
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setRepoUrl(value)
    if (value && !validateGitHubUrl(value)) {
      setIsValidUrl(false)
    } else {
      setIsValidUrl(true)
    }
  }

  const exampleRepos = [
    "https://github.com/facebook/react",
    "https://github.com/microsoft/vscode",
    "https://github.com/vercel/next.js",
  ]

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
      <div className="text-center mb-8">
        <div className="bg-blue-100 p-3 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Zap className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Start Repository Analysis</h3>
        <p className="text-slate-600">Enter any public GitHub repository URL to begin comprehensive analysis</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="repo-url" className="block text-sm font-semibold text-slate-700 mb-3">
            GitHub Repository URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Github className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="url"
              id="repo-url"
              value={repoUrl}
              onChange={handleInputChange}
              placeholder="https://github.com/owner/repository"
              className={`block w-full pl-12 pr-4 py-4 border rounded-xl shadow-sm text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                !isValidUrl ? "border-red-300 bg-red-50" : "border-slate-300 bg-white"
              }`}
              required
            />
          </div>
          {!isValidUrl && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">Please enter a valid GitHub repository URL</p>
              <p className="text-xs text-red-600 mt-1">Format: https://github.com/owner/repository</p>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!repoUrl || !isValidUrl}
        >
          <Search className="h-5 w-5 mr-3" />
          Analyze Repository
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-200">
        <p className="text-sm font-semibold text-slate-700 mb-4">Try these popular repositories:</p>
        <div className="space-y-2">
          {exampleRepos.map((repo, index) => (
            <button
              key={index}
              onClick={() => {
                setRepoUrl(repo)
                setIsValidUrl(true)
              }}
              className="block w-full text-left text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors font-mono"
            >
              {repo}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AnalyzeForm