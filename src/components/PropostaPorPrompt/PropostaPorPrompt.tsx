import { useState } from 'react'
import { apiService } from '../../services/apiService'
import './PropostaPorPrompt.scss'

export interface ResultadoPromptProposta {
  cliente: string
  clienteId?: string
  quantidadeProdutos?: number
  produtosSugeridos?: Array<{
    produto: string
    marca?: string
    quantidade?: number
    valorUnitario?: number
    unidadeMedida?: string
  }>
  acao?: 'criar' | 'criar_e_enviar'
  nomeTabela?: string
}

interface PropostaPorPromptProps {
  onSuccess: (resultado: ResultadoPromptProposta) => void
  onError?: (message: string) => void
}

const EXEMPLO = 'Faça uma proposta para o cliente "João Silva" com 3 produtos e faça o envio dessa proposta.'

const PropostaPorPrompt = ({ onSuccess, onError }: PropostaPorPromptProps) => {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const texto = prompt.trim()
    if (!texto) {
      onError?.('Digite o que você deseja fazer.')
      return
    }

    setLoading(true)
    try {
      const resultado = await apiService.interpretarPromptProposta(texto)
      if (resultado?.cliente) {
        onSuccess(resultado)
        setPrompt('')
      } else {
        onError?.('A IA não conseguiu identificar o cliente no seu texto. Tente ser mais específico.')
      }
    } catch (err: any) {
      console.error('Erro ao interpretar prompt:', err)
      const msg = err?.response?.status === 404 || err?.response?.status === 501
        ? 'Recurso de IA ainda não disponível no backend. Configure o endpoint POST /api/ia/proposta-por-prompt.'
        : (err?.response?.data?.message || err?.message || 'Erro ao processar. Tente novamente.')
      onError?.(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="proposta-por-prompt card">
      <div className="proposta-por-prompt-header">
        <h3 className="card-title">✨ Criar proposta com IA</h3>
        <p className="proposta-por-prompt-desc">
          Descreva em texto o que você quer: cliente, quantidade de produtos e se deseja enviar a proposta. A IA monta a tabela para você revisar.
        </p>
      </div>
      <form className="proposta-por-prompt-form" onSubmit={handleSubmit}>
        <label className="proposta-por-prompt-label" htmlFor="prompt-proposta">
          O que você quer fazer?
        </label>
        <textarea
          id="prompt-proposta"
          className="proposta-por-prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={EXEMPLO}
          rows={3}
          disabled={loading}
        />
        <div className="proposta-por-prompt-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setPrompt(EXEMPLO)}
            disabled={loading}
          >
            Usar exemplo
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !prompt.trim()}
          >
            {loading ? 'Processando...' : 'Gerar proposta'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PropostaPorPrompt
