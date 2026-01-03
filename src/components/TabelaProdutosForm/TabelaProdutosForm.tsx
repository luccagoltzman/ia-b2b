import { useState, useEffect } from 'react'
import { apiService } from '../../services/apiService'
import './TabelaProdutosForm.scss'

interface ProdutoTabela {
  id: string
  produto: string
  produtoCodigo?: string
  marca: string
  categoria?: string
  unidadeMedida: string
  quantidade: number // Quantidade já definida pelo representante
  valorUnitario: number
  aliquotaIpi?: number
  desconto?: number // Desconto interno (não aparece para o cliente)
  descontoTipo?: 'percentual' | 'valor'
}

interface Cliente {
  nome: string
  email?: string
  telefone?: string
}

interface TabelaProdutos {
  id?: string
  nome: string
  cliente?: string // Compatibilidade retroativa
  clientes?: (string | Cliente)[] // Aceita string (retrocompatibilidade) ou Cliente
  produtos: ProdutoTabela[]
  condicoesPagamento?: string
  prazoEntrega?: string
  observacoes?: string
  dataCriacao?: string
  dataVencimento: string
}

interface TabelaProdutosFormProps {
  tabela?: TabelaProdutos | null
  onSubmit: (dados: TabelaProdutos) => void
  onCancel: () => void
}

const TabelaProdutosForm = ({ tabela, onSubmit, onCancel }: TabelaProdutosFormProps) => {
  const [formData, setFormData] = useState<TabelaProdutos>({
    nome: '',
    clientes: [],
    produtos: [],
    condicoesPagamento: '',
    prazoEntrega: '',
    observacoes: '',
    dataVencimento: ''
  })
  const [loading, setLoading] = useState(false)
  const [novoCliente, setNovoCliente] = useState<Cliente>({
    nome: '',
    email: '',
    telefone: ''
  })
  const [novoProduto, setNovoProduto] = useState<Partial<ProdutoTabela>>({
    produto: '',
    produtoCodigo: '',
    marca: '',
    categoria: '',
    unidadeMedida: 'unidade',
    quantidade: 0,
    valorUnitario: 0,
    aliquotaIpi: 0,
    desconto: 0,
    descontoTipo: 'percentual'
  })

  useEffect(() => {
    if (tabela) {
      // Converter clientes string para objetos Cliente se necessário
      const clientesConvertidos = tabela.clientes?.map(cliente => {
        if (typeof cliente === 'string') {
          return { nome: cliente, email: '', telefone: '' }
        }
        return cliente
      }) || []
      
      setFormData({
        ...tabela,
        clientes: clientesConvertidos
      })
    }
  }, [tabela])

  const handleAddCliente = () => {
    if (novoCliente.nome.trim()) {
      setFormData(prev => ({
        ...prev,
        clientes: [...(prev.clientes || []), { ...novoCliente, nome: novoCliente.nome.trim() }]
      }))
      setNovoCliente({
        nome: '',
        email: '',
        telefone: ''
      })
    }
  }

  const handleRemoveCliente = (index: number) => {
    setFormData(prev => ({
      ...prev,
      clientes: prev.clientes?.filter((_, i) => i !== index) || []
    }))
  }

  const handleAddProduto = () => {
    if (novoProduto.produto && novoProduto.marca && novoProduto.valorUnitario && novoProduto.quantidade) {
      const produto: ProdutoTabela = {
        id: Date.now().toString(),
        produto: novoProduto.produto,
        produtoCodigo: novoProduto.produtoCodigo,
        marca: novoProduto.marca,
        categoria: novoProduto.categoria,
        unidadeMedida: novoProduto.unidadeMedida || 'unidade',
        quantidade: parseFloat(novoProduto.quantidade.toString()),
        valorUnitario: parseFloat(novoProduto.valorUnitario.toString()),
        aliquotaIpi: novoProduto.aliquotaIpi ? parseFloat(novoProduto.aliquotaIpi.toString()) : 0,
        desconto: novoProduto.desconto ? parseFloat(novoProduto.desconto.toString()) : 0,
        descontoTipo: novoProduto.descontoTipo || 'percentual'
      }
      setFormData(prev => ({
        ...prev,
        produtos: [...prev.produtos, produto]
      }))
      setNovoProduto({
        produto: '',
        produtoCodigo: '',
        marca: '',
        categoria: '',
        unidadeMedida: 'unidade',
        quantidade: 0,
        valorUnitario: 0,
        aliquotaIpi: 0,
        desconto: 0,
        descontoTipo: 'percentual'
      })
    }
  }

  const handleRemoveProduto = (id: string) => {
    setFormData(prev => ({
      ...prev,
      produtos: prev.produtos.filter(p => p.id !== id)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome || formData.produtos.length === 0) {
      alert('Por favor, preencha o nome da tabela e adicione pelo menos um produto.')
      return
    }

    if (formData.clientes?.length === 0) {
      alert('Por favor, adicione pelo menos um cliente.')
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          {tabela ? 'Editar Tabela de Produtos' : 'Nova Tabela de Produtos'}
        </h3>
      </div>
      <form className="tabela-produtos-form" onSubmit={handleSubmit}>
        {/* Informações Básicas */}
        <div className="tabela-form-section">
          <h4 className="tabela-form-section-title">Informações Básicas</h4>
          <div className="tabela-form-row">
            <div className="tabela-form-group">
              <label className="tabela-form-label">Nome da Tabela *</label>
              <input
                type="text"
                className="input"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                placeholder="Ex: Tabela Promocional Q1 2024"
              />
            </div>
            <div className="tabela-form-group">
              <label className="tabela-form-label">Data de Vencimento *</label>
              <input
                type="date"
                className="input"
                value={formData.dataVencimento}
                onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        {/* Clientes */}
        <div className="tabela-form-section">
          <h4 className="tabela-form-section-title">Clientes para Envio *</h4>
          <div className="tabela-form-row">
            <div className="tabela-form-group">
              <label className="tabela-form-label">Nome do Cliente *</label>
              <input
                type="text"
                className="input"
                value={novoCliente.nome}
                onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                placeholder="Nome do cliente"
              />
            </div>
            <div className="tabela-form-group">
              <label className="tabela-form-label">Email</label>
              <input
                type="email"
                className="input"
                value={novoCliente.email || ''}
                onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="tabela-form-group">
              <label className="tabela-form-label">Telefone/WhatsApp</label>
              <input
                type="tel"
                className="input"
                value={novoCliente.telefone || ''}
                onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="tabela-form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddCliente}
                style={{ height: 'fit-content' }}
              >
                Adicionar
              </button>
            </div>
          </div>
          <small style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginTop: '0.5rem' }}>
            Email e telefone são opcionais, mas necessários para envio automático futuro via email ou WhatsApp
          </small>
          {formData.clientes && formData.clientes.length > 0 && (
            <div className="tabela-clientes-list">
              {formData.clientes.map((cliente, index) => {
                const clienteObj = typeof cliente === 'string' 
                  ? { nome: cliente, email: '', telefone: '' }
                  : cliente
                
                return (
                  <div key={index} className="tabela-cliente-item">
                    <div className="tabela-cliente-info">
                      <div className="tabela-cliente-nome">
                        <strong>{clienteObj.nome}</strong>
                      </div>
                      {(clienteObj.email || clienteObj.telefone) && (
                        <div className="tabela-cliente-contato">
                          {clienteObj.email && (
                            <span className="tabela-cliente-email">📧 {clienteObj.email}</span>
                          )}
                          {clienteObj.telefone && (
                            <span className="tabela-cliente-telefone">📱 {clienteObj.telefone}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => handleRemoveCliente(index)}
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Produtos */}
        <div className="tabela-form-section">
          <h4 className="tabela-form-section-title">Produtos *</h4>
          <div className="tabela-produtos-form">
            <div className="tabela-form-row">
              <div className="tabela-form-group">
                <label className="tabela-form-label">Produto *</label>
                <input
                  type="text"
                  className="input"
                  value={novoProduto.produto || ''}
                  onChange={(e) => setNovoProduto({ ...novoProduto, produto: e.target.value })}
                  placeholder="Nome do produto"
                />
              </div>
              <div className="tabela-form-group">
                <label className="tabela-form-label">Código</label>
                <input
                  type="text"
                  className="input"
                  value={novoProduto.produtoCodigo || ''}
                  onChange={(e) => setNovoProduto({ ...novoProduto, produtoCodigo: e.target.value })}
                  placeholder="Código do produto"
                />
              </div>
              <div className="tabela-form-group">
                <label className="tabela-form-label">Marca *</label>
                <input
                  type="text"
                  className="input"
                  value={novoProduto.marca || ''}
                  onChange={(e) => setNovoProduto({ ...novoProduto, marca: e.target.value })}
                  placeholder="Marca"
                />
              </div>
            </div>
            <div className="tabela-form-row">
              <div className="tabela-form-group">
                <label className="tabela-form-label">Categoria</label>
                <input
                  type="text"
                  className="input"
                  value={novoProduto.categoria || ''}
                  onChange={(e) => setNovoProduto({ ...novoProduto, categoria: e.target.value })}
                  placeholder="Categoria"
                />
              </div>
              <div className="tabela-form-group">
                <label className="tabela-form-label">Unidade de Medida</label>
                <select
                  className="input"
                  value={novoProduto.unidadeMedida || 'unidade'}
                  onChange={(e) => setNovoProduto({ ...novoProduto, unidadeMedida: e.target.value })}
                >
                  <option value="unidade">Unidade</option>
                  <option value="kg">Quilograma (kg)</option>
                  <option value="g">Grama (g)</option>
                  <option value="litro">Litro (L)</option>
                  <option value="ml">Mililitro (mL)</option>
                  <option value="caixa">Caixa</option>
                  <option value="pacote">Pacote</option>
                  <option value="fardo">Fardo</option>
                </select>
              </div>
              <div className="tabela-form-group">
                <label className="tabela-form-label">Quantidade *</label>
                <input
                  type="number"
                  className="input"
                  value={novoProduto.quantidade || ''}
                  onChange={(e) => setNovoProduto({ ...novoProduto, quantidade: parseFloat(e.target.value) || 0 })}
                  step="1"
                  min="1"
                  placeholder="0"
                />
              </div>
              <div className="tabela-form-group">
                <label className="tabela-form-label">Valor Unitário (R$) *</label>
                <input
                  type="number"
                  className="input"
                  value={novoProduto.valorUnitario || ''}
                  onChange={(e) => setNovoProduto({ ...novoProduto, valorUnitario: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="tabela-form-row">
              <div className="tabela-form-group">
                <label className="tabela-form-label">Alíquota IPI (%)</label>
                <input
                  type="number"
                  className="input"
                  value={novoProduto.aliquotaIpi || ''}
                  onChange={(e) => setNovoProduto({ ...novoProduto, aliquotaIpi: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="0.00"
                />
              </div>
              <div className="tabela-form-group">
                <label className="tabela-form-label">Desconto (interno)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    className="input"
                    value={novoProduto.desconto || ''}
                    onChange={(e) => setNovoProduto({ ...novoProduto, desconto: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    min="0"
                    placeholder="0"
                    style={{ flex: 1 }}
                  />
                  <select
                    className="input"
                    value={novoProduto.descontoTipo || 'percentual'}
                    onChange={(e) => setNovoProduto({ ...novoProduto, descontoTipo: e.target.value as 'percentual' | 'valor' })}
                    style={{ width: '120px' }}
                  >
                    <option value="percentual">%</option>
                    <option value="valor">R$</option>
                  </select>
                </div>
                <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
                  Este desconto não aparecerá na tabela enviada ao cliente, apenas na proposta final
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddProduto}
            >
              + Adicionar Produto
            </button>
          </div>

          {formData.produtos.length > 0 && (
            <div className="tabela-produtos-list">
              <table className="tabela-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Código</th>
                    <th>Marca</th>
                    <th>Quantidade</th>
                    <th>Unidade</th>
                    <th>Valor Unitário</th>
                    <th>Valor Total</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.produtos.map((produto) => {
                    const valorTotal = produto.valorUnitario * produto.quantidade
                    return (
                      <tr key={produto.id}>
                        <td>{produto.produto}</td>
                        <td>{produto.produtoCodigo || '-'}</td>
                        <td>{produto.marca}</td>
                        <td>{produto.quantidade}</td>
                        <td>{produto.unidadeMedida}</td>
                        <td>R$ {produto.valorUnitario.toFixed(2)}</td>
                        <td>R$ {valorTotal.toFixed(2)}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRemoveProduto(produto.id)}
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>


        {/* Condições Comerciais */}
        <div className="tabela-form-section">
          <h4 className="tabela-form-section-title">Condições Comerciais</h4>
          <div className="tabela-form-row">
            <div className="tabela-form-group">
              <label className="tabela-form-label">Condições de Pagamento</label>
              <input
                type="text"
                className="input"
                value={formData.condicoesPagamento || ''}
                onChange={(e) => setFormData({ ...formData, condicoesPagamento: e.target.value })}
                placeholder="Ex: 30/60/90 dias, Boleto, Cartão, etc"
              />
            </div>
            <div className="tabela-form-group">
              <label className="tabela-form-label">Prazo de Entrega</label>
              <input
                type="text"
                className="input"
                value={formData.prazoEntrega || ''}
                onChange={(e) => setFormData({ ...formData, prazoEntrega: e.target.value })}
                placeholder="Ex: 15 dias, Imediato, etc"
              />
            </div>
          </div>
          <div className="tabela-form-group">
            <label className="tabela-form-label">Observações</label>
            <textarea
              className="textarea"
              value={formData.observacoes || ''}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Observações adicionais sobre a tabela"
              rows={3}
            />
          </div>
        </div>

        <div className="tabela-form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Salvando...' : tabela ? 'Atualizar Tabela' : 'Criar Tabela'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default TabelaProdutosForm
