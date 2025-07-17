import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Doughnut } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend)

const IssueChart = ({ data }) => {
  if (!data) {
    return <div className="text-gray-500 text-center py-8">No issue data available</div>
  }

  const chartData = {
    labels: ["Open Issues", "Closed Issues"],
    datasets: [
      {
        data: [data.open || 0, data.closed || 0],
        backgroundColor: ["rgba(239, 68, 68, 0.8)", "rgba(34, 197, 94, 0.8)"],
        borderColor: ["rgb(239, 68, 68)", "rgb(34, 197, 94)"],
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
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

  return (
    <div>
      <div className="h-48 mb-4">
        <Doughnut data={chartData} options={options} />
      </div>
      <div className="text-center">
        <div className="font-semibold text-gray-900">{data.closeRate || 0}%</div>
        <div className="text-gray-600">Close Rate</div>
      </div>
    </div>
  )
}

export default IssueChart
