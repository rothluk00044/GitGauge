import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const PullRequestChart = ({ data }) => {
  if (!data) {
    return <div className="text-gray-500 text-center py-8">No pull request data available</div>
  }

  const chartData = {
    labels: ["Open", "Closed", "Merged"],
    datasets: [
      {
        label: "Pull Requests",
        data: [data.open || 0, data.closed || 0, data.merged || 0],
        backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(239, 68, 68, 0.8)", "rgba(168, 85, 247, 0.8)"],
        borderColor: ["rgb(34, 197, 94)", "rgb(239, 68, 68)", "rgb(168, 85, 247)"],
        borderWidth: 1,
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
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of PRs",
        },
      },
    },
  }

  return (
    <div>
      <div className="h-48 mb-4">
        <Bar data={chartData} options={options} />
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <div className="font-semibold text-gray-900">{data.mergeRate || 0}%</div>
          <div className="text-gray-600">Merge Rate</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">{data.averageReviewTime || 0}h</div>
          <div className="text-gray-600">Avg Review Time</div>
        </div>
      </div>
    </div>
  )
}

export default PullRequestChart
