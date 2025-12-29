import { useState } from 'react'
import PropostaTimeline from '../PropostaTimeline/PropostaTimeline'
import './PropostaDetail.scss'

interface Checkpoint {
  id: string
  status: string
  label: string
  descricao?: string
  data: string
  usuario?: string
}

interface Proposta {
  id: string
  cliente: string
  valor: number
  status: string
  dataCriacao: string
  dataVencimento: string
  descricao?: string
  observacoes?: string
  checkpoints?: Checkpoint[]
  // Novos campos
  produto?: string
  marca?: string
  categoria?: string
  unidadeMedida?: string
  valorUnitario?: number
  quantidade?: number
  desconto?: number
  descontoTipo?: 'percentual' | 'valor'
  condicoesPagamento?: string
  prazoEntrega?: string
  estrategiaRepresentacao?: string
  publicoAlvo?: string
  diferenciaisCompetitivos?: string
}

interface PropostaDetailProps {
  proposta: Proposta
  onClose: () => void
  onEdit: () => void
  onUpdateStatus?: (status: string, descricao?: string) => void
}

const PropostaDetail = ({ proposta, onClose, onEdit, onUpdateStatus }: PropostaDetailProps) => {
  const [showStatusForm, setShowStatusForm] = useState(false)
  const [novoStatus, setNovoStatus] = useState('')
  const [descricaoStatus, setDescricaoStatus] = useState('')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusOptions = () => {
    return [
      { value: 'rascunho', label: 'Rascunho' },
      { value: 'pendente', label: 'Pendente' },
      { value: 'enviada', label: 'Enviada' },
      { value: 'em_analise_gerente_compras', label: 'Em Análise - Gerente de Compras' },
      { value: 'em_analise_diretoria', label: 'Em Análise - Diretoria' },
      { value: 'aprovada', label: 'Aprovada' },
      { value: 'rejeitada', label: 'Rejeitada' },
      { value: 'cancelada', label: 'Cancelada' }
    ].filter(option => option.value !== proposta.status) // Remove o status atual da lista
  }

  const handleUpdateStatus = async () => {
    if (novoStatus && onUpdateStatus) {
      try {
        await onUpdateStatus(novoStatus, descricaoStatus)
        setShowStatusForm(false)
        setNovoStatus('')
        setDescricaoStatus('')
      } catch (error: any) {
        // Erro já será tratado no componente pai
        console.error('Erro ao atualizar status:', error)
      }
    }
  }

  return (
    <div className="proposta-detail-overlay" onClick={onClose}>
      <div className="proposta-detail" onClick={(e) => e.stopPropagation()}>
        <div className="proposta-detail-header">
          <h3>Detalhes da Proposta</h3>
          <button className="proposta-detail-close" onClick={onClose}>×</button>
        </div>

        <div className="proposta-detail-content">
          {/* Informações Básicas */}
          <div className="proposta-detail-section">
            <h4>Informações Básicas</h4>
            <div className="proposta-detail-info">
              <div className="proposta-detail-field">
                <label>Cliente</label>
                <span>{proposta.cliente}</span>
              </div>
              <div className="proposta-detail-field">
                <label>Status Atual</label>
                <span className={`badge badge-${
                  proposta.status === 'aprovada' ? 'success' : 
                  proposta.status === 'rejeitada' || proposta.status === 'cancelada' ? 'error' : 
                  proposta.status === 'pendente' ? 'warning' : 
                  'info'
                }`}>
                  {proposta.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              <div className="proposta-detail-field">
                <label>Data de Criação</label>
                <span>{formatDate(proposta.dataCriacao)}</span>
              </div>
              <div className="proposta-detail-field">
                <label>Data de Vencimento</label>
                <span>{formatDate(proposta.dataVencimento)}</span>
              </div>
            </div>
          </div>

          {/* Informações do Produto */}
          {(proposta.produto || proposta.marca || proposta.categoria) && (
            <div className="proposta-detail-section">
              <h4>Informações do Produto</h4>
              <div className="proposta-detail-info">
                {proposta.produto && (
                  <div className="proposta-detail-field">
                    <label>Produto</label>
                    <span>{proposta.produto}</span>
                  </div>
                )}
                {proposta.marca && (
                  <div className="proposta-detail-field">
                    <label>Marca</label>
                    <span>{proposta.marca}</span>
                  </div>
                )}
                {proposta.categoria && (
                  <div className="proposta-detail-field">
                    <label>Categoria</label>
                    <span>{proposta.categoria}</span>
                  </div>
                )}
                {proposta.unidadeMedida && (
                  <div className="proposta-detail-field">
                    <label>Unidade de Medida</label>
                    <span>{proposta.unidadeMedida}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Valores e Quantidades */}
          {(proposta.valorUnitario || proposta.quantidade || proposta.desconto) && (
            <div className="proposta-detail-section">
              <h4>Valores e Quantidades</h4>
              <div className="proposta-detail-info">
                {proposta.valorUnitario && (
                  <div className="proposta-detail-field">
                    <label>Valor Unitário</label>
                    <span>{formatCurrency(proposta.valorUnitario)}</span>
                  </div>
                )}
                {proposta.quantidade && (
                  <div className="proposta-detail-field">
                    <label>Quantidade</label>
                    <span>{proposta.quantidade} {proposta.unidadeMedida || ''}</span>
                  </div>
                )}
                {proposta.desconto && (
                  <div className="proposta-detail-field">
                    <label>Desconto</label>
                    <span>
                      {proposta.descontoTipo === 'percentual' 
                        ? `${proposta.desconto}%` 
                        : formatCurrency(proposta.desconto)}
                    </span>
                  </div>
                )}
                <div className="proposta-detail-field">
                  <label>Valor Total</label>
                  <span className="proposta-detail-valor">{formatCurrency(proposta.valor)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Condições Comerciais */}
          {(proposta.condicoesPagamento || proposta.prazoEntrega) && (
            <div className="proposta-detail-section">
              <h4>Condições Comerciais</h4>
              <div className="proposta-detail-info">
                {proposta.condicoesPagamento && (
                  <div className="proposta-detail-field">
                    <label>Condições de Pagamento</label>
                    <span>{proposta.condicoesPagamento}</span>
                  </div>
                )}
                {proposta.prazoEntrega && (
                  <div className="proposta-detail-field">
                    <label>Prazo de Entrega</label>
                    <span>{proposta.prazoEntrega}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Estratégia de Representação */}
          {(proposta.estrategiaRepresentacao || proposta.publicoAlvo || proposta.diferenciaisCompetitivos) && (
            <div className="proposta-detail-section">
              <h4>Estratégia de Representação</h4>
              {proposta.estrategiaRepresentacao && (
                <div className="proposta-detail-field-full">
                  <label>Estratégia</label>
                  <p>{proposta.estrategiaRepresentacao}</p>
                </div>
              )}
              {proposta.publicoAlvo && (
                <div className="proposta-detail-field-full">
                  <label>Público-Alvo</label>
                  <p>{proposta.publicoAlvo}</p>
                </div>
              )}
              {proposta.diferenciaisCompetitivos && (
                <div className="proposta-detail-field-full">
                  <label>Diferenciais Competitivos</label>
                  <p>{proposta.diferenciaisCompetitivos}</p>
                </div>
              )}
            </div>
          )}

          {/* Descrição e Observações */}
          {proposta.descricao && (
            <div className="proposta-detail-section">
              <h4>Descrição Geral</h4>
              <p>{proposta.descricao}</p>
            </div>
          )}

          {proposta.observacoes && (
            <div className="proposta-detail-section">
              <h4>Observações</h4>
              <p>{proposta.observacoes}</p>
            </div>
          )}

          {proposta.checkpoints && proposta.checkpoints.length > 0 && (
            <div className="proposta-detail-section">
              <PropostaTimeline 
                checkpoints={proposta.checkpoints} 
                statusAtual={proposta.status}
              />
            </div>
          )}

          {onUpdateStatus && (
            <div className="proposta-detail-section">
              {!showStatusForm ? (
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowStatusForm(true)}
                >
                  Atualizar Status
                </button>
              ) : (
                <div className="proposta-detail-status-form">
                  <h4>Atualizar Status</h4>
                  <div className="proposta-detail-info-box">
                    <strong>Status Atual:</strong> {proposta.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="proposta-detail-form-group">
                    <label>Novo Status *</label>
                    <select
                      className="input"
                      value={novoStatus}
                      onChange={(e) => setNovoStatus(e.target.value)}
                    >
                      <option value="">Selecione o novo status...</option>
                      {getStatusOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="proposta-detail-form-group">
                    <label>Descrição do Checkpoint (opcional)</label>
                    <textarea
                      className="textarea"
                      value={descricaoStatus}
                      onChange={(e) => setDescricaoStatus(e.target.value)}
                      placeholder="Ex: Em análise com o gerente de compras, aguardando aprovação..."
                      rows={3}
                    />
                  </div>
                  <div className="proposta-detail-form-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowStatusForm(false)
                        setNovoStatus('')
                        setDescricaoStatus('')
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleUpdateStatus}
                      disabled={!novoStatus}
                    >
                      Salvar Status
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="proposta-detail-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Fechar
          </button>
          <button className="btn btn-primary" onClick={onEdit}>
            Editar Proposta
          </button>
        </div>
      </div>
    </div>
  )
}

export default PropostaDetail

