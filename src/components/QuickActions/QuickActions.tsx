import { useNavigate } from 'react-router-dom'
import './QuickActions.scss'

const QuickActions = () => {
  const navigate = useNavigate()

  const actions = [
    {
      label: 'Nova Proposta',
      icon: '📝',
      action: () => navigate('/propostas?new=true'),
      color: 'primary'
    },
    {
      label: 'Simular Retorno',
      icon: '🔄',
      action: () => navigate('/simular-retorno'),
      color: 'success'
    },
    {
      label: 'Agendar Visita',
      icon: '📍',
      action: () => navigate('/visitas?new=true'),
      color: 'secondary'
    },
    {
      label: 'Análise Rápida',
      icon: '📊',
      action: () => navigate('/analises'),
      color: 'success'
    },
    {
      label: 'Configurações',
      icon: '⚙️',
      action: () => navigate('/configuracoes'),
      color: 'info'
    }
  ]

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Ações Rápidas</h3>
      </div>
      <div className="quick-actions">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`quick-action-btn quick-action-btn-${action.color}`}
            onClick={action.action}
          >
            <span className="quick-action-icon">{action.icon}</span>
            <span className="quick-action-label">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickActions

