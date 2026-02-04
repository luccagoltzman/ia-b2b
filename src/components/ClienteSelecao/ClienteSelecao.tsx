import { useState, useEffect } from 'react'
import { apiService } from '../../services/apiService'
import { exportService } from '../../services/exportService'
import './ClienteSelecao.scss'

interface ProdutoTabela {
  id: string
  produto: string
  produtoCodigo?: string
  marca: string
  categoria?: string
  unidadeMedida: string
  quantidade: number
  valorUnitario: number
  aliquotaIpi?: number
  desconto?: number
  descontoTipo?: 'percentual' | 'valor'
}

interface ProdutoSelecionado {
  produtoId: string
}

interface ClienteInfo {
  nome: string
  email?: string
  telefone?: string
}

interface TabelaProdutos {
  id: string
  nome: string
  cliente?: string
  clientes?: (string | ClienteInfo)[]
  produtos: ProdutoTabela[]
  condicoesPagamento?: string
  prazoEntrega?: string
  observacoes?: string
  dataCriacao: string
  dataVencimento: string
}

interface ClienteSelecaoProps {
  tabela: TabelaProdutos
  cliente: string
  onGerarProposta: (selecoes: ProdutoSelecionado[]) => void
  onCancel: () => void
}

const ClienteSelecao = ({ tabela, cliente, onGerarProposta, onCancel }: ClienteSelecaoProps) => {
  const [produtosSelecionados, setProdutosSelecionados] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  const handleToggleProduto = (produtoId: string) => {
    setProdutosSelecionados(prev => {
      const novo = new Set(prev)
      if (novo.has(produtoId)) {
        novo.delete(produtoId)
      } else {
        novo.add(produtoId)
      }
      return novo
    })
  }

  const calcularValorProduto = (produto: ProdutoTabela): number => {
    let valorUnitario = produto.valorUnitario
    
    // Aplicar IPI
    if (produto.aliquotaIpi) {
      valorUnitario = valorUnitario * (1 + produto.aliquotaIpi / 100)
    }

    // Aplicar desconto (interno, não aparece para o cliente)
    if (produto.desconto) {
      if (produto.descontoTipo === 'percentual') {
        valorUnitario = valorUnitario * (1 - produto.desconto / 100)
      } else {
        valorUnitario = Math.max(0, valorUnitario - produto.desconto)
      }
    }

    return valorUnitario * produto.quantidade
  }

  const handleGerarProposta = async () => {
    if (produtosSelecionados.size === 0) {
      alert('Por favor, selecione pelo menos um produto.')
      return
    }

    setLoading(true)
    try {
      const selecoes: ProdutoSelecionado[] = Array.from(produtosSelecionados).map(produtoId => ({
        produtoId
      }))
      
      // Obter os produtos selecionados completos
      const produtosCompletos = tabela.produtos.filter(p => produtosSelecionados.has(p.id))
      const clientInfo = tabela.clientes
        ?.map(c => (typeof c === 'string' ? { nome: c } : c))
        ?.find(c => c.nome === cliente)
      const pdfClientInfo = clientInfo && typeof clientInfo !== 'string'
        ? { email: (clientInfo as ClienteInfo).email, telefone: (clientInfo as ClienteInfo).telefone }
        : undefined
      exportService.exportNotaRetornoClienteToPDF(tabela, cliente, produtosCompletos, pdfClientInfo)
      
      // Pequeno delay antes de gerar Excel
      await new Promise(resolve => setTimeout(resolve, 500))
      exportService.exportNotaRetornoClienteToExcel(tabela, cliente, produtosCompletos)
      
      // Gerar proposta definitiva
      await onGerarProposta(selecoes)
      
      // Mensagem será mostrada pelo componente pai se necessário
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const produtosMarcados = tabela.produtos.filter(p => produtosSelecionados.has(p.id))
  const valorTotal = produtosMarcados.reduce((total, produto) => {
    return total + calcularValorProduto(produto)
  }, 0)

  return (
    <div className="cliente-selecao">
      <div className="card cliente-selecao-card">
        <div className="card-header">
          <div className="cliente-selecao-progress">
            <span className="cliente-selecao-progress-text">
              {produtosMarcados.length} de {tabela.produtos.length} produtos selecionados
            </span>
            <div className="cliente-selecao-progress-bar">
              <div
                className="cliente-selecao-progress-fill"
                style={{ width: `${tabela.produtos.length ? (produtosMarcados.length / tabela.produtos.length) * 100 : 0}%` }}
              />
            </div>
          </div>
          <h3 className="card-title">Seleção de produtos</h3>
          <p className="text-secondary">Cliente: {cliente} · Tabela: {tabela.nome}</p>
          <p className="cliente-selecao-hint">
            Marque os itens desejados. Ao confirmar, a nota de retorno e a proposta serão geradas automaticamente.
          </p>
        </div>

        <div className="cliente-selecao-content">
          <div className="cliente-selecao-produtos">
            <table className="cliente-selecao-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Selecionar</th>
                  <th>Produto</th>
                  <th>Código</th>
                  <th>Marca</th>
                  <th>Quantidade</th>
                  <th>Unidade</th>
                  <th>Valor Unitário</th>
                  <th>Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {tabela.produtos.map((produto) => {
                  const selecionado = produtosSelecionados.has(produto.id)
                  const valorTotalProduto = produto.valorUnitario * produto.quantidade
                  
                  return (
                    <tr key={produto.id} className={selecionado ? 'produto-selecionado' : ''}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selecionado}
                          onChange={() => handleToggleProduto(produto.id)}
                          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                      </td>
                      <td>{produto.produto}</td>
                      <td>{produto.produtoCodigo || '-'}</td>
                      <td>{produto.marca}</td>
                      <td style={{ textAlign: 'center' }}>{produto.quantidade}</td>
                      <td>{produto.unidadeMedida}</td>
                      <td>{formatCurrency(produto.valorUnitario)}</td>
                      <td><strong>{formatCurrency(valorTotalProduto)}</strong></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="cliente-selecao-resumo">
            <div className="cliente-selecao-resumo-card">
              <h4>Resumo</h4>
              <div className="cliente-selecao-resumo-item">
                <span>Itens selecionados</span>
                <strong>{produtosMarcados.length}</strong>
              </div>
              <div className="cliente-selecao-resumo-item cliente-selecao-resumo-total">
                <span>Valor total</span>
                <strong className="valor-total">{formatCurrency(valorTotal)}</strong>
              </div>
              <p className="cliente-selecao-resumo-note">
                Nota de retorno (PDF/Excel) e proposta serão geradas ao confirmar.
              </p>
              <div className="cliente-selecao-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGerarProposta}
                  disabled={loading || produtosMarcados.length === 0}
                >
                  {loading ? 'Gerando...' : 'Confirmar e gerar documentos'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClienteSelecao
