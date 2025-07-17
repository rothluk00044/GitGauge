import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const CodeChurnChart = ({ data }) => {
  if (!data) {
    return <div className="text-gray-500 text-center py-8">No code churn data available</div>
  }

  const chartData = {
    labels: ["Lines Added", "Lines Deleted"],
    datasets: [
      {
        label: "Lines of Code",
        data: [data.totalAdditions || 0, data.totalDeletions || 0],
        backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(239, 68, 68, 0.8)"],
        borderColor: ["rgb(34, 197, 94)", "rgb(239, 68, 68)"],
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
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Lines of Code",
        },
      },
    },
  }

  return (
    <div>
      <div className="h-48 mb-4">
        <Bar data={chartData} options={options} />
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="font-semibold text-gray-900">{data.netChange || 0}</div>
          <div className="text-gray-600">Net Change</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">{data.churnRate || 0}</div>
          <div className="text-gray-600">Churn Rate</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">{data.topChurnedFiles?.length || 0}</div>
          <div className="text-gray-600">Active Files</div>
        </div>
      </div>
    </div>
  )
}

export default CodeChurnChart
