import { useState, useEffect } from 'react'
import './PropostaForm.scss'

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

interface PropostaFormProps {
  proposta?: Proposta | null
  onSubmit: (dados: any) => void
  onCancel: () => void
}

const PropostaForm = ({ proposta, onSubmit, onCancel }: PropostaFormProps) => {
  const [formData, setFormData] = useState({
    cliente: '',
    valor: '',
    descricao: '',
    dataVencimento: '',
    observacoes: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (proposta) {
      setFormData({
        cliente: proposta.cliente,
        valor: proposta.valor.toString(),
        descricao: proposta.descricao || '',
        dataVencimento: proposta.dataVencimento.split('T')[0], // Formata para input date
        observacoes: proposta.observacoes || ''
      })
    } else {
      // Limpa o formulário quando não há proposta (criar nova)
      setFormData({
        cliente: '',
        valor: '',
        descricao: '',
        dataVencimento: '',
        observacoes: ''
      })
    }
  }, [proposta])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit({
        ...formData,
        valor: parseFloat(formData.valor)
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGerarComIA = async () => {
    setLoading(true)
    try {
      // Esta função será implementada no backend
      // Por enquanto, apenas simula
      alert('Funcionalidade será implementada no backend')
    } catch (error) {
      console.error('Erro ao gerar proposta com IA:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          {proposta ? 'Editar Proposta' : 'Nova Proposta'}
        </h3>
      </div>
      <form className="proposta-form" onSubmit={handleSubmit}>
        <div className="proposta-form-row">
          <div className="proposta-form-group">
            <label className="proposta-form-label">Cliente *</label>
            <input
              type="text"
              className="input"
              value={formData.cliente}
              onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
              required
              placeholder="Nome do cliente ou rede"
            />
          </div>

          <div className="proposta-form-group">
            <label className="proposta-form-label">Valor (R$) *</label>
            <input
              type="number"
              className="input"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              required
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="proposta-form-group">
          <label className="proposta-form-label">Descrição</label>
          <textarea
            className="textarea"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            placeholder="Descreva os produtos/serviços da proposta"
            rows={4}
          />
        </div>

        <div className="proposta-form-row">
          <div className="proposta-form-group">
            <label className="proposta-form-label">Data de Vencimento *</label>
            <input
              type="date"
              className="input"
              value={formData.dataVencimento}
              onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="proposta-form-group">
          <label className="proposta-form-label">Observações</label>
          <textarea
            className="textarea"
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            placeholder="Informações adicionais"
            rows={3}
          />
        </div>

        <div className="proposta-form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleGerarComIA}
            disabled={loading}
          >
            🤖 Gerar com IA
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Salvando...' : proposta ? 'Atualizar' : 'Criar Proposta'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PropostaForm

