import './PropostaList.scss'

interface Proposta {
  id: string
  cliente: string
  valor: number
  status: string
  dataCriacao: string
  dataVencimento: string
  descricao?: string
  observacoes?: string
}

interface PropostaListProps {
  propostas: Proposta[]
  loading: boolean
  onEdit: (proposta: Proposta) => void
  onRefresh: () => void
}

const PropostaList = ({ propostas, loading, onEdit, onRefresh }: PropostaListProps) => {
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      pendente: { label: 'Pendente', class: 'warning' },
      aprovada: { label: 'Aprovada', class: 'success' },
      rejeitada: { label: 'Rejeitada', class: 'error' },
      enviada: { label: 'Enviada', class: 'info' }
    }
    return statusMap[status] || { label: status, class: 'info' }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
    return (
      <div className="card">
        <div className="proposta-list-loading">Carregando propostas...</div>
      </div>
    )
  }

  if (propostas.length === 0) {
    return (
      <div className="card">
        <div className="proposta-list-empty">
          <p>Nenhuma proposta encontrada</p>
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
        <h3 className="card-title">Lista de Propostas</h3>
        <button className="btn btn-secondary" onClick={onRefresh}>
          Atualizar
        </button>
      </div>
      <div className="proposta-list">
        <table className="proposta-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Data Criação</th>
              <th>Vencimento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {propostas.map((proposta) => {
              const status = getStatusBadge(proposta.status)
              return (
                <tr key={proposta.id}>
                  <td>{proposta.cliente}</td>
                  <td>
                    <span className="proposta-descricao" title={proposta.descricao || ''}>
                      {proposta.descricao || '-'}
                    </span>
                  </td>
                  <td>{formatCurrency(proposta.valor)}</td>
                  <td>
                    <span className={`badge badge-${status.class}`}>
                      {status.label}
                    </span>
                  </td>
                  <td>{formatDate(proposta.dataCriacao)}</td>
                  <td>{formatDate(proposta.dataVencimento)}</td>
                  <td>
                    <button
                      className="btn btn-outline"
                      onClick={() => onEdit(proposta)}
                      style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PropostaList

