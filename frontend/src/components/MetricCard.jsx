const MetricCard = ({ title, value, subtitle, icon, trend }) => {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      {trend && (
        <div className="mt-2 flex items-center text-sm">
          <span className={`${trend > 0 ? "text-green-600" : "text-red-600"}`}>
            {trend > 0 ? "↗" : "↘"} {Math.abs(trend)}%
          </span>
          <span className="text-gray-500 ml-1">vs last period</span>
        </div>
      )}
    </div>
  )
}

export default MetricCard
