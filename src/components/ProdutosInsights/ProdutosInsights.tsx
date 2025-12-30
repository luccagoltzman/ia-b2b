import { useEffect, useState } from 'react'
import { apiService } from '../../services/apiService'
import './ProdutosInsights.scss'

interface ProdutoInsight {
  produto: string
  marca?: string
  totalPropostas: number
  propostasAprovadas: number
  taxaAprovacao: number
  valorTotal: number
  valorMedio: number
}

interface ProdutosInsightsProps {
  onAnalisarProduto?: (produto: string) => void
}

const ProdutosInsights = ({ onAnalisarProduto }: ProdutosInsightsProps) => {
  const [insights, setInsights] = useState<ProdutoInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true)
        const data = await apiService.getProdutosInsights()
        setInsights(data)
      } catch (error: any) {
        console.error('Erro ao carregar insights de produtos:', error)
        setError('Erro ao carregar insights. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [])

  if (loading) {
    return (
      <div className="produtos-insights">
        <div className="insights-header">
          <h3>Produtos Mais Lucrativos</h3>
          <p className="text-secondary">Análise de performance por produto</p>
        </div>
        <div className="loading-state">Carregando insights...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="produtos-insights">
        <div className="insights-header">
          <h3>Produtos Mais Lucrativos</h3>
          <p className="text-secondary">Análise de performance por produto</p>
        </div>
        <div className="error-state">{error}</div>
      </div>
    )
  }

  if (insights.length === 0) {
    return (
      <div className="produtos-insights">
        <div className="insights-header">
          <h3>Produtos Mais Lucrativos</h3>
          <p className="text-secondary">Análise de performance por produto</p>
        </div>
        <div className="empty-state">
          <p>Nenhum dado disponível para análise</p>
        </div>
      </div>
    )
  }

  // Ordenar por taxa de aprovação e valor total
  const sortedInsights = [...insights].sort((a, b) => {
    if (a.taxaAprovacao !== b.taxaAprovacao) {
      return b.taxaAprovacao - a.taxaAprovacao
    }
    return b.valorTotal - a.valorTotal
  })

  return (
    <div className="produtos-insights">
      <div className="insights-header">
        <h3>Produtos Mais Lucrativos</h3>
        <p className="text-secondary">Análise de performance por produto</p>
      </div>

      <div className="insights-list">
        {sortedInsights.map((insight, index) => (
          <div key={`${insight.produto}-${insight.marca || ''}`} className="insight-card">
            <div className="insight-rank">
              <span className="rank-number">#{index + 1}</span>
            </div>
            <div className="insight-content">
              <div className="insight-header">
                <h4 className="produto-nome">{insight.produto}</h4>
                {insight.marca && (
                  <span className="produto-marca">{insight.marca}</span>
                )}
              </div>
              <div className="insight-metrics">
                <div className="metric">
                  <span className="metric-label">Taxa de Aprovação</span>
                  <span className={`metric-value ${insight.taxaAprovacao >= 80 ? 'high' : insight.taxaAprovacao >= 50 ? 'medium' : 'low'}`}>
                    {insight.taxaAprovacao.toFixed(1)}%
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Propostas Aprovadas</span>
                  <span className="metric-value">
                    {insight.propostasAprovadas} / {insight.totalPropostas}
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Valor Total</span>
                  <span className="metric-value highlight">
                    R$ {insight.valorTotal.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Valor Médio</span>
                  <span className="metric-value">
                    R$ {insight.valorMedio.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
              </div>
              {onAnalisarProduto && (
                <button
                  className="btn-analisar"
                  onClick={() => onAnalisarProduto(insight.produto)}
                >
                  Analisar com IA
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProdutosInsights


