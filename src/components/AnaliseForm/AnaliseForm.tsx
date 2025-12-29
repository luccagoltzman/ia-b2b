import { useState } from 'react'
import './AnaliseForm.scss'

interface AnaliseFormProps {
  onSubmit: (tipo: string, dados: any) => void
  loading: boolean
}

const AnaliseForm = ({ onSubmit, loading }: AnaliseFormProps) => {
  const [tipoAnalise, setTipoAnalise] = useState('')
  const [dadosInput, setDadosInput] = useState('')

  const tiposAnalise = [
    { value: 'performance', label: 'Análise de Performance', icon: '📈' },
    { value: 'concorrencia', label: 'Análise de Concorrência', icon: '⚔️' },
    { value: 'tendencia', label: 'Análise de Tendências', icon: '📊' },
    { value: 'oportunidade', label: 'Identificação de Oportunidades', icon: '💡' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tipoAnalise || !dadosInput.trim()) {
      alert('Preencha todos os campos')
      return
    }

    onSubmit(tipoAnalise, dadosInput)
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Nova Análise</h3>
      </div>
      <form className="analise-form" onSubmit={handleSubmit}>
        <div className="analise-form-group">
          <label className="analise-form-label">Tipo de Análise</label>
          <div className="analise-form-options">
            {tiposAnalise.map((tipo) => (
              <button
                key={tipo.value}
                type="button"
                className={`analise-form-option ${
                  tipoAnalise === tipo.value ? 'active' : ''
                }`}
                onClick={() => setTipoAnalise(tipo.value)}
              >
                <span className="analise-form-option-icon">{tipo.icon}</span>
                <span className="analise-form-option-label">{tipo.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="analise-form-group">
          <label className="analise-form-label">Dados para Análise</label>
          <textarea
            className="textarea"
            placeholder="Cole aqui os dados que deseja analisar (vendas, visitas, propostas, etc.)"
            value={dadosInput}
            onChange={(e) => setDadosInput(e.target.value)}
            rows={8}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !tipoAnalise || !dadosInput.trim()}
        >
          {loading ? (
            <>
              <span className="loading"></span>
              Gerando análise...
            </>
          ) : (
            'Gerar Análise'
          )}
        </button>
      </form>
    </div>
  )
}

export default AnaliseForm

