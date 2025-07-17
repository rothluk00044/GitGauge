import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const ContributorChart = ({ data }) => {
  if (!data || !data.top || data.top.length === 0) {
    return <div className="text-gray-500 text-center py-8">No contributor data available</div>
  }

  const topContributors = data.top.slice(0, 8)

  const chartData = {
    labels: topContributors.map((contributor) => contributor.login),
    datasets: [
      {
        label: "Contributions",
        data: topContributors.map((contributor) => contributor.contributions),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgb(59, 130, 246)",
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
      x: {
        ticks: {
          maxRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Contributions",
        },
      },
    },
  }

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  )
}

export default ContributorChart
