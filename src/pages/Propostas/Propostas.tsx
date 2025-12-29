import { useState, useEffect } from 'react'
import PropostaForm from '../../components/PropostaForm/PropostaForm'
import PropostaList from '../../components/PropostaList/PropostaList'
import PropostaDetail from '../../components/PropostaDetail/PropostaDetail'
import { apiService } from '../../services/apiService'
import './Propostas.scss'

interface Checkpoint {
  id: string
  status: string
  label: string
  descricao?: string
  data: string
  usuario?: string
}

interface Proposta {
  id: string
  cliente: string
  valor: number
  status: string
  dataCriacao: string
  dataVencimento: string
  descricao?: string
  observacoes?: string
  checkpoints?: Checkpoint[]
  // Novos campos
  produto?: string
  marca?: string
  categoria?: string
  unidadeMedida?: string
  valorUnitario?: number
  quantidade?: number
  desconto?: number
  descontoTipo?: 'percentual' | 'valor'
  condicoesPagamento?: string
  prazoEntrega?: string
  estrategiaRepresentacao?: string
  publicoAlvo?: string
  diferenciaisCompetitivos?: string
}

const Propostas = () => {
  const [propostas, setPropostas] = useState<Proposta[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingProposta, setEditingProposta] = useState<Proposta | null>(null)
  const [viewingProposta, setViewingProposta] = useState<Proposta | null>(null)

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

  const handleViewProposta = async (proposta: Proposta) => {
    try {
      // Buscar detalhes completos da proposta (com checkpoints)
      const detalhes = await apiService.getPropostaDetalhes(proposta.id)
      setViewingProposta(detalhes)
    } catch (error: any) {
      console.warn('Endpoint de detalhes não disponível, usando dados básicos:', error.message)
      // Se não houver endpoint, usar a proposta básica com checkpoints vazios
      setViewingProposta({
        ...proposta,
        checkpoints: [
          {
            id: 'initial',
            status: proposta.status,
            label: proposta.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            data: proposta.dataCriacao,
            descricao: 'Status inicial'
          }
        ]
      })
    }
  }

  const handleUpdateStatus = async (id: string, status: string, descricao?: string) => {
    try {
      await apiService.updatePropostaStatus(id, status, descricao)
      await fetchPropostas()
      if (viewingProposta) {
        try {
          const detalhes = await apiService.getPropostaDetalhes(id)
          setViewingProposta(detalhes)
        } catch (error) {
          // Se o endpoint de detalhes não existir, apenas atualizar a lista
          console.warn('Endpoint de detalhes não disponível, atualizando apenas lista')
        }
      }
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error)
      let errorMessage = 'Erro ao atualizar status.'
      
      if (error.response?.status === 404) {
        errorMessage = 'Endpoint não encontrado. O backend precisa implementar POST /api/propostas/:id/status'
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Requisição inválida. Verifique os dados enviados.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
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
            onView={handleViewProposta}
            onRefresh={fetchPropostas}
          />
        </div>
      )}

      {viewingProposta && (
        <PropostaDetail
          proposta={viewingProposta}
          onClose={() => setViewingProposta(null)}
          onEdit={() => {
            setViewingProposta(null)
            setEditingProposta(viewingProposta)
            setShowForm(true)
          }}
          onUpdateStatus={(status, descricao) => 
            handleUpdateStatus(viewingProposta.id, status, descricao)
          }
        />
      )}
    </div>
  )
}

export default Propostas

