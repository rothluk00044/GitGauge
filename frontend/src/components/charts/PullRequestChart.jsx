import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const PullRequestChart = ({ data }) => {
  if (!data || data.total === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 rounded-xl">
        <div className="text-center">
          <div className="text-slate-400 mb-2">No pull request data available</div>
          <div className="text-sm text-slate-500">Repository may not have any pull requests yet</div>
        </div>
      </div>
    )
  }

  const chartData = {
    labels: ["Open", "Merged", "Closed"],
    datasets: [
      {
        label: "Pull Requests",
        data: [data.open || 0, data.merged || 0, data.closed - data.merged || 0],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)", // Green for open
          "rgba(168, 85, 247, 0.8)", // Purple for merged
          "rgba(239, 68, 68, 0.8)", // Red for closed
        ],
        borderColor: ["rgb(34, 197, 94)", "rgb(168, 85, 247)", "rgb(239, 68, 68)"],
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const total = data.total || 0
            const percentage = total > 0 ? ((context.parsed.y / total) * 100).toFixed(1) : 0
            return `${context.label}: ${context.parsed.y} (${percentage}%)`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 12,
          },
          callback: (value) => (Number.isInteger(value) ? value : ""),
        },
      },
    },
  }

  const mergeRate = data.mergeRate || 0
  const avgReviewTime = data.averageReviewTime || 0

  return (
    <div className="space-y-4">
      <div className="h-48">
        <Bar data={chartData} options={options} />
      </div>
      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">{mergeRate}%</div>
          <div className="text-sm text-slate-600">Merge Rate</div>
          <div
            className={`mt-1 text-xs px-2 py-1 rounded-full inline-block ${
              mergeRate >= 80
                ? "bg-emerald-100 text-emerald-700"
                : mergeRate >= 60
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {mergeRate >= 80 ? "Excellent" : mergeRate >= 60 ? "Good" : "Needs Improvement"}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">{avgReviewTime > 0 ? `${avgReviewTime}h` : "N/A"}</div>
          <div className="text-sm text-slate-600">Avg Review Time</div>
          <div
            className={`mt-1 text-xs px-2 py-1 rounded-full inline-block ${
              avgReviewTime <= 24
                ? "bg-emerald-100 text-emerald-700"
                : avgReviewTime <= 72
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {avgReviewTime <= 24 ? "Fast" : avgReviewTime <= 72 ? "Moderate" : "Slow"}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PullRequestChart
