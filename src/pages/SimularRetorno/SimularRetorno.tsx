import { useState, useEffect } from 'react'
import { apiService } from '../../services/apiService'
import ClienteSelecao from '../../components/ClienteSelecao/ClienteSelecao'
import './SimularRetorno.scss'

interface TabelaProdutos {
  id: string
  nome: string
  cliente?: string
  clientes?: string[]
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

  const handleSelecionarTabela = (tabela: TabelaProdutos) => {
    const clientes = tabela.clientes || (tabela.cliente ? [tabela.cliente] : [])
    
    if (clientes.length === 0) {
      alert('Esta tabela não possui clientes associados.')
      return
    }
    
    if (clientes.length === 1) {
      setTabelaSelecionada(tabela)
      setClienteSelecionado(clientes[0])
      setMostrarSelecao(true)
    } else {
      // Se houver múltiplos clientes, pedir para escolher
      const clienteEscolhido = window.prompt(
        `Escolha o cliente para simular o retorno:\n\n${clientes.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}\n\nDigite o número:`
      )
      
      if (clienteEscolhido) {
        const index = parseInt(clienteEscolhido) - 1
        if (index >= 0 && index < clientes.length) {
          setTabelaSelecionada(tabela)
          setClienteSelecionado(clientes[index])
          setMostrarSelecao(true)
        }
      }
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
      
      alert('Nota de retorno e proposta definitiva geradas com sucesso!')
      setMostrarSelecao(false)
      setTabelaSelecionada(null)
      setClienteSelecionado('')
      await fetchTabelas()
      
      // Opcional: redirecionar para ver a proposta
      if (proposta?.id) {
        const verProposta = window.confirm('Deseja visualizar a proposta gerada?')
        if (verProposta) {
          window.location.href = '/propostas'
        }
      }
    } catch (error) {
      console.error('Erro ao gerar proposta definitiva:', error)
      alert('Erro ao gerar proposta definitiva. Tente novamente.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (mostrarSelecao && tabelaSelecionada) {
    return (
      <div className="simular-retorno">
        <div className="simular-retorno-header">
          <button
            className="btn btn-secondary"
            onClick={() => {
              setMostrarSelecao(false)
              setTabelaSelecionada(null)
              setClienteSelecionado('')
            }}
          >
            ← Voltar para Lista
          </button>
          <h2>Simular Retorno do Cliente</h2>
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
      <div className="simular-retorno-header">
        <div>
          <h2>Simular Retorno do Cliente</h2>
          <p className="text-secondary">
            Selecione uma tabela enviada para simular a escolha de produtos pelo cliente
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchTabelas}>
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="card">
          <div className="simular-retorno-loading">Carregando tabelas...</div>
        </div>
      ) : tabelas.length === 0 ? (
        <div className="card">
          <div className="simular-retorno-empty">
            <p>Nenhuma tabela enviada encontrada</p>
            <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              As tabelas precisam estar com status "enviada" ou "aguardando_resposta" para simular o retorno
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Tabelas Disponíveis para Simulação</h3>
          </div>
          <div className="simular-retorno-list">
            {tabelas.map((tabela) => {
              const clientesCount = tabela.clientes?.length || (tabela.cliente ? 1 : 0)
              const statusLabel = tabela.status === 'enviada' ? 'Enviada' : 
                                 tabela.status === 'aguardando_resposta' ? 'Aguardando Resposta' : 
                                 tabela.status || 'Desconhecido'
              
              return (
                <div key={tabela.id} className="simular-retorno-item">
                  <div className="simular-retorno-item-info">
                    <div className="simular-retorno-item-header">
                      <h4>{tabela.nome}</h4>
                      <span className={`badge badge-${
                        tabela.status === 'enviada' ? 'success' : 
                        tabela.status === 'aguardando_resposta' ? 'warning' : 
                        'info'
                      }`}>
                        {statusLabel}
                      </span>
                    </div>
                    <div className="simular-retorno-item-details">
                      <div className="simular-retorno-detail">
                        <span className="simular-retorno-detail-label">Clientes:</span>
                        <span>{clientesCount} {clientesCount === 1 ? 'cliente' : 'clientes'}</span>
                      </div>
                      <div className="simular-retorno-detail">
                        <span className="simular-retorno-detail-label">Produtos:</span>
                        <span>{tabela.produtos.length} produtos</span>
                      </div>
                      <div className="simular-retorno-detail">
                        <span className="simular-retorno-detail-label">Vencimento:</span>
                        <span>{formatDate(tabela.dataVencimento)}</span>
                      </div>
                    </div>
                    {tabela.clientes && tabela.clientes.length > 0 && (
                      <div className="simular-retorno-clientes">
                        <span className="simular-retorno-detail-label">Clientes:</span>
                        <div className="simular-retorno-clientes-list">
                          {tabela.clientes.map((cliente, idx) => (
                            <span key={idx} className="simular-retorno-cliente-tag">
                              {cliente}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="simular-retorno-item-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSelecionarTabela(tabela)}
                    >
                      Simular Retorno
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default SimularRetorno
