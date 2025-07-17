import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const CommitChart = ({ data }) => {
  if (!data || !data.byMonth || Object.keys(data.byMonth).length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 rounded-xl">
        <div className="text-center">
          <div className="text-slate-400 mb-2">No commit data available</div>
          <div className="text-sm text-slate-500">Repository may be empty or recently created</div>
        </div>
      </div>
    )
  }

  const months = Object.keys(data.byMonth).sort()
  const commitCounts = months.map((month) => data.byMonth[month])

  // Calculate trend
  const recentMonths = commitCounts.slice(-3)
  const earlierMonths = commitCounts.slice(-6, -3)
  const recentAvg = recentMonths.reduce((a, b) => a + b, 0) / recentMonths.length
  const earlierAvg = earlierMonths.reduce((a, b) => a + b, 0) / earlierMonths.length
  const trend = recentAvg > earlierAvg ? "increasing" : "decreasing"

  const chartData = {
    labels: months.map((month) => {
      const date = new Date(month + "-01")
      return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
    }),
    datasets: [
      {
        label: "Commits",
        data: commitCounts,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
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
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context) => {
            const monthYear = months[context[0].dataIndex]
            const date = new Date(monthYear + "-01")
            return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
          },
          label: (context) => {
            const commits = context.parsed.y
            return `${commits} commit${commits !== 1 ? "s" : ""}`
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 12,
          },
        },
      },
      y: {
        display: true,
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
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  }

  const maxCommits = Math.max(...commitCounts)
  const totalCommits = commitCounts.reduce((a, b) => a + b, 0)
  const avgCommits = (totalCommits / commitCounts.length).toFixed(1)

  return (
    <div className="space-y-4">
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">{totalCommits}</div>
          <div className="text-sm text-slate-600">Total Commits</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">{avgCommits}</div>
          <div className="text-sm text-slate-600">Monthly Average</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">{maxCommits}</div>
          <div className="text-sm text-slate-600">Peak Month</div>
        </div>
      </div>
      {trend && (
        <div className="text-center">
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              trend === "increasing" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {trend === "increasing" ? "📈 Increasing activity" : "📉 Decreasing activity"}
          </div>
        </div>
      )}
    </div>
  )
}

export default CommitChart
