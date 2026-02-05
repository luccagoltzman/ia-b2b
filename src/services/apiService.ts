import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token se necessário
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const apiService = {
  // Dashboard
  async getDashboardStats() {
    const response = await api.get('/dashboard/stats')
    return response.data
  },

  async getRecentActivities() {
    const response = await api.get('/dashboard/activities')
    return response.data
  },

  // Análises
  async gerarAnalise(tipo: string, dados: any) {
    const response = await api.post('/analises/gerar', {
      tipo,
      dados,
    })
    return response.data.resultado
  },

  // Propostas
  async getPropostas() {
    const response = await api.get('/propostas')
    return response.data
  },

  async getPropostaDetalhes(id: string) {
    const response = await api.get(`/propostas/${id}`)
    return response.data
  },

  async createProposta(dados: any) {
    const response = await api.post('/propostas', dados)
    return response.data
  },

  async updateProposta(id: string, dados: any) {
    const response = await api.put(`/propostas/${id}`, dados)
    return response.data
  },

  async updatePropostaStatus(id: string, status: string, descricao?: string) {
    try {
      const response = await api.post(`/propostas/${id}/status`, {
        status,
        descricao: descricao || null
      })
      return response.data
    } catch (error: any) {
      // Se o endpoint não existir (404) ou houver erro 400, lançar erro mais descritivo
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.error || 'Erro ao atualizar status'
        throw new Error(message)
      }
      throw error
    }
  },

  async deleteProposta(id: string) {
    const response = await api.delete(`/propostas/${id}`)
    return response.data
  },

  async gerarPropostaComIA(dadosBasicos: {
    cliente: string
    produto: string
    marca: string
    unidadeMedida: string
    valorUnitario: number
    quantidade: number
  }) {
    const response = await api.post('/propostas/gerar-com-ia', dadosBasicos)
    return response.data
  },

  // Clientes
  async getClientes() {
    const response = await api.get('/clientes')
    return response.data
  },

  async getCliente(id: string) {
    const response = await api.get(`/clientes/${id}`)
    return response.data
  },

  async createCliente(dados: {
    nome: string
    email?: string
    telefone?: string
    empresa?: string
    cnpj?: string
    endereco?: string
    numero?: string
    bairro?: string
    cidade?: string
    estado?: string
    cep?: string
    inscricaoEstadual?: string
  }) {
    const response = await api.post('/clientes', dados)
    return response.data
  },

  async updateCliente(id: string, dados: {
    nome?: string
    email?: string
    telefone?: string
    empresa?: string
    cnpj?: string
    endereco?: string
    numero?: string
    bairro?: string
    cidade?: string
    estado?: string
    cep?: string
    inscricaoEstadual?: string
  }) {
    const response = await api.put(`/clientes/${id}`, dados)
    return response.data
  },

  async deleteCliente(id: string) {
    const response = await api.delete(`/clientes/${id}`)
    return response.data
  },

  // Visitas
  async getVisitas() {
    const response = await api.get('/visitas')
    return response.data
  },

  async getVisitaDetalhes(id: string) {
    const response = await api.get(`/visitas/${id}`)
    return response.data
  },

  async createVisita(dados: any) {
    const response = await api.post('/visitas', dados)
    return response.data
  },

  async updateVisita(id: string, dados: any) {
    const response = await api.put(`/visitas/${id}`, dados)
    return response.data
  },

  async updateVisitaStatus(id: string, status: string, descricao?: string) {
    try {
      const response = await api.post(`/visitas/${id}/status`, {
        status,
        descricao: descricao || null
      })
      return response.data
    } catch (error: any) {
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.error || 'Erro ao atualizar status'
        throw new Error(message)
      }
      throw error
    }
  },

  async deleteVisita(id: string) {
    const response = await api.delete(`/visitas/${id}`)
    return response.data
  },

  // Pós-Venda
  async analisarSaidaProduto(dados: {
    propostaId: string
    cliente: string
    produto: string
    marca: string
    quantidadeVendida: number
    periodoAnalise: string
    observacoes?: string
    posicionamento?: string
    concorrencia?: string
    precoAtual?: number
  }) {
    const response = await api.post('/pos-venda/analisar-saida', dados)
    return response.data
  },

  async getHistoricoAnalises(propostaId: string) {
    const response = await api.get(`/pos-venda/historico/${propostaId}`)
    return response.data
  },

  // Análise de Produtos
  async getProdutosInsights() {
    const response = await api.get('/analises/produtos/insights')
    return response.data
  },

  async analisarProduto(produto: string, dadosAdicionais?: any) {
    const response = await api.post('/analises/produtos/analisar', {
      produto,
      ...dadosAdicionais
    })
    return response.data
  },

  // Mercado e Benchmarks
  async getBenchmarks(filtros?: {
    categoria?: string
    tipoMetrica?: string
  }) {
    const params = new URLSearchParams()
    if (filtros?.categoria) {
      params.append('categoria', filtros.categoria)
    }
    if (filtros?.tipoMetrica) {
      params.append('tipoMetrica', filtros.tipoMetrica)
    }
    const queryString = params.toString()
    const url = `/mercado/benchmarks${queryString ? `?${queryString}` : ''}`
    const response = await api.get(url)
    return response.data
  },

  async getPrecosMercado(filtros?: {
    produto?: string
    marca?: string
    categoria?: string
    regiao?: string
  }) {
    const params = new URLSearchParams()
    if (filtros?.produto) params.append('produto', filtros.produto)
    if (filtros?.marca) params.append('marca', filtros.marca)
    if (filtros?.categoria) params.append('categoria', filtros.categoria)
    if (filtros?.regiao) params.append('regiao', filtros.regiao)
    const queryString = params.toString()
    const url = `/mercado/precos${queryString ? `?${queryString}` : ''}`
    const response = await api.get(url)
    return response.data
  },

  async sincronizarInfoPrice(dias: number = 30) {
    const response = await api.post('/infoprice/sincronizar/ultimos-dias', { dias })
    return response.data
  },

  async getInfoPriceConfiguracao() {
    const response = await api.get('/infoprice/configuracao')
    return response.data
  },

  // Tabelas de Produtos
  async getTabelasProdutos() {
    const response = await api.get('/tabelas-produtos')
    return response.data
  },

  async getTabelaProdutosDetalhes(id: string) {
    const response = await api.get(`/tabelas-produtos/${id}`)
    return response.data
  },

  async createTabelaProdutos(dados: any) {
    const response = await api.post('/tabelas-produtos', dados)
    return response.data
  },

  async updateTabelaProdutos(id: string, dados: any) {
    const response = await api.put(`/tabelas-produtos/${id}`, dados)
    return response.data
  },

  async deleteTabelaProdutos(id: string) {
    const response = await api.delete(`/tabelas-produtos/${id}`)
    return response.data
  },

  async enviarTabelaParaClientes(id: string, clientes?: string[]) {
    // Se clientes for um array vazio ou undefined, não enviar o campo
    // para que o backend use os clientes da tabela
    const body = clientes && clientes.length > 0 ? { clientes } : {}
    const response = await api.post(`/tabelas-produtos/${id}/enviar`, body)
    return response.data
  },

  async gerarPropostaDefinitiva(tabelaId: string, cliente: string, selecoes: any[]) {
    const response = await api.post(`/tabelas-produtos/${tabelaId}/gerar-proposta`, {
      cliente,
      selecoes
    })
    return response.data
  },

  // IA – Proposta por prompt
  async interpretarPromptProposta(prompt: string): Promise<{
    cliente: string
    clienteId?: string
    quantidadeProdutos?: number
    produtosSugeridos?: Array<{
      produto: string
      marca?: string
      quantidade?: number
      valorUnitario?: number
      unidadeMedida?: string
    }>
    acao?: 'criar' | 'criar_e_enviar'
    nomeTabela?: string
  }> {
    const response = await api.post('/ia/proposta-por-prompt', { prompt })
    return response.data
  },
}

