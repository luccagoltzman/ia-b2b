import './StatCard.scss'

interface StatCardProps {
  title: string
  value: string | number
  icon: string
  trend?: string
  trendPositive?: boolean
}

const StatCard = ({ title, value, icon, trend, trendPositive }: StatCardProps) => {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-icon">{icon}</span>
        {trend && (
          <span className={`stat-card-trend ${trendPositive ? 'positive' : 'negative'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-title">{title}</div>
    </div>
  )
}

export default StatCard

