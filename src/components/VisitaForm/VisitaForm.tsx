import { useState } from 'react'
import './VisitaForm.scss'

interface VisitaFormProps {
  onSubmit: (dados: any) => void
  onCancel: () => void
}

const VisitaForm = ({ onSubmit, onCancel }: VisitaFormProps) => {
  const [formData, setFormData] = useState({
    cliente: '',
    data: '',
    hora: '',
    endereco: '',
    observacoes: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Agendar Nova Visita</h3>
      </div>
      <form className="visita-form" onSubmit={handleSubmit}>
        <div className="visita-form-row">
          <div className="visita-form-group">
            <label className="visita-form-label">Cliente *</label>
            <input
              type="text"
              className="input"
              value={formData.cliente}
              onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
              required
              placeholder="Nome do cliente ou rede"
            />
          </div>

          <div className="visita-form-group">
            <label className="visita-form-label">Data *</label>
            <input
              type="date"
              className="input"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              required
            />
          </div>

          <div className="visita-form-group">
            <label className="visita-form-label">Hora *</label>
            <input
              type="time"
              className="input"
              value={formData.hora}
              onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="visita-form-group">
          <label className="visita-form-label">Endereço</label>
          <input
            type="text"
            className="input"
            value={formData.endereco}
            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            placeholder="Endereço completo"
          />
        </div>

        <div className="visita-form-group">
          <label className="visita-form-label">Observações</label>
          <textarea
            className="textarea"
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            placeholder="Informações sobre a visita"
            rows={4}
          />
        </div>

        <div className="visita-form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Agendando...' : 'Agendar Visita'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default VisitaForm

