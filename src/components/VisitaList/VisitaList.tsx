import './VisitaList.scss'

interface Visita {
  id: string
  cliente: string
  data: string
  status: string
  observacoes: string
}

interface VisitaListProps {
  visitas: Visita[]
  loading: boolean
  onRefresh: () => void
}

const VisitaList = ({ visitas, loading, onRefresh }: VisitaListProps) => {
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      agendada: { label: 'Agendada', class: 'info' },
      realizada: { label: 'Realizada', class: 'success' },
      cancelada: { label: 'Cancelada', class: 'error' },
      reagendada: { label: 'Reagendada', class: 'warning' }
    }
    return statusMap[status] || { label: status, class: 'info' }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="card">
        <div className="visita-list-loading">Carregando visitas...</div>
      </div>
    )
  }

  if (visitas.length === 0) {
    return (
      <div className="card">
        <div className="visita-list-empty">
          <p>Nenhuma visita agendada</p>
          <button className="btn btn-primary" onClick={onRefresh}>
            Atualizar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Visitas Agendadas</h3>
        <button className="btn btn-secondary" onClick={onRefresh}>
          Atualizar
        </button>
      </div>
      <div className="visita-list">
        {visitas.map((visita) => {
          const status = getStatusBadge(visita.status)
          return (
            <div key={visita.id} className="visita-item">
              <div className="visita-item-main">
                <div className="visita-item-header">
                  <h4 className="visita-item-cliente">{visita.cliente}</h4>
                  <span className={`badge badge-${status.class}`}>
                    {status.label}
                  </span>
                </div>
                <div className="visita-item-date">
                  📅 {formatDate(visita.data)}
                </div>
                {visita.observacoes && (
                  <p className="visita-item-observacoes">{visita.observacoes}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default VisitaList

