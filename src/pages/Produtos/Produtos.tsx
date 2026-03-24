import { useEffect, useState } from 'react'
import { apiService } from '../../services/apiService'
import ProdutoForm, { ProdutoFormDados, Produto } from '../../components/ProdutoForm/ProdutoForm'
import ProdutoList from '../../components/ProdutoList/ProdutoList'
import './Produtos.scss'

const ProdutosPage = () => {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null)

  useEffect(() => {
    fetchProdutos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchProdutos = async () => {
    try {
      setLoading(true)
      const data = await apiService.getProdutos()
      setProdutos(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      setProdutos([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduto = async (dados: ProdutoFormDados) => {
    try {
      await apiService.createProduto(dados)
      await fetchProdutos()
      setShowForm(false)
      setEditingProduto(null)
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error)
      alert('Erro ao cadastrar produto. Tente novamente.')
    }
  }

  const handleUpdateProduto = async (id: string, dados: ProdutoFormDados) => {
    try {
      await apiService.updateProduto(id, dados)
      await fetchProdutos()
      setShowForm(false)
      setEditingProduto(null)
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
      alert('Erro ao atualizar produto. Tente novamente.')
    }
  }

  const handleDeleteProduto = async (produto: Produto) => {
    try {
      await apiService.deleteProduto(produto.id)
      await fetchProdutos()
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      alert('Erro ao excluir produto. Tente novamente.')
    }
  }

  return (
    <div className="produtos-page">
      <div className="produtos-page-header">
        <div>
          <h2>Cadastro de Produtos</h2>
          <p className="text-secondary">
            Cadastre produtos para facilitar a criação de tabelas e propostas.
          </p>
        </div>
        {!showForm && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingProduto(null)
              setShowForm(true)
            }}
          >
            + Novo Produto
          </button>
        )}
      </div>

      {showForm ? (
        <div className="produtos-page-form-section">
          <ProdutoForm
            produto={editingProduto}
            onSubmit={editingProduto ? (dados) => handleUpdateProduto(editingProduto.id, dados) : handleCreateProduto}
            onCancel={() => {
              setShowForm(false)
              setEditingProduto(null)
            }}
          />
        </div>
      ) : (
        <div className="produtos-page-list-section">
          <ProdutoList
            produtos={produtos}
            loading={loading}
            onRefresh={fetchProdutos}
            onEdit={(p) => {
              setEditingProduto(p)
              setShowForm(true)
            }}
            onDelete={handleDeleteProduto}
          />
        </div>
      )}
    </div>
  )
}

export default ProdutosPage

