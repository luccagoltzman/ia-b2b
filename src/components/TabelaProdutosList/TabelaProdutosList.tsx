import { exportService } from '../../services/exportService'
import './TabelaProdutosList.scss'

interface ProdutoTabela {
  id: string
  produto: string
  produtoCodigo?: string
  marca: string
  categoria?: string
  unidadeMedida: string
  quantidade: number
  valorUnitario: number
  aliquotaIpi?: number
}

interface TabelaProdutos {
  id: string
  nome: string
  cliente?: string
  clientes?: string[]
  produtos: ProdutoTabela[]
  condicoesPagamento?: string
  prazoEntrega?: string
  observacoes?: string
  dataCriacao: string
  dataVencimento: string
  status?: string
}

interface TabelaProdutosListProps {
  tabelas: TabelaProdutos[]
  loading: boolean
  onEdit: (tabela: TabelaProdutos) => void
  onView?: (tabela: TabelaProdutos) => void
  onEnviar?: (tabela: TabelaProdutos) => void
  onGerarProposta?: (tabela: TabelaProdutos) => void
  onSimularRetorno?: (tabela: TabelaProdutos) => void
  onRefresh: () => void
}

const TabelaProdutosList = ({ 
  tabelas, 
  loading, 
  onEdit, 
  onView, 
  onEnviar,
  onGerarProposta,
  onSimularRetorno,
  onRefresh 
}: TabelaProdutosListProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusBadge = (status?: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      rascunho: { label: 'Rascunho', class: 'info' },
      enviada: { label: 'Enviada', class: 'success' },
      aguardando_resposta: { label: 'Aguardando Resposta', class: 'warning' },
      proposta_gerada: { label: 'Proposta Gerada', class: 'success' }
    }
    return statusMap[status || 'rascunho'] || { label: status || 'Rascunho', class: 'info' }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="tabela-list-loading">Carregando tabelas...</div>
      </div>
    )
  }

  if (tabelas.length === 0) {
    return (
      <div className="card">
        <div className="tabela-list-empty">
          <p>Nenhuma tabela encontrada</p>
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
        <h3 className="card-title">Tabelas de Produtos</h3>
        <div className="tabela-list-actions">
          <button className="btn btn-secondary" onClick={onRefresh}>
            Atualizar
          </button>
        </div>
      </div>
      
      {/* Versão Desktop - Tabela */}
      <div className="tabela-list tabela-list-desktop">
        <table className="tabela-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Clientes</th>
              <th>Produtos</th>
              <th>Status</th>
              <th>Data Criação</th>
              <th>Vencimento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {tabelas.map((tabela) => {
              const status = getStatusBadge(tabela.status)
              const clientesCount = tabela.clientes?.length || (tabela.cliente ? 1 : 0)
              return (
                <tr key={tabela.id}>
                  <td>
                    <strong>{tabela.nome}</strong>
                  </td>
                  <td>
                    {clientesCount} {clientesCount === 1 ? 'cliente' : 'clientes'}
                  </td>
                  <td>{tabela.produtos.length} produtos</td>
                  <td>
                    <span className={`badge badge-${status.class}`}>
                      {status.label}
                    </span>
                  </td>
                  <td>{formatDate(tabela.dataCriacao)}</td>
                  <td>{formatDate(tabela.dataVencimento)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {onView && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onView(tabela)}
                          title="Ver detalhes"
                        >
                          👁️
                        </button>
                      )}
                      {onEnviar && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => onEnviar(tabela)}
                          title="Enviar para clientes"
                        >
                          📤
                        </button>
                      )}
                      {onSimularRetorno && (tabela.status === 'enviada' || tabela.status === 'aguardando_resposta') && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => onSimularRetorno(tabela)}
                          title="Simular retorno do cliente"
                        >
                          🔄
                        </button>
                      )}
                      {onGerarProposta && tabela.status === 'aguardando_resposta' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onGerarProposta(tabela)}
                          title="Gerar proposta definitiva"
                        >
                          📝
                        </button>
                      )}
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => onEdit(tabela)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Versão Mobile - Cards */}
      <div className="tabela-list tabela-list-mobile">
        {tabelas.map((tabela) => {
          const status = getStatusBadge(tabela.status)
          const clientesCount = tabela.clientes?.length || (tabela.cliente ? 1 : 0)
          return (
            <div key={tabela.id} className="tabela-card">
              <div className="tabela-card-header">
                <div className="tabela-card-nome">{tabela.nome}</div>
                <span className={`badge badge-${status.class}`}>
                  {status.label}
                </span>
              </div>
              
              <div className="tabela-card-info">
                <div className="tabela-card-info-item">
                  <span className="tabela-card-info-label">Clientes:</span>
                  <span>{clientesCount} {clientesCount === 1 ? 'cliente' : 'clientes'}</span>
                </div>
                <div className="tabela-card-info-item">
                  <span className="tabela-card-info-label">Produtos:</span>
                  <span>{tabela.produtos.length} produtos</span>
                </div>
              </div>
              
              <div className="tabela-card-dates">
                <div className="tabela-card-date">
                  <span className="tabela-card-date-label">Criação:</span>
                  <span>{formatDate(tabela.dataCriacao)}</span>
                </div>
                <div className="tabela-card-date">
                  <span className="tabela-card-date-label">Vencimento:</span>
                  <span>{formatDate(tabela.dataVencimento)}</span>
                </div>
              </div>
              
              <div className="tabela-card-actions">
                {onView && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => onView(tabela)}
                  >
                    Ver Detalhes
                  </button>
                )}
                {onEnviar && (
                  <button
                    className="btn btn-success"
                    onClick={() => onEnviar(tabela)}
                  >
                    Enviar
                  </button>
                )}
                {onSimularRetorno && (tabela.status === 'enviada' || tabela.status === 'aguardando_resposta') && (
                  <button
                    className="btn btn-success"
                    onClick={() => onSimularRetorno(tabela)}
                  >
                    Simular Retorno
                  </button>
                )}
                {onGerarProposta && tabela.status === 'aguardando_resposta' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => onGerarProposta(tabela)}
                  >
                    Gerar Proposta
                  </button>
                )}
                <button
                  className="btn btn-outline"
                  onClick={() => onEdit(tabela)}
                >
                  Editar
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TabelaProdutosList
