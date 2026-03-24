import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PropostaForm from '../../components/PropostaForm/PropostaForm'
import PropostaList from '../../components/PropostaList/PropostaList'
import PropostaDetail from '../../components/PropostaDetail/PropostaDetail'
import TabelaProdutosForm from '../../components/TabelaProdutosForm/TabelaProdutosForm'
import TabelaProdutosList from '../../components/TabelaProdutosList/TabelaProdutosList'
import ClienteSelecao from '../../components/ClienteSelecao/ClienteSelecao'
import PropostaPorPrompt from '../../components/PropostaPorPrompt/PropostaPorPrompt'
import type { ResultadoPromptProposta } from '../../components/PropostaPorPrompt/PropostaPorPrompt'
import { apiService } from '../../services/apiService'
import { exportService } from '../../services/exportService'
import { clienteAreaService, PropostaClienteInbox } from '../../services/clienteAreaService'
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
  // Proposta gerada a partir de tabela (simular retorno)
  tabelaId?: string
  geradaAutomaticamente?: boolean
}

const Propostas = () => {
  const RETORNOS_SEEN_KEY = 'ia_b2b_retorno_seen_at'
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
  const [retornosRepresentante, setRetornosRepresentante] = useState<PropostaClienteInbox[]>([])
  const [retornosNovosCount, setRetornosNovosCount] = useState(0)

  const atualizarRetornosRepresentante = () => {
    const retornos = clienteAreaService.listarRetornosRepresentante()
    setRetornosRepresentante(retornos)

    const seenAt = localStorage.getItem(RETORNOS_SEEN_KEY)
    const seenTime = seenAt ? new Date(seenAt).getTime() : 0
    const novos = retornos.filter((r) => new Date(r.decisaoData || r.dataEnvio).getTime() > seenTime)
    setRetornosNovosCount(novos.length)
  }

  useEffect(() => {
    if (activeTab === 'propostas') {
      fetchPropostas()
    } else {
      fetchTabelas()
      fetchPropostas() // para exibir "clientes que retornaram" na aba Tabelas
      atualizarRetornosRepresentante()
    }
  }, [activeTab])

  // Atualiza notificações/status em tempo real na aba de Tabelas
  useEffect(() => {
    if (activeTab !== 'tabelas') return

    const onStorage = () => atualizarRetornosRepresentante()
    window.addEventListener('storage', onStorage)

    const intervalId = window.setInterval(() => {
      atualizarRetornosRepresentante()
    }, 2000)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.clearInterval(intervalId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const decisaoPorTabela = retornosRepresentante.reduce<Record<string, 'aceita_preco' | 'recusada_preco'>>((acc, r) => {
    if (!r.tabelaId || !r.decisaoCliente) return acc
    const atual = acc[r.tabelaId]
    if (!atual) {
      acc[r.tabelaId] = r.decisaoCliente
      return acc
    }
    // Se houver qualquer recusa, prioriza sinalizar recusada
    if (atual !== 'recusada_preco' && r.decisaoCliente === 'recusada_preco') {
      acc[r.tabelaId] = 'recusada_preco'
    }
    return acc
  }, {})

  // Clientes que já retornaram (geraram proposta) por tabela
  const clientesRetornadosPorTabela = propostas
    .filter((p) => p.tabelaId && (p.geradaAutomaticamente === true || p.tabelaId))
    .reduce<Record<string, string[]>>((acc, p) => {
      const id = p.tabelaId!
      if (!acc[id]) acc[id] = []
      if (p.cliente && !acc[id].includes(p.cliente)) acc[id].push(p.cliente)
      return acc
    }, {})

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

      // Enriquecer produtos com dados do cadastro (apresentação, IPI etc.)
      // e preservar desconto da tabela para a simulação de negociação do cliente.
      let tabelaComDetalhes = tabela
      try {
        const catalogo = await apiService.getProdutos()
        if (Array.isArray(catalogo)) {
          const produtosEnriquecidos = (tabela.produtos || []).map((p: any) => {
            const match = catalogo.find((c: any) => {
              const byCode =
                p.produtoCodigo &&
                c?.produtoCodigo &&
                String(p.produtoCodigo).trim().toLowerCase() === String(c.produtoCodigo).trim().toLowerCase()
              if (byCode) return true

              const nomeTabela = String(p.produto || '').trim().toLowerCase()
              const nomeCatalogo = String(c?.produto || '').trim().toLowerCase()
              const marcaTabela = String(p.marca || '').trim().toLowerCase()
              const marcaCatalogo = String(c?.marca || '').trim().toLowerCase()
              return nomeTabela && nomeCatalogo && marcaTabela === marcaCatalogo && nomeTabela === nomeCatalogo
            })

            return {
              ...p,
              aliquotaIpi: p.aliquotaIpi ?? match?.aliquotaIpi,
              apresentacaoTipo: p.apresentacaoTipo ?? match?.apresentacaoTipo,
              apresentacaoUrl: p.apresentacaoUrl ?? match?.apresentacaoUrl,
              apresentacaoNome: p.apresentacaoNome ?? match?.apresentacaoNome
            }
          })

          tabelaComDetalhes = {
            ...tabela,
            produtos: produtosEnriquecidos
          }
        }
      } catch {
        // fallback silencioso: usa a tabela como está
      }

      const clientes = tabela.clientes || (tabela.cliente ? [tabela.cliente] : [])
      for (const cliente of clientes) {
        const clienteNome = typeof cliente === 'string' ? cliente : cliente.nome
        const clientInfo = typeof cliente === 'object' && cliente ? { email: cliente.email, telefone: cliente.telefone } : undefined
        exportService.exportTabelaProdutosToPDF(tabelaComDetalhes, clienteNome, clientInfo)
        exportService.exportTabelaProdutosToExcel(tabelaComDetalhes, clienteNome)

        // Simulação da negociação: proposta enviada aparece na Área do Cliente
        clienteAreaService.registrarEnvio(tabelaComDetalhes, cliente)
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
    navigate('/simular-retorno')
  }

  const handlePropostaPorPromptSuccess = async (resultado: ResultadoPromptProposta) => {
    try {
      const nomeCliente = resultado.cliente?.trim() || ''
      if (!nomeCliente) {
        alert('Não foi possível identificar o cliente no seu texto. Tente novamente.')
        return
      }

      // Verificar se o cliente já está cadastrado (busca por nome, case-insensitive)
      let clientesCadastro: any[] = []
      try {
        clientesCadastro = await apiService.getClientes()
        if (!Array.isArray(clientesCadastro)) clientesCadastro = []
      } catch {
        clientesCadastro = []
      }

      const nomeNormalizado = nomeCliente.toLowerCase()
      const clienteCadastrado = clientesCadastro.find(
        (c: any) => (c.nome || '').trim().toLowerCase() === nomeNormalizado
      )

      if (!clienteCadastrado) {
        const msg = `O cliente "${nomeCliente}" não está cadastrado. Cadastre-o com os dados comerciais (CNPJ, empresa, etc.) para continuar. Você será redirecionado ao Cadastro de Clientes.`
        if (window.confirm(msg + '\n\nDeseja ir ao cadastro agora?')) {
          navigate('/clientes', { state: { nomeSugerido: nomeCliente } })
        }
        return
      }

      const dataVencimento = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      const nomeTabela = resultado.nomeTabela || `Proposta ${resultado.cliente}`

      let produtos: Array<{ id: string; produto: string; marca: string; unidadeMedida: string; quantidade: number; valorUnitario: number }>
      if (resultado.produtosSugeridos && resultado.produtosSugeridos.length > 0) {
        produtos = resultado.produtosSugeridos.map((p, i) => ({
          id: `p-${Date.now()}-${i}`,
          produto: p.produto,
          marca: p.marca || '',
          unidadeMedida: p.unidadeMedida || 'unidade',
          quantidade: p.quantidade ?? 1,
          valorUnitario: p.valorUnitario ?? 0
        }))
      } else {
        const qtd = resultado.quantidadeProdutos ?? 3
        produtos = Array.from({ length: qtd }, (_, i) => ({
          id: `p-${Date.now()}-${i}`,
          produto: `Produto ${i + 1}`,
          marca: '',
          unidadeMedida: 'unidade',
          quantidade: 1,
          valorUnitario: 0
        }))
      }

      const dadosParaEnvio = {
        nome: nomeTabela,
        clientes: [resultado.cliente],
        produtos,
        dataVencimento
      }

      const created = await apiService.createTabelaProdutos(dadosParaEnvio)
      await fetchTabelas()

      const tabelaParaEdicao = {
        ...created,
        clientes: created?.clientes ?? [resultado.cliente],
        produtos: created?.produtos ?? produtos
      }

      if (resultado.acao === 'criar_e_enviar' && created?.id) {
        await apiService.enviarTabelaParaClientes(created.id, [resultado.cliente])
        const tabelaComDados = { ...tabelaParaEdicao, produtos: tabelaParaEdicao.produtos }
        exportService.exportTabelaProdutosToPDF(tabelaComDados, resultado.cliente)
        exportService.exportTabelaProdutosToExcel(tabelaComDados, resultado.cliente)
        alert('Proposta criada e enviada! Os arquivos PDF e Excel foram gerados.')
      } else {
        alert('Tabela criada com sucesso! Revise os dados abaixo e envie quando quiser.')
      }

      setEditingTabela(tabelaParaEdicao)
      setShowTabelaForm(true)
    } catch (error: any) {
      console.error('Erro ao criar proposta por IA:', error)
      const msg = error?.response?.data?.message || error?.message || 'Erro ao criar tabela. Tente novamente.'
      alert(msg)
    }
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
      await fetchPropostas() // atualiza "clientes que retornaram" na aba Tabelas
      
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
              {retornosNovosCount > 0 && (
                <div className="propostas-notificacao-retorno">
                  <div>
                    <strong>{retornosNovosCount} novo(s) retorno(s) de cliente</strong> com status atualizado
                    (aceita/recusada).
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      localStorage.setItem(RETORNOS_SEEN_KEY, new Date().toISOString())
                      setRetornosNovosCount(0)
                    }}
                  >
                    Marcar notificação como lida
                  </button>
                </div>
              )}
              {retornosRepresentante.length > 0 && (
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="card-header">
                    <h3 className="card-title">Retornos dos clientes</h3>
                  </div>
                  <div style={{ padding: '1rem' }}>
                    {retornosRepresentante.map((r) => (
                      <div
                        key={r.id}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          marginBottom: '0.75rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '1rem'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {r.cliente} · {r.tabelaNome}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#475569' }}>
                            {r.decisaoCliente === 'aceita_preco'
                              ? 'Aceitou a proposta com o preço enviado'
                              : 'Não aceitou a proposta com o preço enviado'}
                          </div>
                          {r.decisaoObservacao && (
                            <div style={{ fontSize: '0.875rem', color: '#334155', marginTop: '0.25rem' }}>
                              Obs.: {r.decisaoObservacao}
                            </div>
                          )}
                        </div>
                        <div>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              clienteAreaService.limparRetornoRepresentante(r.id)
                              const atualizados = clienteAreaService.listarRetornosRepresentante()
                              setRetornosRepresentante(atualizados)
                            }}
                          >
                            Arquivar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <PropostaPorPrompt
                onSuccess={handlePropostaPorPromptSuccess}
                onError={(msg) => alert(msg)}
              />
              <TabelaProdutosList
                tabelas={tabelas}
                loading={loadingTabelas}
                clientesRetornados={clientesRetornadosPorTabela}
                decisaoPorTabela={decisaoPorTabela}
                onEdit={handleEditTabela}
                onEnviar={handleEnviarTabela}
                onGerarProposta={handleGerarProposta}
                onSimularRetorno={handleSimularRetorno}
                onRefresh={() => { fetchTabelas(); fetchPropostas() }}
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

