import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const CodeChurnChart = ({ data }) => {
  if (!data || (data.totalAdditions === 0 && data.totalDeletions === 0)) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 rounded-xl">
        <div className="text-center">
          <div className="text-slate-400 mb-2">No code churn data available</div>
          <div className="text-sm text-slate-500">Repository may not have recent code changes</div>
        </div>
      </div>
    )
  }

  const chartData = {
    labels: ["Lines Added", "Lines Deleted"],
    datasets: [
      {
        label: "Lines of Code",
        data: [data.totalAdditions || 0, data.totalDeletions || 0],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)", // Green for additions
          "rgba(239, 68, 68, 0.8)", // Red for deletions
        ],
        borderColor: ["rgb(34, 197, 94)", "rgb(239, 68, 68)"],
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
            return `${context.label}: ${context.parsed.y.toLocaleString()} lines`
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
          callback: (value) => value.toLocaleString(),
        },
      },
    },
  }

  const netChange = data.netChange || 0
  const churnRate = data.churnRate || 0
  const topFiles = data.topChurnedFiles || []

  return (
    <div className="space-y-6">
      <div className="h-48">
        <Bar data={chartData} options={options} />
      </div>

      <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-100">
        <div className="text-center">
          <div className={`text-2xl font-bold ${netChange >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {netChange >= 0 ? "+" : ""}
            {netChange.toLocaleString()}
          </div>
          <div className="text-sm text-slate-600">Net Change</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">{churnRate}</div>
          <div className="text-sm text-slate-600">Churn Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">{topFiles.length}</div>
          <div className="text-sm text-slate-600">Active Files</div>
        </div>
      </div>

      {topFiles.length > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-sm font-semibold text-slate-700 mb-4">Most Active Files</h4>
          <div className="space-y-3">
            {topFiles.slice(0, 5).map((file, index) => (
              <div key={file.fullPath} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center min-w-0 flex-1">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-700 mr-3 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-sm text-slate-900 truncate" title={file.fullPath}>
                      {file.file}
                    </div>
                    <div className="text-xs text-slate-500">
                      {file.commits} commit{file.commits !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <div className="text-sm font-medium text-slate-900">{file.total.toLocaleString()} changes</div>
                  <div className="text-xs text-slate-500">
                    <span className="text-emerald-600">+{file.additions}</span>{" "}
                    <span className="text-red-600">-{file.deletions}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CodeChurnChart
