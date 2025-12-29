import './VisitaTimeline.scss'

interface Checkpoint {
  id: string
  status: string
  label: string
  descricao?: string
  data: string
  usuario?: string
}

interface VisitaTimelineProps {
  checkpoints: Checkpoint[]
  statusAtual: string
}

const VisitaTimeline = ({ checkpoints, statusAtual }: VisitaTimelineProps) => {
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; class: string; icon: string }> = {
      agendada: { label: 'Agendada', class: 'info', icon: '📅' },
      confirmada: { label: 'Confirmada', class: 'info', icon: '✓' },
      em_andamento: { label: 'Em Andamento', class: 'warning', icon: '🔄' },
      realizada: { label: 'Realizada', class: 'success', icon: '✅' },
      cancelada: { label: 'Cancelada', class: 'error', icon: '❌' },
      reagendada: { label: 'Reagendada', class: 'warning', icon: '📆' }
    }
    return statusMap[status] || { label: status, class: 'info', icon: '📋' }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Ordena checkpoints por data (mais recente primeiro)
  const sortedCheckpoints = [...checkpoints].sort((a, b) => 
    new Date(b.data).getTime() - new Date(a.data).getTime()
  )

  return (
    <div className="visita-timeline">
      <h4 className="visita-timeline-title">Histórico de Status</h4>
      <div className="visita-timeline-list">
        {sortedCheckpoints.map((checkpoint, index) => {
          const statusInfo = getStatusInfo(checkpoint.status)
          const isAtual = checkpoint.status === statusAtual
          const isUltimo = index === 0

          return (
            <div
              key={checkpoint.id}
              className={`visita-timeline-item ${isAtual ? 'atual' : ''} ${isUltimo ? 'ultimo' : ''}`}
            >
              <div className="visita-timeline-marker">
                <span className="visita-timeline-icon">{statusInfo.icon}</span>
                {!isUltimo && <div className="visita-timeline-line"></div>}
              </div>
              <div className="visita-timeline-content">
                <div className="visita-timeline-header">
                  <span className={`badge badge-${statusInfo.class}`}>
                    {statusInfo.label}
                  </span>
                  <span className="visita-timeline-date">{formatDate(checkpoint.data)}</span>
                </div>
                {checkpoint.descricao && (
                  <p className="visita-timeline-descricao">{checkpoint.descricao}</p>
                )}
                {checkpoint.usuario && (
                  <span className="visita-timeline-usuario">Por: {checkpoint.usuario}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default VisitaTimeline

