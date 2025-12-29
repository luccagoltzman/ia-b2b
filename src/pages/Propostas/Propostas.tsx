import { useState, useEffect } from 'react'
import PropostaForm from '../../components/PropostaForm/PropostaForm'
import PropostaList from '../../components/PropostaList/PropostaList'
import { apiService } from '../../services/apiService'
import './Propostas.scss'

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

const Propostas = () => {
  const [propostas, setPropostas] = useState<Proposta[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingProposta, setEditingProposta] = useState<Proposta | null>(null)

  useEffect(() => {
    fetchPropostas()
  }, [])

  const fetchPropostas = async () => {
    try {
      const data = await apiService.getPropostas()
      setPropostas(data)
    } catch (error) {
      console.error('Erro ao carregar propostas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProposta = async (dados: any) => {
    try {
      await apiService.createProposta(dados)
      await fetchPropostas()
      setShowForm(false)
    } catch (error) {
      console.error('Erro ao criar proposta:', error)
      alert('Erro ao criar proposta. Tente novamente.')
    }
  }

  const handleEditProposta = (proposta: Proposta) => {
    setEditingProposta(proposta)
    setShowForm(true)
  }

  const handleUpdateProposta = async (id: string, dados: any) => {
    try {
      await apiService.updateProposta(id, dados)
      await fetchPropostas()
      setShowForm(false)
      setEditingProposta(null)
    } catch (error) {
      console.error('Erro ao atualizar proposta:', error)
      alert('Erro ao atualizar proposta. Tente novamente.')
    }
  }

  return (
    <div className="propostas">
      <div className="propostas-header">
        <div>
          <h2>Propostas Comerciais</h2>
          <p className="text-secondary">
            Gerencie suas propostas com ajuda da IA
          </p>
        </div>
        {!showForm && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingProposta(null)
              setShowForm(true)
            }}
          >
            + Nova Proposta
          </button>
        )}
      </div>

      {showForm ? (
        <div className="propostas-form-section">
          <PropostaForm
            proposta={editingProposta}
            onSubmit={editingProposta ? 
              (dados) => handleUpdateProposta(editingProposta.id, dados) :
              handleCreateProposta
            }
            onCancel={() => {
              setShowForm(false)
              setEditingProposta(null)
            }}
          />
        </div>
      ) : (
        <div className="propostas-list-section">
          <PropostaList
            propostas={propostas}
            loading={loading}
            onEdit={handleEditProposta}
            onRefresh={fetchPropostas}
          />
        </div>
      )}
    </div>
  )
}

export default Propostas

