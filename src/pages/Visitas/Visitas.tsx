import { useState, useEffect } from 'react'
import VisitaForm from '../../components/VisitaForm/VisitaForm'
import VisitaList from '../../components/VisitaList/VisitaList'
import VisitaDetail from '../../components/VisitaDetail/VisitaDetail'
import { apiService } from '../../services/apiService'
import './Visitas.scss'

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

const Visitas = () => {
  const [visitas, setVisitas] = useState<Visita[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingVisita, setEditingVisita] = useState<Visita | null>(null)
  const [viewingVisita, setViewingVisita] = useState<Visita | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVisitas()
  }, [])

  const fetchVisitas = async () => {
    try {
      const data = await apiService.getVisitas()
      setVisitas(data)
    } catch (error) {
      console.error('Erro ao carregar visitas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateVisita = async (dados: any) => {
    try {
      await apiService.createVisita(dados)
      await fetchVisitas()
      setShowForm(false)
    } catch (error) {
      console.error('Erro ao criar visita:', error)
      alert('Erro ao criar visita. Tente novamente.')
    }
  }

  const handleUpdateVisita = async (id: string, dados: any) => {
    try {
      await apiService.updateVisita(id, dados)
      await fetchVisitas()
      setShowForm(false)
      setEditingVisita(null)
    } catch (error) {
      console.error('Erro ao atualizar visita:', error)
      alert('Erro ao atualizar visita. Tente novamente.')
    }
  }

  const handleEditVisita = (visita: Visita) => {
    setEditingVisita(visita)
    setShowForm(true)
  }

  const handleViewVisita = async (visita: Visita) => {
    try {
      // Buscar detalhes completos da visita (com checkpoints)
      const detalhes = await apiService.getVisitaDetalhes(visita.id)
      setViewingVisita(detalhes)
    } catch (error: any) {
      console.warn('Endpoint de detalhes não disponível, usando dados básicos:', error.message)
      // Se não houver endpoint, usar a visita básica com checkpoints vazios
      setViewingVisita({
        ...visita,
        checkpoints: [
          {
            id: 'initial',
            status: visita.status,
            label: visita.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            data: visita.data,
            descricao: 'Status inicial'
          }
        ]
      })
    }
  }

  const handleUpdateStatus = async (id: string, status: string, descricao?: string) => {
    try {
      await apiService.updateVisitaStatus(id, status, descricao)
      await fetchVisitas()
      if (viewingVisita) {
        try {
          const detalhes = await apiService.getVisitaDetalhes(id)
          setViewingVisita(detalhes)
        } catch (error) {
          console.warn('Endpoint de detalhes não disponível, atualizando apenas lista')
        }
      }
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error)
      let errorMessage = 'Erro ao atualizar status.'
      
      if (error.response?.status === 404) {
        errorMessage = 'Endpoint não encontrado. O backend precisa implementar POST /api/visitas/:id/status'
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Requisição inválida. Verifique os dados enviados.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
    }
  }

  return (
    <div className="visitas">
      <div className="visitas-header">
        <div>
          <h2>Gestão de Visitas</h2>
          <p className="text-secondary">
            Agende e acompanhe suas visitas aos clientes
          </p>
        </div>
        {!showForm && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingVisita(null)
              setShowForm(true)
            }}
          >
            + Agendar Visita
          </button>
        )}
      </div>

      {showForm ? (
        <div className="visitas-form-section">
          <VisitaForm
            visita={editingVisita}
            onSubmit={editingVisita ? 
              (dados) => handleUpdateVisita(editingVisita.id, dados) :
              handleCreateVisita
            }
            onCancel={() => {
              setShowForm(false)
              setEditingVisita(null)
            }}
          />
        </div>
      ) : (
        <div className="visitas-list-section">
          <VisitaList
            visitas={visitas}
            loading={loading}
            onRefresh={fetchVisitas}
            onEdit={handleEditVisita}
            onView={handleViewVisita}
          />
        </div>
      )}

      {viewingVisita && (
        <VisitaDetail
          visita={viewingVisita}
          onClose={() => setViewingVisita(null)}
          onEdit={() => {
            setViewingVisita(null)
            setEditingVisita(viewingVisita)
            setShowForm(true)
          }}
          onUpdateStatus={(status, descricao) => 
            handleUpdateStatus(viewingVisita.id, status, descricao)
          }
        />
      )}
    </div>
  )
}

export default Visitas

