import { useState, useEffect } from 'react'
import VisitaForm from '../../components/VisitaForm/VisitaForm'
import VisitaList from '../../components/VisitaList/VisitaList'
import { apiService } from '../../services/apiService'
import './Visitas.scss'

interface Visita {
  id: string
  cliente: string
  data: string
  status: string
  observacoes: string
}

const Visitas = () => {
  const [visitas, setVisitas] = useState<Visita[]>([])
  const [showForm, setShowForm] = useState(false)
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
            onClick={() => setShowForm(true)}
          >
            + Agendar Visita
          </button>
        )}
      </div>

      {showForm ? (
        <div className="visitas-form-section">
          <VisitaForm
            onSubmit={handleCreateVisita}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <div className="visitas-list-section">
          <VisitaList
            visitas={visitas}
            loading={loading}
            onRefresh={fetchVisitas}
          />
        </div>
      )}
    </div>
  )
}

export default Visitas

