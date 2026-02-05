import { useState, useEffect } from 'react'
import ClienteForm from '../../components/ClienteForm/ClienteForm'
import ClienteList from '../../components/ClienteList/ClienteList'
import { apiService } from '../../services/apiService'
import type { Cliente, ClienteFormDados } from '../../components/ClienteForm/ClienteForm'
import './Clientes.scss'

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClientes()
  }, [])

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

      {showForm ? (
        <div className="clientes-form-section">
          <ClienteForm
            cliente={editingCliente}
            onSubmit={
              editingCliente
                ? (dados) => handleUpdateCliente(editingCliente.id, dados)
                : handleCreateCliente
            }
            onCancel={() => {
              setShowForm(false)
              setEditingCliente(null)
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
