import { useState } from 'react'
import { apiService } from '../../services/apiService'
import './AnaliseSaida.scss'

interface Proposta {
  id: string
  cliente: string
  produto?: string
  marca?: string
  valor: number
  status: string
  dataCriacao: string
  dataVencimento: string
}

interface AnaliseSaidaProps {
  proposta: Proposta
  onClose: () => void
}

interface DadosAnalise {
  quantidadeVendida?: number
  periodoAnalise?: string
  observacoes?: string
  posicionamento?: string
  concorrencia?: string
  precoAtual?: number
}

interface ResultadoAnalise {
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
}

const AnaliseSaida = ({ proposta, onClose }: AnaliseSaidaProps) => {
  const [dadosAnalise, setDadosAnalise] = useState<DadosAnalise>({
    quantidadeVendida: undefined,
    periodoAnalise: '',
    observacoes: '',
    posicionamento: '',
    concorrencia: '',
    precoAtual: undefined
  })
  const [resultado, setResultado] = useState<ResultadoAnalise | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const handleInputChange = (field: keyof DadosAnalise, value: string | number) => {
    setDadosAnalise(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAnalisar = async () => {
    // Validação básica
    if (!dadosAnalise.quantidadeVendida || !dadosAnalise.periodoAnalise) {
      alert('Por favor, preencha pelo menos a quantidade vendida e o período de análise.')
      return
    }

    setLoading(true)
    setErro(null)

    try {
      const resultadoAnalise = await apiService.analisarSaidaProduto({
        propostaId: proposta.id,
        cliente: proposta.cliente,
        produto: proposta.produto || '',
        marca: proposta.marca || '',
        quantidadeVendida: dadosAnalise.quantidadeVendida!,
        periodoAnalise: dadosAnalise.periodoAnalise,
        observacoes: dadosAnalise.observacoes || '',
        posicionamento: dadosAnalise.posicionamento || '',
        concorrencia: dadosAnalise.concorrencia || '',
        precoAtual: dadosAnalise.precoAtual
      })

      setResultado(resultadoAnalise)
      
      // Limpar formulário após análise bem-sucedida
      setDadosAnalise({
        quantidadeVendida: undefined,
        periodoAnalise: '',
        observacoes: '',
        posicionamento: '',
        concorrencia: '',
        precoAtual: undefined
      })
    } catch (error: any) {
      console.error('Erro ao analisar saída:', error)
      let errorMessage = 'Erro ao analisar saída do produto.'
      
      if (error.response?.status === 404) {
        errorMessage = 'Endpoint não encontrado. O backend precisa implementar POST /api/pos-venda/analisar-saida'
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Dados inválidos. Verifique os campos obrigatórios.'
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

  return (
    <div className="analise-saida-modal">
      <div className="analise-saida-overlay" onClick={onClose} />
      <div className="analise-saida-content">
        <div className="analise-saida-header">
          <div>
            <h2>Análise de Saída do Produto</h2>
            <p className="analise-saida-subtitle">
              {proposta.cliente} - {proposta.produto || 'Produto'}
              {proposta.marca && ` (${proposta.marca})`}
            </p>
          </div>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        {!resultado ? (
          <div className="analise-saida-form">
            <div className="form-section">
              <h4>Dados da Análise</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Quantidade Vendida *</label>
                  <input
                    type="number"
                    className="input"
                    value={dadosAnalise.quantidadeVendida || ''}
                    onChange={(e) => handleInputChange('quantidadeVendida', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    placeholder="Ex: 150"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Período de Análise *</label>
                  <input
                    type="text"
                    className="input"
                    value={dadosAnalise.periodoAnalise}
                    onChange={(e) => handleInputChange('periodoAnalise', e.target.value)}
                    placeholder="Ex: Últimos 30 dias, Semana passada, etc"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Preço Atual (R$)</label>
                  <input
                    type="number"
                    className="input"
                    value={dadosAnalise.precoAtual || ''}
                    onChange={(e) => handleInputChange('precoAtual', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Posicionamento no Ponto de Venda</label>
                  <input
                    type="text"
                    className="input"
                    value={dadosAnalise.posicionamento}
                    onChange={(e) => handleInputChange('posicionamento', e.target.value)}
                    placeholder="Ex: Gôndola central, Prateleira alta, etc"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Concorrência Observada</label>
                <input
                  type="text"
                  className="input"
                  value={dadosAnalise.concorrencia}
                  onChange={(e) => handleInputChange('concorrencia', e.target.value)}
                  placeholder="Ex: Produtos similares próximos, Preços da concorrência, etc"
                />
              </div>

              <div className="form-group">
                <label>Observações Adicionais</label>
                <textarea
                  className="textarea"
                  value={dadosAnalise.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="Descreva observações sobre a saída do produto, comportamento do consumidor, etc"
                  rows={4}
                />
              </div>
            </div>

            {erro && (
              <div className="alert alert-error">
                {erro}
              </div>
            )}

            <div className="analise-saida-actions">
              <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAnalisar}
                disabled={loading}
              >
                {loading ? 'Analisando com IA...' : '🤖 Analisar com IA'}
              </button>
            </div>
          </div>
        ) : (
          <div className="analise-saida-resultado">
            <div className="resultado-header">
              <div className="status-badge" style={{ backgroundColor: getStatusColor(resultado.statusSaida) + '20', color: getStatusColor(resultado.statusSaida) }}>
                {getStatusLabel(resultado.statusSaida)}
              </div>
            </div>

            <div className="resultado-secao">
              <h4>Análise Geral</h4>
              <p className="resultado-texto">{resultado.analise}</p>
            </div>

            {resultado.pontosPositivos.length > 0 && (
              <div className="resultado-secao">
                <h4>✅ Pontos Positivos</h4>
                <ul className="resultado-lista">
                  {resultado.pontosPositivos.map((ponto, index) => (
                    <li key={index}>{ponto}</li>
                  ))}
                </ul>
              </div>
            )}

            {resultado.pontosNegativos.length > 0 && (
              <div className="resultado-secao">
                <h4>⚠️ Pontos de Atenção</h4>
                <ul className="resultado-lista">
                  {resultado.pontosNegativos.map((ponto, index) => (
                    <li key={index}>{ponto}</li>
                  ))}
                </ul>
              </div>
            )}

            {resultado.recomendacoes.length > 0 && (
              <div className="resultado-secao">
                <h4>💡 Recomendações</h4>
                <ul className="resultado-lista">
                  {resultado.recomendacoes.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {resultado.acoesSugeridas.length > 0 && (
              <div className="resultado-secao">
                <h4>🎯 Ações Sugeridas</h4>
                <div className="acoes-list">
                  {resultado.acoesSugeridas.map((acao, index) => (
                    <div key={index} className="acao-item">
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

            <div className="analise-saida-actions">
              <button className="btn btn-secondary" onClick={() => setResultado(null)}>
                Nova Análise
              </button>
              <button className="btn btn-primary" onClick={onClose}>
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnaliseSaida

