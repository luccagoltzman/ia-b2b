import { useState, useEffect } from 'react'
import { apiService } from '../../services/apiService'
import './PropostaForm.scss'

interface Proposta {
  id: string
  cliente: string
  valor: number
  status: string
  dataCriacao: string
  dataVencimento: string
  descricao?: string
  observacoes?: string
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

interface PropostaFormProps {
  proposta?: Proposta | null
  onSubmit: (dados: any) => void
  onCancel: () => void
}

const PropostaForm = ({ proposta, onSubmit, onCancel }: PropostaFormProps) => {
  const [formData, setFormData] = useState({
    cliente: '',
    clienteCnpj: '',
    clienteEndereco: '',
    clienteNumero: '',
    clienteBairro: '',
    clienteCidade: '',
    clienteCep: '',
    clienteEstado: '',
    clienteTelefone: '',
    clienteEmail: '',
    clienteNomeFantasia: '',
    produto: '',
    produtoCodigo: '',
    marca: '',
    categoria: '',
    unidadeMedida: 'unidade',
    valorUnitario: '',
    aliquotaIpi: '',
    quantidade: '',
    valor: '',
    desconto: '',
    descontoTipo: 'percentual' as 'percentual' | 'valor',
    valorFrete: '',
    condicoesPagamento: '',
    prazoEntrega: '',
    dataVencimento: '',
    tipoPedido: 'venda',
    transportadora: '',
    informacoesAdicionais: '',
    estrategiaRepresentacao: '',
    publicoAlvo: '',
    diferenciaisCompetitivos: '',
    descricao: '',
    observacoes: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (proposta) {
      setFormData({
        cliente: proposta.cliente,
        clienteCnpj: proposta.clienteCnpj || '',
        clienteEndereco: proposta.clienteEndereco || '',
        clienteNumero: proposta.clienteNumero || '',
        clienteBairro: proposta.clienteBairro || '',
        clienteCidade: proposta.clienteCidade || '',
        clienteCep: proposta.clienteCep || '',
        clienteEstado: proposta.clienteEstado || '',
        clienteTelefone: proposta.clienteTelefone || '',
        clienteEmail: proposta.clienteEmail || '',
        clienteNomeFantasia: proposta.clienteNomeFantasia || '',
        produto: proposta.produto || '',
        produtoCodigo: proposta.produtoCodigo || '',
        marca: proposta.marca || '',
        categoria: proposta.categoria || '',
        unidadeMedida: proposta.unidadeMedida || 'unidade',
        valorUnitario: proposta.valorUnitario?.toString() || '',
        aliquotaIpi: proposta.aliquotaIpi?.toString() || '',
        quantidade: proposta.quantidade?.toString() || '',
        valor: proposta.valor.toString(),
        desconto: proposta.desconto?.toString() || '',
        descontoTipo: proposta.descontoTipo || 'percentual',
        valorFrete: proposta.valorFrete?.toString() || '',
        condicoesPagamento: proposta.condicoesPagamento || '',
        prazoEntrega: proposta.prazoEntrega || '',
        dataVencimento: proposta.dataVencimento.split('T')[0],
        tipoPedido: proposta.tipoPedido || 'venda',
        transportadora: proposta.transportadora || '',
        informacoesAdicionais: proposta.informacoesAdicionais || '',
        estrategiaRepresentacao: proposta.estrategiaRepresentacao || '',
        publicoAlvo: proposta.publicoAlvo || '',
        diferenciaisCompetitivos: proposta.diferenciaisCompetitivos || '',
        descricao: proposta.descricao || '',
        observacoes: proposta.observacoes || ''
      })
    } else {
      setFormData({
        cliente: '',
        clienteCnpj: '',
        clienteEndereco: '',
        clienteNumero: '',
        clienteBairro: '',
        clienteCidade: '',
        clienteCep: '',
        clienteEstado: '',
        clienteTelefone: '',
        clienteEmail: '',
        clienteNomeFantasia: '',
        produto: '',
        produtoCodigo: '',
        marca: '',
        categoria: '',
        unidadeMedida: 'unidade',
        valorUnitario: '',
        aliquotaIpi: '',
        quantidade: '',
        valor: '',
        desconto: '',
        descontoTipo: 'percentual',
        valorFrete: '',
        condicoesPagamento: '',
        prazoEntrega: '',
        dataVencimento: '',
        tipoPedido: 'venda',
        transportadora: '',
        informacoesAdicionais: '',
        estrategiaRepresentacao: '',
        publicoAlvo: '',
        diferenciaisCompetitivos: '',
        descricao: '',
        observacoes: ''
      })
    }
  }, [proposta])

  // Calcula valor total automaticamente quando valorUnitario e quantidade são informados
  useEffect(() => {
    const valorUnit = parseFloat(formData.valorUnitario) || 0
    const qtd = parseFloat(formData.quantidade) || 0
    
    // Só calcula se ambos estiverem preenchidos
    if (valorUnit > 0 && qtd > 0) {
      let valorTotal = valorUnit * qtd

      if (formData.desconto) {
        const desconto = parseFloat(formData.desconto) || 0
        if (formData.descontoTipo === 'percentual' && desconto > 0) {
          valorTotal = valorTotal * (1 - desconto / 100)
        } else if (formData.descontoTipo === 'valor' && desconto > 0) {
          valorTotal = Math.max(0, valorTotal - desconto)
        }
      }

      const novoValor = valorTotal.toFixed(2)
      const valorAtual = parseFloat(formData.valor) || 0
      // Só atualiza se o valor calculado for diferente do atual (evita loop infinito)
      if (Math.abs(valorAtual - parseFloat(novoValor)) > 0.01) {
        setFormData(prev => ({ ...prev, valor: novoValor }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.valorUnitario, formData.quantidade, formData.desconto, formData.descontoTipo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit({
        ...formData,
        valor: parseFloat(formData.valor) || 0,
        valorUnitario: formData.valorUnitario ? parseFloat(formData.valorUnitario) : undefined,
        quantidade: formData.quantidade ? parseFloat(formData.quantidade) : undefined,
        desconto: formData.desconto ? parseFloat(formData.desconto) : undefined,
        aliquotaIpi: formData.aliquotaIpi ? parseFloat(formData.aliquotaIpi) : undefined,
        valorFrete: formData.valorFrete ? parseFloat(formData.valorFrete) : undefined
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGerarComIA = async () => {
    // Validação dos campos obrigatórios
    if (!formData.cliente || !formData.produto || !formData.marca || !formData.unidadeMedida || !formData.valorUnitario || !formData.quantidade) {
      alert('Por favor, preencha todos os campos obrigatórios:\n- Cliente\n- Produto\n- Marca\n- Unidade de Medida\n- Valor Unitário\n- Quantidade')
      return
    }

    setLoading(true)
    try {
      const propostaGerada = await apiService.gerarPropostaComIA({
        cliente: formData.cliente,
        produto: formData.produto,
        marca: formData.marca,
        unidadeMedida: formData.unidadeMedida,
        valorUnitario: parseFloat(formData.valorUnitario),
        quantidade: parseFloat(formData.quantidade)
      })

      // Preenche o formulário com os dados gerados pela IA
      setFormData(prev => ({
        ...prev,
        categoria: propostaGerada.categoria || prev.categoria,
        desconto: propostaGerada.desconto?.toString() || prev.desconto,
        descontoTipo: propostaGerada.descontoTipo || prev.descontoTipo,
        aliquotaIpi: propostaGerada.aliquotaIpi?.toString() || prev.aliquotaIpi,
        condicoesPagamento: propostaGerada.condicoesPagamento || prev.condicoesPagamento,
        prazoEntrega: propostaGerada.prazoEntrega || prev.prazoEntrega,
        estrategiaRepresentacao: propostaGerada.estrategiaRepresentacao || prev.estrategiaRepresentacao,
        publicoAlvo: propostaGerada.publicoAlvo || prev.publicoAlvo,
        diferenciaisCompetitivos: propostaGerada.diferenciaisCompetitivos || prev.diferenciaisCompetitivos,
        descricao: propostaGerada.descricao || prev.descricao,
        observacoes: propostaGerada.observacoes || prev.observacoes,
        valor: propostaGerada.valor?.toString() || prev.valor
      }))

      alert('Proposta gerada com sucesso! Revise os campos preenchidos pela IA e ajuste se necessário.')
    } catch (error: any) {
      console.error('Erro ao gerar proposta com IA:', error)
      let errorMessage = 'Erro ao gerar proposta com IA.'
      
      if (error.response?.status === 404) {
        errorMessage = 'Endpoint não encontrado. O backend precisa implementar POST /api/propostas/gerar-com-ia'
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Dados inválidos. Verifique os campos obrigatórios.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          {proposta ? 'Editar Proposta' : 'Nova Proposta'}
        </h3>
      </div>
      <form className="proposta-form" onSubmit={handleSubmit}>
        {/* Seção: Informações Básicas */}
        <div className="proposta-form-section">
          <h4 className="proposta-form-section-title">Informações Básicas</h4>
          <div className="proposta-form-row">
            <div className="proposta-form-group">
              <label className="proposta-form-label">Cliente *</label>
              <input
                type="text"
                className="input"
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                required
                placeholder="Nome do cliente ou rede"
              />
            </div>
            <div className="proposta-form-group">
              <label className="proposta-form-label">Data de Vencimento *</label>
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

        {/* Seção: Dados do Cliente */}
        <div className="proposta-form-section">
          <h4 className="proposta-form-section-title">Dados do Cliente</h4>
          <div className="proposta-form-row">
            <div className="proposta-form-group">
              <label className="proposta-form-label">CNPJ</label>
              <input
                type="text"
                className="input"
                value={formData.clienteCnpj}
                onChange={(e) => setFormData({ ...formData, clienteCnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="proposta-form-group">
              <label className="proposta-form-label">Nome Fantasia</label>
              <input
                type="text"
                className="input"
                value={formData.clienteNomeFantasia}
                onChange={(e) => setFormData({ ...formData, clienteNomeFantasia: e.target.value })}
                placeholder="Nome fantasia do cliente"
              />
            </div>
          </div>
          <div className="proposta-form-row">
            <div className="proposta-form-group" style={{ flex: 2 }}>
              <label className="proposta-form-label">Endereço</label>
              <input
                type="text"
                className="input"
                value={formData.clienteEndereco}
                onChange={(e) => setFormData({ ...formData, clienteEndereco: e.target.value })}
                placeholder="Rua, Avenida, etc"
              />
            </div>
            <div className="proposta-form-group">
              <label className="proposta-form-label">Número</label>
              <input
                type="text"
                className="input"
                value={formData.clienteNumero}
                onChange={(e) => setFormData({ ...formData, clienteNumero: e.target.value })}
                placeholder="Número"
              />
            </div>
            <div className="proposta-form-group">
              <label className="proposta-form-label">Bairro</label>
              <input
                type="text"
                className="input"
                value={formData.clienteBairro}
                onChange={(e) => setFormData({ ...formData, clienteBairro: e.target.value })}
                placeholder="Bairro"
              />
            </div>
          </div>
          <div className="proposta-form-row">
            <div className="proposta-form-group">
              <label className="proposta-form-label">Cidade</label>
              <input
                type="text"
                className="input"
                value={formData.clienteCidade}
                onChange={(e) => setFormData({ ...formData, clienteCidade: e.target.value })}
                placeholder="Cidade"
              />
            </div>
            <div className="proposta-form-group">
              <label className="proposta-form-label">Estado</label>
              <input
                type="text"
                className="input"
                value={formData.clienteEstado}
                onChange={(e) => setFormData({ ...formData, clienteEstado: e.target.value })}
                placeholder="UF"
                maxLength={2}
              />
            </div>
            <div className="proposta-form-group">
              <label className="proposta-form-label">CEP</label>
              <input
                type="text"
                className="input"
                value={formData.clienteCep}
                onChange={(e) => setFormData({ ...formData, clienteCep: e.target.value })}
                placeholder="00000-000"
              />
            </div>
          </div>
          <div className="proposta-form-row">
            <div className="proposta-form-group">
              <label className="proposta-form-label">Telefone</label>
              <input
                type="text"
                className="input"
                value={formData.clienteTelefone}
                onChange={(e) => setFormData({ ...formData, clienteTelefone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="proposta-form-group">
              <label className="proposta-form-label">E-mail</label>
              <input
                type="email"
                className="input"
                value={formData.clienteEmail}
                onChange={(e) => setFormData({ ...formData, clienteEmail: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
        </div>

        {/* Seção: Informações do Produto */}
        <div className="proposta-form-section">
          <h4 className="proposta-form-section-title">Informações do Produto</h4>
          <div className="proposta-form-row">
            <div className="proposta-form-group">
              <label className="proposta-form-label">Produto *</label>
              <input
                type="text"
                className="input"
                value={formData.produto}
                onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
                required
                placeholder="Nome do produto"
              />
            </div>
            <div className="proposta-form-group">
              <label className="proposta-form-label">Marca</label>
              <input
                type="text"
                className="input"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                placeholder="Marca do produto"
              />
            </div>
          </div>
          <div className="proposta-form-row">
            <div className="proposta-form-group">
              <label className="proposta-form-label">Categoria</label>
              <input
                type="text"
                className="input"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                placeholder="Ex: Alimentos, Bebidas, Limpeza, etc"
              />
            </div>
            <div className="proposta-form-group">
              <label className="proposta-form-label">Unidade de Medida</label>
              <select
                className="input"
                value={formData.unidadeMedida}
                onChange={(e) => setFormData({ ...formData, unidadeMedida: e.target.value })}
              >
                <option value="unidade">Unidade</option>
                <option value="kg">Quilograma (kg)</option>
                <option value="g">Grama (g)</option>
                <option value="litro">Litro (L)</option>
                <option value="ml">Mililitro (mL)</option>
                <option value="caixa">Caixa</option>
                <option value="pacote">Pacote</option>
                <option value="fardo">Fardo</option>
                <option value="duzia">Dúzia</option>
                <option value="metro">Metro (m)</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Seção: Valores e Quantidades */}
        <div className="proposta-form-section">
          <h4 className="proposta-form-section-title">Valores e Quantidades</h4>
          <div className="proposta-form-row">
            <div className="proposta-form-group">
              <label className="proposta-form-label">Valor Unitário (R$)</label>
              <input
                type="number"
                className="input"
                value={formData.valorUnitario}
                onChange={(e) => setFormData({ ...formData, valorUnitario: e.target.value })}
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
            <div className="proposta-form-group">
              <label className="proposta-form-label">Alíquota IPI (%)</label>
              <input
                type="number"
                className="input"
                value={formData.aliquotaIpi}
                onChange={(e) => setFormData({ ...formData, aliquotaIpi: e.target.value })}
                step="0.01"
                min="0"
                max="100"
                placeholder="0.00"
              />
            </div>
            <div className="proposta-form-group">
              <label className="proposta-form-label">Quantidade</label>
              <input
                type="number"
                className="input"
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                step="0.01"
                min="0"
                placeholder="0"
              />
            </div>
          </div>
          <div className="proposta-form-row">
            <div className="proposta-form-group">
              <label className="proposta-form-label">Desconto</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  className="input"
                  value={formData.desconto}
                  onChange={(e) => setFormData({ ...formData, desconto: e.target.value })}
                  step="0.01"
                  min="0"
                  placeholder="0"
                  style={{ flex: 1 }}
                />
                <select
                  className="input"
                  value={formData.descontoTipo}
                  onChange={(e) => setFormData({ ...formData, descontoTipo: e.target.value as 'percentual' | 'valor' })}
                  style={{ width: '120px' }}
                >
                  <option value="percentual">%</option>
                  <option value="valor">R$</option>
                </select>
              </div>
            </div>
            <div className="proposta-form-group">
              <label className="proposta-form-label">Valor Total (R$) *</label>
              <input
                type="number"
                className="input"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                required
                step="0.01"
                min="0"
                placeholder="0.00"
                readOnly={!!(formData.valorUnitario && formData.quantidade)}
                style={{ backgroundColor: formData.valorUnitario && formData.quantidade ? '#f5f5f5' : undefined }}
              />
              {formData.valorUnitario && formData.quantidade && (
                <small style={{ color: '#666', fontSize: '0.75rem' }}>Calculado automaticamente</small>
              )}
            </div>
          </div>
        </div>

        {/* Seção: Condições Comerciais */}
        <div className="proposta-form-section">
          <h4 className="proposta-form-section-title">Condições Comerciais</h4>
          <div className="proposta-form-row">
            <div className="proposta-form-group">
              <label className="proposta-form-label">Condições de Pagamento</label>
              <input
                type="text"
                className="input"
                value={formData.condicoesPagamento}
                onChange={(e) => setFormData({ ...formData, condicoesPagamento: e.target.value })}
                placeholder="Ex: 30/60/90 dias, Boleto, Cartão, etc"
              />
            </div>
            <div className="proposta-form-group">
              <label className="proposta-form-label">Prazo de Entrega</label>
              <input
                type="text"
                className="input"
                value={formData.prazoEntrega}
                onChange={(e) => setFormData({ ...formData, prazoEntrega: e.target.value })}
                placeholder="Ex: 15 dias, Imediato, etc"
              />
            </div>
          </div>
        </div>

        {/* Seção: Estratégia de Representação */}
        <div className="proposta-form-section">
          <h4 className="proposta-form-section-title">Estratégia de Representação</h4>
          <div className="proposta-form-group">
            <label className="proposta-form-label">Estratégia de Representação</label>
            <textarea
              className="textarea"
              value={formData.estrategiaRepresentacao}
              onChange={(e) => setFormData({ ...formData, estrategiaRepresentacao: e.target.value })}
              placeholder="Descreva a estratégia que será adotada para representar este produto (ex: ações promocionais, parcerias, eventos, etc)"
              rows={3}
            />
          </div>
          <div className="proposta-form-group">
            <label className="proposta-form-label">Público-Alvo</label>
            <input
              type="text"
              className="input"
              value={formData.publicoAlvo}
              onChange={(e) => setFormData({ ...formData, publicoAlvo: e.target.value })}
              placeholder="Ex: Consumidores classe A/B, Famílias, Jovens, etc"
            />
          </div>
          <div className="proposta-form-group">
            <label className="proposta-form-label">Diferenciais Competitivos</label>
            <textarea
              className="textarea"
              value={formData.diferenciaisCompetitivos}
              onChange={(e) => setFormData({ ...formData, diferenciaisCompetitivos: e.target.value })}
              placeholder="Liste os principais diferenciais deste produto em relação à concorrência"
              rows={3}
            />
          </div>
        </div>

        {/* Seção: Informações Adicionais */}
        <div className="proposta-form-section">
          <h4 className="proposta-form-section-title">Informações Adicionais</h4>
          <div className="proposta-form-group">
            <label className="proposta-form-label">Descrição Geral</label>
            <textarea
              className="textarea"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descrição geral da proposta e produtos/serviços oferecidos"
              rows={4}
            />
          </div>
          <div className="proposta-form-group">
            <label className="proposta-form-label">Observações</label>
            <textarea
              className="textarea"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Observações adicionais sobre a proposta"
              rows={3}
            />
          </div>
        </div>

        <div className="proposta-form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleGerarComIA}
            disabled={loading}
          >
            🤖 Gerar com IA
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Salvando...' : proposta ? 'Atualizar' : 'Criar Proposta'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PropostaForm

