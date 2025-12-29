import { useState, useEffect } from 'react'
import { apiService } from '../../services/apiService'
import './HistoricoAnalises.scss'

interface Proposta {
  id: string
  cliente: string
  produto?: string
  marca?: string
}

interface Analise {
  id: string
  propostaId: string
  dataAnalise: string
  quantidadeVendida: number
  periodoAnalise: string
  statusSaida: 'boa' | 'regular' | 'ruim'
  analise: string
  pontosPositivos: string[]
  pontosNegativos: string[]
  recomendacoes: string[]
  acoesSugeridas: {
    acao: string
    prioridade: 'alta' | 'media' | 'baixa'
    prazo: string
  }[]
  observacoes?: string
  posicionamento?: string
  concorrencia?: string
  precoAtual?: number
}

interface HistoricoAnalisesProps {
  proposta: Proposta
  onClose: () => void
}

const HistoricoAnalises = ({ proposta, onClose }: HistoricoAnalisesProps) => {
  const [analises, setAnalises] = useState<Analise[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    carregarHistorico()
  }, [proposta.id])

  const carregarHistorico = async () => {
    try {
      setLoading(true)
      setErro(null)
      const historico = await apiService.getHistoricoAnalises(proposta.id)
      setAnalises(historico)
    } catch (error: any) {
      console.error('Erro ao carregar histórico:', error)
      let errorMessage = 'Erro ao carregar histórico de análises.'
      
      if (error.response?.status === 404) {
        errorMessage = 'Endpoint não encontrado. O backend precisa implementar GET /api/pos-venda/historico/:propostaId'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setErro(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'boa':
        return '#10b981' // success
      case 'regular':
        return '#f59e0b' // warning
      case 'ruim':
        return '#ef4444' // error
      default:
        return '#3b82f6' // info
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'boa':
        return 'Boa Saída'
      case 'regular':
        return 'Saída Regular'
      case 'ruim':
        return 'Baixa Saída'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="historico-analises-modal">
      <div className="historico-analises-overlay" onClick={onClose} />
      <div className="historico-analises-content">
        <div className="historico-analises-header">
          <div>
            <h2>Histórico de Análises</h2>
            <p className="historico-analises-subtitle">
              {proposta.cliente} - {proposta.produto || 'Produto'}
              {proposta.marca && ` (${proposta.marca})`}
            </p>
          </div>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="historico-analises-body">
          {loading ? (
            <div className="loading-state">
              <span>Carregando histórico...</span>
            </div>
          ) : erro ? (
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              <p>{erro}</p>
            </div>
          ) : analises.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📊</span>
              <h3>Nenhuma análise encontrada</h3>
              <p>Realize a primeira análise desta proposta para começar o histórico.</p>
            </div>
          ) : (
            <div className="analises-list">
              {analises.map((analise, index) => (
                <div key={analise.id || index} className="analise-item">
                  <div className="analise-header">
                    <div className="analise-meta">
                      <span className="analise-date">
                        📅 {formatDate(analise.dataAnalise)}
                      </span>
                      <span className="analise-periodo">
                        Período: {analise.periodoAnalise}
                      </span>
                      {analise.quantidadeVendida && (
                        <span className="analise-quantidade">
                          Quantidade: {analise.quantidadeVendida} unidades
                        </span>
                      )}
                    </div>
                    <div 
                      className="status-badge" 
                      style={{ 
                        backgroundColor: getStatusColor(analise.statusSaida) + '20', 
                        color: getStatusColor(analise.statusSaida) 
                      }}
                    >
                      {getStatusLabel(analise.statusSaida)}
                    </div>
                  </div>

                  <div className="analise-content">
                    <div className="analise-secao">
                      <h4>Análise Geral</h4>
                      <p className="analise-texto">{analise.analise}</p>
                    </div>

                    {analise.pontosPositivos && analise.pontosPositivos.length > 0 && (
                      <div className="analise-secao">
                        <h4>✅ Pontos Positivos</h4>
                        <ul className="analise-lista">
                          {analise.pontosPositivos.map((ponto, idx) => (
                            <li key={idx}>{ponto}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analise.pontosNegativos && analise.pontosNegativos.length > 0 && (
                      <div className="analise-secao">
                        <h4>⚠️ Pontos de Atenção</h4>
                        <ul className="analise-lista">
                          {analise.pontosNegativos.map((ponto, idx) => (
                            <li key={idx}>{ponto}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analise.recomendacoes && analise.recomendacoes.length > 0 && (
                      <div className="analise-secao">
                        <h4>💡 Recomendações</h4>
                        <ul className="analise-lista">
                          {analise.recomendacoes.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analise.acoesSugeridas && analise.acoesSugeridas.length > 0 && (
                      <div className="analise-secao">
                        <h4>🎯 Ações Sugeridas</h4>
                        <div className="acoes-list">
                          {analise.acoesSugeridas.map((acao, idx) => (
                            <div key={idx} className="acao-item">
                              <div className="acao-header">
                                <span className="acao-texto">{acao.acao}</span>
                                <span className={`acao-prioridade prioridade-${acao.prioridade}`}>
                                  {acao.prioridade.toUpperCase()}
                                </span>
                              </div>
                              <span className="acao-prazo">Prazo: {acao.prazo}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(analise.observacoes || analise.posicionamento || analise.concorrencia || analise.precoAtual) && (
                      <div className="analise-secao analise-dados-adicionais">
                        <h4>📋 Dados da Análise</h4>
                        <div className="dados-grid">
                          {analise.precoAtual && (
                            <div className="dado-item">
                              <strong>Preço Atual:</strong> R$ {analise.precoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          )}
                          {analise.posicionamento && (
                            <div className="dado-item">
                              <strong>Posicionamento:</strong> {analise.posicionamento}
                            </div>
                          )}
                          {analise.concorrencia && (
                            <div className="dado-item">
                              <strong>Concorrência:</strong> {analise.concorrencia}
                            </div>
                          )}
                          {analise.observacoes && (
                            <div className="dado-item full-width">
                              <strong>Observações:</strong> {analise.observacoes}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="historico-analises-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default HistoricoAnalises

