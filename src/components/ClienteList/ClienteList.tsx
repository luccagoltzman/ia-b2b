import './ClienteList.scss'

export interface Cliente {
  id: string
  nome: string
  email?: string
  telefone?: string
  empresa?: string
  cnpj?: string
  cidade?: string
  estado?: string
}

interface ClienteListProps {
  clientes: Cliente[]
  loading: boolean
  onRefresh: () => void
  onEdit: (cliente: Cliente) => void
  onDelete?: (cliente: Cliente) => void
}

const ClienteList = ({ clientes, loading, onRefresh, onEdit, onDelete }: ClienteListProps) => {
  if (loading) {
    return (
      <div className="card">
        <div className="cliente-list-loading">Carregando clientes...</div>
      </div>
    )
  }

  if (clientes.length === 0) {
    return (
      <div className="card">
        <div className="cliente-list-empty">
          <p>Nenhum cliente cadastrado</p>
          <p className="text-secondary">Cadastre clientes para usar em tabelas e propostas.</p>
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
        <h3 className="card-title">Clientes cadastrados</h3>
        <button className="btn btn-secondary" onClick={onRefresh}>
          Atualizar
        </button>
      </div>
      <div className="cliente-list">
        <table className="cliente-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Empresa / CNPJ</th>
              <th>Contato</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>
                  <strong>{cliente.nome}</strong>
                  {(cliente.cidade || cliente.estado) && (
                    <div className="cliente-table-sub">{[cliente.cidade, cliente.estado].filter(Boolean).join(' - ')}</div>
                  )}
                </td>
                <td>
                  {cliente.empresa && <div>{cliente.empresa}</div>}
                  {cliente.cnpj && <div className="cliente-table-cnpj">{cliente.cnpj}</div>}
                  {!cliente.empresa && !cliente.cnpj && '—'}
                </td>
                <td>
                  {cliente.email && <div>📧 {cliente.email}</div>}
                  {cliente.telefone && <div>📱 {cliente.telefone}</div>}
                  {!cliente.email && !cliente.telefone && '—'}
                </td>
                <td>
                  <div className="cliente-list-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onEdit(cliente)}
                      title="Editar"
                    >
                      ✏️ Editar
                    </button>
                    {onDelete && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (window.confirm(`Excluir o cliente "${cliente.nome}"?`)) {
                            onDelete(cliente)
                          }
                        }}
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="cliente-list-mobile">
        {clientes.map((cliente) => (
          <div key={cliente.id} className="cliente-card">
            <div className="cliente-card-main">
              <strong className="cliente-card-nome">{cliente.nome}</strong>
              {cliente.empresa && <span className="cliente-card-empresa">{cliente.empresa}</span>}
              {cliente.cnpj && <span className="cliente-card-cnpj">CNPJ {cliente.cnpj}</span>}
              {cliente.email && <span className="cliente-card-email">📧 {cliente.email}</span>}
              {cliente.telefone && <span className="cliente-card-tel">📱 {cliente.telefone}</span>}
              {(cliente.cidade || cliente.estado) && (
                <span className="cliente-card-cidade">📍 {[cliente.cidade, cliente.estado].filter(Boolean).join(' - ')}</span>
              )}
            </div>
            <div className="cliente-card-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(cliente)}>
                Editar
              </button>
              {onDelete && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    if (window.confirm(`Excluir "${cliente.nome}"?`)) onDelete(cliente)
                  }}
                >
                  Excluir
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ClienteList
