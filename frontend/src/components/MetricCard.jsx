import { TrendingUp, TrendingDown, Minus } from "lucide-react"

const MetricCard = ({ title, value, subtitle, icon, trend }) => {
  const getTrendIcon = () => {
    switch (trend) {
      case "positive":
        return <TrendingUp className="h-4 w-4 text-emerald-600" />
      case "negative":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-slate-400" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case "positive":
        return "text-emerald-600"
      case "negative":
        return "text-red-600"
      default:
        return "text-slate-500"
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-slate-100 p-2 rounded-lg">{icon}</div>
        {trend && <div className={`flex items-center ${getTrendColor()}`}>{getTrendIcon()}</div>}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
  )
}

export default MetricCard
