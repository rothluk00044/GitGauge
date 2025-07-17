import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const CommitChart = ({ data }) => {
  if (!data || !data.byMonth) {
    return <div className="text-gray-500 text-center py-8">No commit data available</div>
  }

  const months = Object.keys(data.byMonth).sort()
  const commitCounts = months.map((month) => data.byMonth[month])

  const chartData = {
    labels: months.map((month) => {
      const date = new Date(month + "-01")
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    }),
    datasets: [
      {
        label: "Commits",
        data: commitCounts,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.1,
        fill: true,
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
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Month",
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Number of Commits",
        },
        beginAtZero: true,
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  }

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  )
}

export default CommitChart
