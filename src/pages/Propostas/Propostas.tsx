import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PropostaForm from '../../components/PropostaForm/PropostaForm'
import PropostaList from '../../components/PropostaList/PropostaList'
import PropostaDetail from '../../components/PropostaDetail/PropostaDetail'
import TabelaProdutosForm from '../../components/TabelaProdutosForm/TabelaProdutosForm'
import TabelaProdutosList from '../../components/TabelaProdutosList/TabelaProdutosList'
import ClienteSelecao from '../../components/ClienteSelecao/ClienteSelecao'
import { apiService } from '../../services/apiService'
import { exportService } from '../../services/exportService'
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
  // Campos existentes
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
  // Novos campos - Cliente
  clienteCnpj?: string
  clienteEndereco?: string
  clienteNumero?: string
  clienteBairro?: string
  clienteCidade?: string
  clienteCep?: string
  clienteEstado?: string
  clienteTelefone?: string
  clienteEmail?: string
  clienteNomeFantasia?: string
  // Novos campos - Produto
  produtoCodigo?: string
  aliquotaIpi?: number
  // Novos campos - Comercial
  valorFrete?: number
  tipoPedido?: string
  transportadora?: string
  informacoesAdicionais?: string
}

const Propostas = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'propostas' | 'tabelas'>('tabelas')
  
  // Estados para Propostas
  const [propostas, setPropostas] = useState<Proposta[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingProposta, setEditingProposta] = useState<Proposta | null>(null)
  const [viewingProposta, setViewingProposta] = useState<Proposta | null>(null)
  
  // Estados para Tabelas
  const [tabelas, setTabelas] = useState<any[]>([])
  const [showTabelaForm, setShowTabelaForm] = useState(false)
  const [loadingTabelas, setLoadingTabelas] = useState(true)
  const [editingTabela, setEditingTabela] = useState<any | null>(null)
  const [viewingTabela, setViewingTabela] = useState<any | null>(null)
  const [showClienteSelecao, setShowClienteSelecao] = useState(false)
  const [tabelaParaSelecao, setTabelaParaSelecao] = useState<{ tabela: any; cliente: string } | null>(null)

  useEffect(() => {
    if (activeTab === 'propostas') {
      fetchPropostas()
    } else {
      fetchTabelas()
    }
  }, [activeTab])

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

  // Funções para Tabelas
  const fetchTabelas = async () => {
    try {
      setLoadingTabelas(true)
      const data = await apiService.getTabelasProdutos()
      setTabelas(data)
    } catch (error) {
      console.error('Erro ao carregar tabelas:', error)
    } finally {
      setLoadingTabelas(false)
    }
  }

  const handleCreateTabela = async (dados: any) => {
    try {
      // Converter clientes de objetos para strings (compatibilidade com backend atual)
      const dadosParaEnvio = {
        ...dados,
        clientes: dados.clientes?.map((cliente: any) => 
          typeof cliente === 'string' ? cliente : cliente.nome
        ) || []
      }
      await apiService.createTabelaProdutos(dadosParaEnvio)
      await fetchTabelas()
      setShowTabelaForm(false)
    } catch (error) {
      console.error('Erro ao criar tabela:', error)
      alert('Erro ao criar tabela. Tente novamente.')
    }
  }

  const handleEditTabela = (tabela: any) => {
    setEditingTabela(tabela)
    setShowTabelaForm(true)
  }

  const handleUpdateTabela = async (id: string, dados: any) => {
    try {
      // Converter clientes de objetos para strings (compatibilidade com backend atual)
      const dadosParaEnvio = {
        ...dados,
        clientes: dados.clientes?.map((cliente: any) => 
          typeof cliente === 'string' ? cliente : cliente.nome
        ) || []
      }
      await apiService.updateTabelaProdutos(id, dadosParaEnvio)
      await fetchTabelas()
      setShowTabelaForm(false)
      setEditingTabela(null)
    } catch (error) {
      console.error('Erro ao atualizar tabela:', error)
      alert('Erro ao atualizar tabela. Tente novamente.')
    }
  }

  const handleEnviarTabela = async (tabela: any) => {
    try {
      // Converter clientes para exibição
      const clientesNomes = tabela.clientes?.map((c: any) => 
        typeof c === 'string' ? c : c.nome
      ) || []
      const listaClientes = clientesNomes.length > 0 
        ? clientesNomes.join(', ')
        : tabela.cliente || 'Nenhum cliente selecionado'
      
      const confirmacao = window.confirm(
        `Deseja enviar a tabela "${tabela.nome}" para os clientes?\n\n` +
        `Clientes: ${listaClientes}`
      )
      
      if (!confirmacao) return

      // Converter clientes de objetos para strings para o backend
      const clientesParaEnvio = tabela.clientes?.map((c: any) => 
        typeof c === 'string' ? c : c.nome
      ) || []
      
      const clientesParaEnviar = clientesParaEnvio.length > 0 ? clientesParaEnvio : undefined
      await apiService.enviarTabelaParaClientes(tabela.id, clientesParaEnviar)

      const clientes = tabela.clientes || (tabela.cliente ? [tabela.cliente] : [])
      for (const cliente of clientes) {
        const clienteNome = typeof cliente === 'string' ? cliente : cliente.nome
        const clientInfo = typeof cliente === 'object' && cliente ? { email: cliente.email, telefone: cliente.telefone } : undefined
        exportService.exportTabelaProdutosToPDF(tabela, clienteNome, clientInfo)
        exportService.exportTabelaProdutosToExcel(tabela, clienteNome)
      }
      
      alert('Tabela enviada com sucesso! Os arquivos PDF e Excel foram gerados.')
      await fetchTabelas()
    } catch (error: any) {
      console.error('Erro ao enviar tabela:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido'
      alert(`Erro ao enviar tabela: ${errorMessage}\n\nVerifique o console para mais detalhes.`)
    }
  }

  const handleSimularRetorno = (tabela: any) => {
    // Redirecionar para a página de simular retorno
    navigate('/simular-retorno')
  }

  // Helper para extrair nome do cliente (string ou objeto)
  const getClienteNome = (cliente: any): string => {
    if (typeof cliente === 'string') return cliente
    return cliente?.nome || ''
  }

  const handleGerarProposta = async (tabela: any) => {
    // Mostrar seleção de cliente se houver múltiplos clientes
    const clientes = tabela.clientes || (tabela.cliente ? [tabela.cliente] : [])
    
    if (clientes.length === 0) {
      alert('Nenhum cliente associado a esta tabela.')
      return
    }
    
    if (clientes.length === 1) {
      const clienteNome = getClienteNome(clientes[0])
      setTabelaParaSelecao({ tabela, cliente: clienteNome })
      setShowClienteSelecao(true)
    } else {
      const listaClientes = clientes.map((c: any, i: number) => `${i + 1}. ${getClienteNome(c)}`).join('\n')
      const clienteEscolhido = window.prompt(
        `Escolha o cliente para gerar a proposta:\n\n${listaClientes}\n\nDigite o número:`
      )
      
      if (clienteEscolhido) {
        const index = parseInt(clienteEscolhido) - 1
        if (index >= 0 && index < clientes.length) {
          const clienteNome = getClienteNome(clientes[index])
          setTabelaParaSelecao({ tabela, cliente: clienteNome })
          setShowClienteSelecao(true)
        }
      }
    }
  }

  const handleGerarPropostaDefinitiva = async (selecoes: any[]) => {
    if (!tabelaParaSelecao) return

    try {
      // A nota já foi gerada automaticamente no ClienteSelecao antes de chamar esta função
      const proposta = await apiService.gerarPropostaDefinitiva(
        tabelaParaSelecao.tabela.id,
        tabelaParaSelecao.cliente,
        selecoes
      )
      
      // Não mostrar alert aqui, pois o ClienteSelecao já mostra
      setShowClienteSelecao(false)
      setTabelaParaSelecao(null)
      await fetchTabelas()
      
      // Opcional: redirecionar para ver a proposta gerada
      if (proposta?.id) {
        const verProposta = window.confirm('Nota de retorno e proposta geradas com sucesso! Deseja visualizar a proposta?')
        if (verProposta) {
          setActiveTab('propostas')
          await fetchPropostas()
        }
      }
    } catch (error) {
      console.error('Erro ao gerar proposta definitiva:', error)
      alert('Erro ao gerar proposta definitiva. Tente novamente.')
    }
  }

  return (
    <div className="propostas">
      <div className="propostas-header">
        <div>
          <h2>Propostas Comerciais</h2>
          <p className="text-secondary">
            {activeTab === 'tabelas' 
              ? 'Crie tabelas de produtos e gere propostas automaticamente'
              : 'Gerencie suas propostas com ajuda da IA'}
          </p>
        </div>
        <div className="propostas-header-actions">
          <div className="propostas-tabs">
            <button
              className={`propostas-tab ${activeTab === 'tabelas' ? 'active' : ''}`}
              onClick={() => setActiveTab('tabelas')}
            >
              📊 Tabelas de Produtos
            </button>
            <button
              className={`propostas-tab ${activeTab === 'propostas' ? 'active' : ''}`}
              onClick={() => setActiveTab('propostas')}
            >
              📝 Propostas
            </button>
          </div>
          {activeTab === 'tabelas' && !showTabelaForm && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingTabela(null)
                setShowTabelaForm(true)
              }}
            >
              + Nova Tabela
            </button>
          )}
          {activeTab === 'propostas' && !showForm && (
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
      </div>

      {activeTab === 'tabelas' ? (
        <>
          {showTabelaForm ? (
            <div className="propostas-form-section">
              <TabelaProdutosForm
                tabela={editingTabela}
                onSubmit={editingTabela ? 
                  (dados) => handleUpdateTabela(editingTabela.id, dados) :
                  handleCreateTabela
                }
                onCancel={() => {
                  setShowTabelaForm(false)
                  setEditingTabela(null)
                }}
              />
            </div>
          ) : showClienteSelecao && tabelaParaSelecao ? (
            <ClienteSelecao
              tabela={tabelaParaSelecao.tabela}
              cliente={tabelaParaSelecao.cliente}
              onGerarProposta={handleGerarPropostaDefinitiva}
              onCancel={() => {
                setShowClienteSelecao(false)
                setTabelaParaSelecao(null)
              }}
            />
          ) : (
            <div className="propostas-list-section">
              <TabelaProdutosList
                tabelas={tabelas}
                loading={loadingTabelas}
                onEdit={handleEditTabela}
                onEnviar={handleEnviarTabela}
                onGerarProposta={handleGerarProposta}
                onSimularRetorno={handleSimularRetorno}
                onRefresh={fetchTabelas}
              />
            </div>
          )}
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}

export default Propostas

