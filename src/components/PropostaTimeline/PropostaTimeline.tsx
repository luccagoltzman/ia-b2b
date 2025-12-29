import './PropostaTimeline.scss'

interface Checkpoint {
  id: string
  status: string
  label: string
  descricao?: string
  data: string
  usuario?: string
}

interface PropostaTimelineProps {
  checkpoints: Checkpoint[]
  statusAtual: string
}

const PropostaTimeline = ({ checkpoints, statusAtual }: PropostaTimelineProps) => {
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; class: string; icon: string }> = {
      rascunho: { label: 'Rascunho', class: 'muted', icon: '📝' },
      pendente: { label: 'Pendente', class: 'warning', icon: '⏳' },
      enviada: { label: 'Enviada', class: 'info', icon: '📤' },
      em_analise_gerente_compras: { label: 'Em Análise - Gerente de Compras', class: 'info', icon: '👔' },
      em_analise_diretoria: { label: 'Em Análise - Diretoria', class: 'info', icon: '🏢' },
      aprovada: { label: 'Aprovada', class: 'success', icon: '✅' },
      rejeitada: { label: 'Rejeitada', class: 'error', icon: '❌' },
      cancelada: { label: 'Cancelada', class: 'muted', icon: '🚫' }
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
    <div className="proposta-timeline">
      <h4 className="proposta-timeline-title">Histórico de Status</h4>
      <div className="proposta-timeline-list">
        {sortedCheckpoints.map((checkpoint, index) => {
          const statusInfo = getStatusInfo(checkpoint.status)
          const isAtual = checkpoint.status === statusAtual
          const isUltimo = index === 0

          return (
            <div
              key={checkpoint.id}
              className={`proposta-timeline-item ${isAtual ? 'atual' : ''} ${isUltimo ? 'ultimo' : ''}`}
            >
              <div className="proposta-timeline-marker">
                <span className="proposta-timeline-icon">{statusInfo.icon}</span>
                {!isUltimo && <div className="proposta-timeline-line"></div>}
              </div>
              <div className="proposta-timeline-content">
                <div className="proposta-timeline-header">
                  <span className={`badge badge-${statusInfo.class}`}>
                    {statusInfo.label}
                  </span>
                  <span className="proposta-timeline-date">{formatDate(checkpoint.data)}</span>
                </div>
                {checkpoint.descricao && (
                  <p className="proposta-timeline-descricao">{checkpoint.descricao}</p>
                )}
                {checkpoint.usuario && (
                  <span className="proposta-timeline-usuario">Por: {checkpoint.usuario}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PropostaTimeline

