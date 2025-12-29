import { useState, useEffect } from 'react'
import { apiService } from '../../services/apiService'
import AnaliseSaida from '../../components/AnaliseSaida/AnaliseSaida'
import HistoricoAnalises from '../../components/HistoricoAnalises/HistoricoAnalises'
import './PosVenda.scss'

interface Proposta {
  id: string
  cliente: string
  produto?: string
  marca?: string
  valor: number
  status: string
  dataCriacao: string
  dataVencimento: string
  quantidade?: number
  quantidadeAdquirida?: number
  valorUnitario?: number
}

const PosVenda = () => {
  const [propostas, setPropostas] = useState<Proposta[]>([])
  const [loading, setLoading] = useState(true)
  const [propostaSelecionada, setPropostaSelecionada] = useState<Proposta | null>(null)
  const [mostrarAnalise, setMostrarAnalise] = useState(false)
  const [mostrarHistorico, setMostrarHistorico] = useState(false)
  const [propostaHistorico, setPropostaHistorico] = useState<Proposta | null>(null)

  useEffect(() => {
    carregarPropostasAprovadas()
  }, [])

  const carregarPropostasAprovadas = async () => {
    try {
      setLoading(true)
      const todasPropostas = await apiService.getPropostas()
      // Filtrar apenas propostas aprovadas
      const aprovadas = todasPropostas.filter(
        (p: Proposta) => p.status === 'aprovada' || p.status === 'aprovado'
      )
      setPropostas(aprovadas)
    } catch (error) {
      console.error('Erro ao carregar propostas aprovadas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelecionarProposta = (proposta: Proposta) => {
    setPropostaSelecionada(proposta)
    setMostrarAnalise(true)
  }

  const handleFecharAnalise = () => {
    setMostrarAnalise(false)
    setPropostaSelecionada(null)
    // Recarregar propostas para atualizar se necessário
    carregarPropostasAprovadas()
  }

  const handleVerHistorico = (proposta: Proposta) => {
    setPropostaHistorico(proposta)
    setMostrarHistorico(true)
  }

  const handleFecharHistorico = () => {
    setMostrarHistorico(false)
    setPropostaHistorico(null)
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Carregando propostas aprovadas...</div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Pós-Venda</h1>
        <p className="page-subtitle">
          Analise a saída de produtos em propostas aprovadas e obtenha insights com IA
        </p>
      </div>

      {propostas.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="empty-state-icon">📦</span>
            <h3>Nenhuma proposta aprovada encontrada</h3>
            <p>
              Quando uma proposta for aprovada, ela aparecerá aqui para análise de pós-venda.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Propostas Aprovadas</h3>
              <span className="badge badge-success">{propostas.length}</span>
            </div>
            <div className="propostas-aprovadas-list">
              {propostas.map((proposta) => (
                <div key={proposta.id} className="proposta-aprovada-card">
                  <div className="proposta-aprovada-info">
                    <h4>{proposta.cliente}</h4>
                    {proposta.produto && (
                      <p className="proposta-aprovada-produto">
                        <strong>Produto:</strong> {proposta.produto}
                        {proposta.marca && ` - ${proposta.marca}`}
                      </p>
                    )}
                    <div className="proposta-aprovada-compra">
                      <div className="compra-item">
                        <span className="compra-label">Quantidade Adquirida:</span>
                        <span className={`compra-value ${!(proposta.quantidadeAdquirida ?? proposta.quantidade) ? 'nao-informado' : ''}`}>
                          {(proposta.quantidadeAdquirida ?? proposta.quantidade)
                            ? `${(proposta.quantidadeAdquirida ?? proposta.quantidade)!.toLocaleString('pt-BR')} unidades`
                            : 'Não informado'}
                        </span>
                      </div>
                      <div className="compra-item">
                        <span className="compra-label">Valor Unitário:</span>
                        <span className={`compra-value ${!proposta.valorUnitario ? 'nao-informado' : ''}`}>
                          {proposta.valorUnitario
                            ? `R$ ${proposta.valorUnitario.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}`
                            : 'Não informado'}
                        </span>
                      </div>
                    </div>
                    <div className="proposta-aprovada-meta">
                      <span>
                        <strong>Valor Proposta:</strong> R${' '}
                        {proposta.valor.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                      <span>
                        <strong>Data:</strong>{' '}
                        {new Date(proposta.dataCriacao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="proposta-aprovada-actions">
                    <button
                      className="btn btn-outline"
                      onClick={() => handleVerHistorico(proposta)}
                    >
                      📊 Histórico
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSelecionarProposta(proposta)}
                    >
                      🔍 Analisar Saída
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {mostrarAnalise && propostaSelecionada && (
            <AnaliseSaida
              proposta={propostaSelecionada}
              onClose={handleFecharAnalise}
            />
          )}

          {mostrarHistorico && propostaHistorico && (
            <HistoricoAnalises
              proposta={propostaHistorico}
              onClose={handleFecharHistorico}
            />
          )}
        </>
      )}
    </div>
  )
}

export default PosVenda

