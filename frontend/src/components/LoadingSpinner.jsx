import { Loader2, Github, BarChart3, Users, GitPullRequest, Activity } from "lucide-react"

const LoadingSpinner = ({ progress = 0 }) => {
  const steps = [
    { icon: Github, label: "Connecting to GitHub API", threshold: 20 },
    { icon: Activity, label: "Analyzing commit history", threshold: 40 },
    { icon: GitPullRequest, label: "Processing pull requests", threshold: 60 },
    { icon: Users, label: "Evaluating contributors", threshold: 80 },
    { icon: BarChart3, label: "Generating comprehensive report", threshold: 100 },
  ]

  const currentStep = steps.findIndex((step) => progress < step.threshold)
  const activeStepIndex = currentStep === -1 ? steps.length - 1 : currentStep

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-lg w-full mx-4">
        {/* Main Progress Circle */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-200"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                className="text-blue-600 transition-all duration-500 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-lg font-bold text-slate-900">{Math.round(progress)}%</div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Repository</h3>
          <p className="text-slate-600">Gathering comprehensive data and generating insights</p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            const isActive = index === activeStepIndex
            const isCompleted = progress >= step.threshold

            return (
              <div
                key={index}
                className={`flex items-center space-x-4 p-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-blue-50 border border-blue-200"
                    : isCompleted
                      ? "bg-emerald-50 border border-emerald-200"
                      : "bg-slate-50 border border-slate-200"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    isCompleted ? "bg-emerald-100" : isActive ? "bg-blue-100" : "bg-slate-100"
                  }`}
                >
                  <StepIcon
                    className={`h-5 w-5 ${
                      isCompleted ? "text-emerald-600" : isActive ? "text-blue-600" : "text-slate-400"
                    }`}
                  />
                </div>
                <span
                  className={`font-medium ${
                    isCompleted ? "text-emerald-700" : isActive ? "text-blue-700" : "text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
                {isCompleted && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  </div>
                )}
                {isActive && (
                  <div className="ml-auto">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-slate-100 rounded-xl">
          <p className="text-sm text-slate-700">
            <strong>Note:</strong> Large repositories may take several minutes to analyze completely. We're processing
            commits, pull requests, issues, and contributor data.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner
