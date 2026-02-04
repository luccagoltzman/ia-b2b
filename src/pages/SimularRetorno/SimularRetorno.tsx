import { useState, useEffect } from 'react'
import { apiService } from '../../services/apiService'
import ClienteSelecao from '../../components/ClienteSelecao/ClienteSelecao'
import './SimularRetorno.scss'

interface Cliente {
  nome: string
  email?: string
  telefone?: string
}

interface TabelaProdutos {
  id: string
  nome: string
  cliente?: string
  clientes?: (string | Cliente)[]
  produtos: any[]
  condicoesPagamento?: string
  prazoEntrega?: string
  observacoes?: string
  dataCriacao: string
  dataVencimento: string
  status?: string
}

const SimularRetorno = () => {
  const [tabelas, setTabelas] = useState<TabelaProdutos[]>([])
  const [loading, setLoading] = useState(true)
  const [tabelaSelecionada, setTabelaSelecionada] = useState<TabelaProdutos | null>(null)
  const [clienteSelecionado, setClienteSelecionado] = useState<string>('')
  const [mostrarSelecao, setMostrarSelecao] = useState(false)
  const [mostrarModalCliente, setMostrarModalCliente] = useState(false)
  const [tabelaParaEscolherCliente, setTabelaParaEscolherCliente] = useState<TabelaProdutos | null>(null)
  const [sucessoGeracao, setSucessoGeracao] = useState(false)
  const [propostaGeradaId, setPropostaGeradaId] = useState<string | null>(null)

  useEffect(() => {
    fetchTabelas()
  }, [])

  const fetchTabelas = async () => {
    try {
      setLoading(true)
      const data = await apiService.getTabelasProdutos()
      // Filtrar apenas tabelas enviadas ou aguardando resposta
      const tabelasFiltradas = data.filter((t: TabelaProdutos) => 
        t.status === 'enviada' || t.status === 'aguardando_resposta'
      )
      setTabelas(tabelasFiltradas)
    } catch (error) {
      console.error('Erro ao carregar tabelas:', error)
      alert('Erro ao carregar tabelas. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Helper para extrair nome do cliente (string ou objeto)
  const getClienteNome = (cliente: string | Cliente): string => {
    if (typeof cliente === 'string') return cliente
    return cliente?.nome || ''
  }

  const handleAbrirSelecaoCliente = (tabela: TabelaProdutos) => {
    const clientes = tabela.clientes || (tabela.cliente ? [tabela.cliente] : [])
    if (clientes.length === 0) {
      alert('Esta tabela não possui clientes associados.')
      return
    }
    if (clientes.length === 1) {
      setTabelaSelecionada(tabela)
      setClienteSelecionado(getClienteNome(clientes[0]))
      setMostrarSelecao(true)
    } else {
      setTabelaParaEscolherCliente(tabela)
      setMostrarModalCliente(true)
    }
  }

  const handleEscolherCliente = (clienteNome: string) => {
    if (tabelaParaEscolherCliente) {
      setTabelaSelecionada(tabelaParaEscolherCliente)
      setClienteSelecionado(clienteNome)
      setMostrarModalCliente(false)
      setTabelaParaEscolherCliente(null)
      setMostrarSelecao(true)
    }
  }

  const handleGerarProposta = async (selecoes: any[]) => {
    if (!tabelaSelecionada) return
    try {
      const proposta = await apiService.gerarPropostaDefinitiva(
        tabelaSelecionada.id,
        clienteSelecionado,
        selecoes
      )
      setPropostaGeradaId(proposta?.id || null)
      setSucessoGeracao(true)
      setMostrarSelecao(false)
      setTabelaSelecionada(null)
      setClienteSelecionado('')
      await fetchTabelas()
    } catch (error) {
      console.error('Erro ao gerar proposta definitiva:', error)
      alert('Erro ao gerar proposta definitiva. Tente novamente.')
    }
  }

  const handleFecharSucesso = () => {
    setSucessoGeracao(false)
    setPropostaGeradaId(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (sucessoGeracao) {
    return (
      <div className="simular-retorno simular-retorno-success">
        <div className="simular-retorno-stepper">
          <div className="simular-retorno-step completed"><span>1</span> Tabela</div>
          <div className="simular-retorno-step completed"><span>2</span> Seleção</div>
          <div className="simular-retorno-step active"><span>3</span> Concluído</div>
        </div>
        <div className="card simular-retorno-success-card">
          <div className="simular-retorno-success-icon">✓</div>
          <h2>Documentos gerados com sucesso</h2>
          <p className="text-secondary">
            A Nota de Retorno (PDF e Excel) e a Proposta Definitiva foram geradas. Os arquivos foram baixados automaticamente.
          </p>
          <div className="simular-retorno-success-actions">
            <button className="btn btn-primary" onClick={() => { handleFecharSucesso(); window.location.href = '/propostas' }}>
              Ver Propostas
            </button>
            <button className="btn btn-secondary" onClick={() => { handleFecharSucesso(); fetchTabelas() }}>
              Simular outro retorno
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (mostrarSelecao && tabelaSelecionada) {
    return (
      <div className="simular-retorno">
        <div className="simular-retorno-stepper">
          <div className="simular-retorno-step completed"><span>1</span> Tabela e Cliente</div>
          <div className="simular-retorno-step active"><span>2</span> Seleção de Produtos</div>
          <div className="simular-retorno-step"><span>3</span> Concluído</div>
        </div>
        <div className="simular-retorno-header">
          <button
            className="btn btn-secondary btn-back"
            onClick={() => {
              setMostrarSelecao(false)
              setTabelaSelecionada(null)
              setClienteSelecionado('')
            }}
          >
            ← Voltar
          </button>
          <div className="simular-retorno-header-title">
            <h2>Seleção de produtos</h2>
            <p className="text-secondary">{tabelaSelecionada.nome} · {clienteSelecionado}</p>
          </div>
        </div>
        <ClienteSelecao
          tabela={tabelaSelecionada}
          cliente={clienteSelecionado}
          onGerarProposta={handleGerarProposta}
          onCancel={() => {
            setMostrarSelecao(false)
            setTabelaSelecionada(null)
            setClienteSelecionado('')
          }}
        />
      </div>
    )
  }

  return (
    <div className="simular-retorno">
      <div className="simular-retorno-stepper">
        <div className="simular-retorno-step active"><span>1</span> Tabela e Cliente</div>
        <div className="simular-retorno-step"><span>2</span> Seleção de Produtos</div>
        <div className="simular-retorno-step"><span>3</span> Concluído</div>
      </div>
      <div className="simular-retorno-header">
        <div>
          <h2>Simular retorno do cliente</h2>
          <p className="text-secondary">
            Escolha uma tabela enviada e o cliente para simular a seleção de produtos
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchTabelas}>
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="card simular-retorno-loading-card">
          <div className="simular-retorno-loading">
            <div className="simular-retorno-spinner" />
            <p>Carregando tabelas...</p>
          </div>
        </div>
      ) : tabelas.length === 0 ? (
        <div className="card simular-retorno-empty-card">
          <div className="simular-retorno-empty">
            <div className="simular-retorno-empty-icon">📋</div>
            <p>Nenhuma tabela disponível para simulação</p>
            <p className="text-secondary">
              Envie uma tabela de produtos para clientes e ela aparecerá aqui
            </p>
          </div>
        </div>
      ) : (
        <div className="card simular-retorno-list-card">
          <div className="card-header">
            <h3 className="card-title">Tabelas disponíveis</h3>
          </div>
          <div className="simular-retorno-list">
            {tabelas.map((tabela, index) => {
              const clientesCount = tabela.clientes?.length || (tabela.cliente ? 1 : 0)
              const statusLabel = tabela.status === 'enviada' ? 'Enviada' : 
                                 tabela.status === 'aguardando_resposta' ? 'Aguardando Resposta' : 
                                 tabela.status || 'Desconhecido'
              return (
                <div key={tabela.id} className="simular-retorno-item" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="simular-retorno-item-info">
                    <div className="simular-retorno-item-header">
                      <h4>{tabela.nome}</h4>
                      <span className={`badge badge-${tabela.status === 'enviada' ? 'success' : tabela.status === 'aguardando_resposta' ? 'warning' : 'info'}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <div className="simular-retorno-item-details">
                      <div className="simular-retorno-detail">
                        <span className="simular-retorno-detail-label">Clientes</span>
                        <span>{clientesCount} {clientesCount === 1 ? 'cliente' : 'clientes'}</span>
                      </div>
                      <div className="simular-retorno-detail">
                        <span className="simular-retorno-detail-label">Produtos</span>
                        <span>{tabela.produtos.length}</span>
                      </div>
                      <div className="simular-retorno-detail">
                        <span className="simular-retorno-detail-label">Vencimento</span>
                        <span>{formatDate(tabela.dataVencimento)}</span>
                      </div>
                    </div>
                    {tabela.clientes && tabela.clientes.length > 0 && (
                      <div className="simular-retorno-clientes">
                        <div className="simular-retorno-clientes-list">
                          {tabela.clientes.map((c, idx) => (
                            <span key={idx} className="simular-retorno-cliente-tag">{getClienteNome(c)}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="simular-retorno-item-actions">
                    <button className="btn btn-primary" onClick={() => handleAbrirSelecaoCliente(tabela)}>
                      Simular retorno
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {mostrarModalCliente && tabelaParaEscolherCliente && (
        <div className="simular-retorno-modal-overlay" onClick={() => { setMostrarModalCliente(false); setTabelaParaEscolherCliente(null) }}>
          <div className="simular-retorno-modal" onClick={e => e.stopPropagation()}>
            <h3>Escolha o cliente</h3>
            <p className="text-secondary">Tabela: {tabelaParaEscolherCliente.nome}</p>
            <div className="simular-retorno-modal-clientes">
              {(tabelaParaEscolherCliente.clientes || []).map((c, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="simular-retorno-modal-cliente-btn"
                  onClick={() => handleEscolherCliente(getClienteNome(c))}
                >
                  {getClienteNome(c)}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-secondary" onClick={() => { setMostrarModalCliente(false); setTabelaParaEscolherCliente(null) }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SimularRetorno
