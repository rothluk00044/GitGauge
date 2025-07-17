import { Loader2, Github, BarChart3, Users, GitPullRequest } from "lucide-react"

const LoadingSpinner = ({ progress = 0 }) => {
  const steps = [
    { icon: Github, label: "Connecting to GitHub API", threshold: 20 },
    { icon: BarChart3, label: "Analyzing commit history", threshold: 40 },
    { icon: GitPullRequest, label: "Processing pull requests", threshold: 60 },
    { icon: Users, label: "Evaluating contributors", threshold: 80 },
    { icon: BarChart3, label: "Generating insights", threshold: 100 },
  ]

  const currentStep = steps.findIndex((step) => progress < step.threshold)
  const activeStepIndex = currentStep === -1 ? steps.length - 1 : currentStep

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
        {/* Main spinner */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-xs font-bold text-blue-600">{Math.round(progress)}%</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current status */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Repository</h3>
          <p className="text-gray-600">This may take a few moments while we gather comprehensive data...</p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            const isActive = index === activeStepIndex
            const isCompleted = progress >= step.threshold

            return (
              <div
                key={index}
                className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-300 ${
                  isActive ? "bg-blue-50 border border-blue-200" : isCompleted ? "bg-green-50" : "bg-gray-50"
                }`}
              >
                <div
                  className={`p-1.5 rounded-full ${
                    isCompleted ? "bg-green-100" : isActive ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  <StepIcon
                    className={`h-4 w-4 ${
                      isCompleted ? "text-green-600" : isActive ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                </div>
                <span
                  className={`text-sm ${
                    isCompleted
                      ? "text-green-700 font-medium"
                      : isActive
                        ? "text-blue-700 font-medium"
                        : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
                {isCompleted && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Tips */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 <strong>Tip:</strong> Large repositories may take longer to analyze. We're gathering data on commits,
            PRs, issues, and contributors.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner
