"use client"

import { useState } from "react"
import { Search, Github } from "lucide-react"

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

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="repo-url" className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Repository URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Github className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="url"
              id="repo-url"
              value={repoUrl}
              onChange={handleInputChange}
              placeholder="https://github.com/owner/repository"
              className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                !isValidUrl ? "border-red-300" : "border-gray-300"
              }`}
              required
            />
          </div>
          {!isValidUrl && (
            <p className="mt-1 text-sm text-red-600">
              Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full btn-primary flex items-center justify-center"
          disabled={!repoUrl || !isValidUrl}
        >
          <Search className="h-4 w-4 mr-2" />
          Analyze Repository
        </button>
      </form>

      <div className="mt-4 text-sm text-gray-600">
        <p className="mb-2">
          <strong>Examples:</strong>
        </p>
        <ul className="space-y-1 text-xs">
          <li>• https://github.com/facebook/react</li>
          <li>• https://github.com/microsoft/vscode</li>
          <li>• https://github.com/vercel/next.js</li>
        </ul>
      </div>
    </div>
  )
}

export default AnalyzeForm
