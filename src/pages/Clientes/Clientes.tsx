import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ClienteForm from '../../components/ClienteForm/ClienteForm'
import ClienteList from '../../components/ClienteList/ClienteList'
import { apiService } from '../../services/apiService'
import type { Cliente, ClienteFormDados } from '../../components/ClienteForm/ClienteForm'
import './Clientes.scss'

const Clientes = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [nomeSugerido, setNomeSugerido] = useState<string | null>(null)

  useEffect(() => {
    fetchClientes()
  }, [])

  // Se veio da proposta por prompt (cliente não cadastrado), abrir formulário com nome sugerido
  useEffect(() => {
    const state = location.state as { nomeSugerido?: string } | null
    if (state?.nomeSugerido?.trim()) {
      setNomeSugerido(state.nomeSugerido.trim())
      setShowForm(true)
      setEditingCliente(null)
      navigate(location.pathname, { replace: true, state: {} })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  const fetchClientes = async () => {
    try {
      setLoading(true)
      const data = await apiService.getClientes()
      setClientes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      setClientes([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCliente = async (dados: ClienteFormDados) => {
    try {
      await apiService.createCliente(dados)
      await fetchClientes()
      setShowForm(false)
      setNomeSugerido(null)
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error)
      alert('Erro ao cadastrar cliente. Tente novamente.')
    }
  }

  const handleUpdateCliente = async (id: string, dados: ClienteFormDados) => {
    try {
      await apiService.updateCliente(id, dados)
      await fetchClientes()
      setShowForm(false)
      setEditingCliente(null)
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      alert('Erro ao atualizar cliente. Tente novamente.')
    }
  }

  const handleDeleteCliente = async (cliente: Cliente) => {
    try {
      await apiService.deleteCliente(cliente.id)
      await fetchClientes()
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      alert('Erro ao excluir cliente. Tente novamente.')
    }
  }

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setShowForm(true)
  }

  return (
    <div className="clientes">
      <div className="clientes-header">
        <div>
          <h2>Cadastro de Clientes</h2>
          <p className="text-secondary">
            Cadastre clientes para usar em tabelas de produtos e propostas. Você pode puxar um cliente cadastrado ou digitar manualmente.
          </p>
        </div>
        {!showForm && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingCliente(null)
              setShowForm(true)
            }}
          >
            + Novo Cliente
          </button>
        )}
      </div>

      {nomeSugerido && (
        <div className="clientes-banner clientes-banner-from-proposta">
          <p>
            <strong>Cadastre o cliente com os dados comerciais</strong> (CNPJ, empresa, endereço, etc.) para poder usar em propostas. Preencha os campos abaixo.
          </p>
        </div>
      )}
      {showForm ? (
        <div className="clientes-form-section">
          <ClienteForm
            cliente={editingCliente}
            initialNome={nomeSugerido || undefined}
            onSubmit={
              editingCliente
                ? (dados) => handleUpdateCliente(editingCliente.id, dados)
                : handleCreateCliente
            }
            onCancel={() => {
              setShowForm(false)
              setEditingCliente(null)
              setNomeSugerido(null)
            }}
          />
        </div>
      ) : (
        <div className="clientes-list-section">
          <ClienteList
            clientes={clientes}
            loading={loading}
            onRefresh={fetchClientes}
            onEdit={handleEditCliente}
            onDelete={handleDeleteCliente}
          />
        </div>
      )}
    </div>
  )
}

export default Clientes
