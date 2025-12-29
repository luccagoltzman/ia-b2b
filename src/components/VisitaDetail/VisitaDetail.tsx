import { useState } from 'react'
import VisitaTimeline from '../VisitaTimeline/VisitaTimeline'
import './VisitaDetail.scss'

interface Checkpoint {
  id: string
  status: string
  label: string
  descricao?: string
  data: string
  usuario?: string
}

interface Visita {
  id: string
  cliente: string
  data: string
  hora?: string
  status: string
  endereco?: string
  observacoes?: string
  checkpoints?: Checkpoint[]
}

interface VisitaDetailProps {
  visita: Visita
  onClose: () => void
  onEdit: () => void
  onUpdateStatus?: (status: string, descricao?: string) => void
}

const VisitaDetail = ({ visita, onClose, onEdit, onUpdateStatus }: VisitaDetailProps) => {
  const [showStatusForm, setShowStatusForm] = useState(false)
  const [novoStatus, setNovoStatus] = useState('')
  const [descricaoStatus, setDescricaoStatus] = useState('')

  const formatDateTime = (dateString: string, hora?: string) => {
    const date = new Date(dateString)
    const dateFormatted = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    if (hora) {
      return `${dateFormatted} às ${hora}`
    }
    return dateFormatted
  }

  const getStatusOptions = () => {
    return [
      { value: 'agendada', label: 'Agendada' },
      { value: 'confirmada', label: 'Confirmada' },
      { value: 'em_andamento', label: 'Em Andamento' },
      { value: 'realizada', label: 'Realizada' },
      { value: 'cancelada', label: 'Cancelada' },
      { value: 'reagendada', label: 'Reagendada' }
    ].filter(option => option.value !== visita.status) // Remove o status atual da lista
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
    <div className="visita-detail-overlay" onClick={onClose}>
      <div className="visita-detail" onClick={(e) => e.stopPropagation()}>
        <div className="visita-detail-header">
          <h3>Detalhes da Visita</h3>
          <button className="visita-detail-close" onClick={onClose}>×</button>
        </div>

        <div className="visita-detail-content">
          <div className="visita-detail-section">
            <h4>Informações Gerais</h4>
            <div className="visita-detail-info">
              <div className="visita-detail-field">
                <label>Cliente</label>
                <span>{visita.cliente}</span>
              </div>
              <div className="visita-detail-field">
                <label>Data e Hora</label>
                <span>{formatDateTime(visita.data, visita.hora)}</span>
              </div>
              <div className="visita-detail-field">
                <label>Status Atual</label>
                <span className={`badge badge-${
                  visita.status === 'realizada' ? 'success' : 
                  visita.status === 'cancelada' ? 'error' : 
                  visita.status === 'em_andamento' ? 'warning' : 
                  'info'
                }`}>
                  {visita.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              {visita.endereco && (
                <div className="visita-detail-field">
                  <label>Endereço</label>
                  <span>{visita.endereco}</span>
                </div>
              )}
            </div>
          </div>

          {visita.observacoes && (
            <div className="visita-detail-section">
              <h4>Observações</h4>
              <p>{visita.observacoes}</p>
            </div>
          )}

          {visita.checkpoints && visita.checkpoints.length > 0 && (
            <div className="visita-detail-section">
              <VisitaTimeline 
                checkpoints={visita.checkpoints} 
                statusAtual={visita.status}
              />
            </div>
          )}

          {onUpdateStatus && (
            <div className="visita-detail-section">
              {!showStatusForm ? (
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowStatusForm(true)}
                >
                  Atualizar Status
                </button>
              ) : (
                <div className="visita-detail-status-form">
                  <h4>Atualizar Status</h4>
                  <div className="visita-detail-info-box">
                    <strong>Status Atual:</strong> {visita.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="visita-detail-form-group">
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
                  <div className="visita-detail-form-group">
                    <label>Descrição do Checkpoint (opcional)</label>
                    <textarea
                      className="textarea"
                      value={descricaoStatus}
                      onChange={(e) => setDescricaoStatus(e.target.value)}
                      placeholder="Ex: Visita confirmada pelo cliente, aguardando data..."
                      rows={3}
                    />
                  </div>
                  <div className="visita-detail-form-actions">
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

        <div className="visita-detail-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Fechar
          </button>
          <button className="btn btn-primary" onClick={onEdit}>
            Editar Visita
          </button>
        </div>
      </div>
    </div>
  )
}

export default VisitaDetail

