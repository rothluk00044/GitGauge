import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Doughnut } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend)

const IssueChart = ({ data }) => {
  if (!data || data.total === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 rounded-xl">
        <div className="text-center">
          <div className="text-slate-400 mb-2">No issue data available</div>
          <div className="text-sm text-slate-500">Repository may not have any issues yet</div>
        </div>
      </div>
    )
  }

  const chartData = {
    labels: ["Open Issues", "Closed Issues"],
    datasets: [
      {
        data: [data.open || 0, data.closed || 0],
        backgroundColor: [
          "rgba(239, 68, 68, 0.8)", // Red for open
          "rgba(34, 197, 94, 0.8)", // Green for closed
        ],
        borderColor: ["rgb(239, 68, 68)", "rgb(34, 197, 94)"],
        borderWidth: 3,
        hoverBorderWidth: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            size: 12,
            weight: "500",
          },
          color: "#64748b",
        },
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
            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0
            return `${context.label}: ${context.parsed} (${percentage}%)`
          },
        },
      },
    },
  }

  const closeRate = data.closeRate || 0
  const avgResolutionTime = data.averageResolutionTime || 0

  return (
    <div className="space-y-4">
      <div className="h-48 relative">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{data.total}</div>
            <div className="text-sm text-slate-600">Total Issues</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">{closeRate}%</div>
          <div className="text-sm text-slate-600">Resolution Rate</div>
          <div
            className={`mt-1 text-xs px-2 py-1 rounded-full inline-block ${
              closeRate >= 80
                ? "bg-emerald-100 text-emerald-700"
                : closeRate >= 60
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {closeRate >= 80 ? "Excellent" : closeRate >= 60 ? "Good" : "Needs Attention"}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">
            {avgResolutionTime > 0 ? `${avgResolutionTime}d` : "N/A"}
          </div>
          <div className="text-sm text-slate-600">Avg Resolution</div>
          <div
            className={`mt-1 text-xs px-2 py-1 rounded-full inline-block ${
              avgResolutionTime <= 7
                ? "bg-emerald-100 text-emerald-700"
                : avgResolutionTime <= 30
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {avgResolutionTime <= 7 ? "Fast" : avgResolutionTime <= 30 ? "Moderate" : "Slow"}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IssueChart
