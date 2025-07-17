import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const ContributorChart = ({ data }) => {
  if (!data || !data.top || data.top.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 rounded-xl">
        <div className="text-center">
          <div className="text-slate-400 mb-2">No contributor data available</div>
          <div className="text-sm text-slate-500">Repository may not have contributor information</div>
        </div>
      </div>
    )
  }

  const topContributors = data.top.slice(0, 8)

  const chartData = {
    labels: topContributors.map((contributor) =>
      contributor.login.length > 12 ? contributor.login.substring(0, 12) + "..." : contributor.login,
    ),
    datasets: [
      {
        label: "Contributions",
        data: topContributors.map((contributor) => contributor.contributions),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgb(59, 130, 246)",
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
        displayColors: false,
        callbacks: {
          title: (context) => {
            const contributor = topContributors[context[0].dataIndex]
            return contributor.login
          },
          label: (context) => {
            const contributor = topContributors[context.dataIndex]
            return [`Contributions: ${contributor.contributions}`, `Percentage: ${contributor.percentage}%`]
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
            size: 11,
          },
          maxRotation: 45,
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

  const busFactor = data.busFactor || 0
  const totalContributors = data.total || 0

  return (
    <div className="space-y-4">
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">{totalContributors}</div>
          <div className="text-sm text-slate-600">Total Contributors</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">{busFactor}</div>
          <div className="text-sm text-slate-600">Bus Factor</div>
          <div
            className={`mt-1 text-xs px-2 py-1 rounded-full inline-block ${
              busFactor >= 5
                ? "bg-emerald-100 text-emerald-700"
                : busFactor >= 3
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {busFactor >= 5 ? "Healthy" : busFactor >= 3 ? "Moderate" : "Risk"}
          </div>
        </div>
      </div>
      {topContributors.length > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Top Contributors</h4>
          <div className="space-y-2">
            {topContributors.slice(0, 5).map((contributor, index) => (
              <div key={contributor.login} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-700 mr-3">
                    {index + 1}
                  </div>
                  <span className="font-medium text-slate-900">{contributor.login}</span>
                </div>
                <div className="text-slate-600">
                  {contributor.contributions} ({contributor.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ContributorChart
