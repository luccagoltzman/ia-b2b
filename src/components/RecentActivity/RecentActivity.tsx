import { useEffect, useState } from 'react'
import { apiService } from '../../services/apiService'
import './RecentActivity.scss'

interface Activity {
  id: string
  type: string
  description: string
  timestamp: string
  status: string
}

const RecentActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await apiService.getRecentActivities()
        setActivities(data)
      } catch (error) {
        console.error('Erro ao carregar atividades:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Atividades Recentes</h3>
      </div>
      <div className="recent-activity">
        {loading ? (
          <div className="recent-activity-loading">Carregando...</div>
        ) : activities.length === 0 ? (
          <div className="recent-activity-empty">Nenhuma atividade recente</div>
        ) : (
          <ul className="recent-activity-list">
            {activities.map((activity) => (
              <li key={activity.id} className="recent-activity-item">
                <div className="recent-activity-icon">
                  {activity.type === 'visita' && '📍'}
                  {activity.type === 'proposta' && '📝'}
                  {activity.type === 'analise' && '📊'}
                </div>
                <div className="recent-activity-content">
                  <p className="recent-activity-description">{activity.description}</p>
                  <span className="recent-activity-time">{activity.timestamp}</span>
                </div>
                <span className={`badge badge-${activity.status}`}>
                  {activity.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default RecentActivity

