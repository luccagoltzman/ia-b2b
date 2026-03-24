export interface PropostaClienteProduto {
  id: string
  produto: string
  produtoCodigo?: string
  marca?: string
  quantidade: number
  unidadeMedida?: string
  valorUnitario: number
  aliquotaIpi?: number
  desconto?: number
  descontoTipo?: 'percentual' | 'valor'
  valorUnitarioFinal?: number
  valorTotalFinal?: number
  apresentacaoTipo?: 'imagem' | 'pdf'
  apresentacaoUrl?: string
  apresentacaoNome?: string
}

export interface PropostaClienteInbox {
  id: string
  tabelaId?: string
  tabelaNome: string
  cliente: string
  clienteEmail?: string
  clienteTelefone?: string
  dataEnvio: string
  dataVencimento?: string
  status: 'enviada' | 'visualizada'
  decisaoCliente?: 'aceita_preco' | 'recusada_preco'
  decisaoData?: string
  decisaoObservacao?: string
  condicoesPagamento?: string
  prazoEntrega?: string
  observacoes?: string
  produtos: PropostaClienteProduto[]
}

const STORAGE_KEY = 'ia_b2b_cliente_inbox'
const STORAGE_KEY_REP = 'ia_b2b_representante_inbox'

const getAll = (): PropostaClienteInbox[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveAll = (items: PropostaClienteInbox[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

const getAllRep = (): PropostaClienteInbox[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REP)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveAllRep = (items: PropostaClienteInbox[]) => {
  localStorage.setItem(STORAGE_KEY_REP, JSON.stringify(items))
}

export const clienteAreaService = {
  listarPropostas() {
    return getAll().sort((a, b) => new Date(b.dataEnvio).getTime() - new Date(a.dataEnvio).getTime())
  },

  listarClientes() {
    const set = new Set<string>()
    for (const item of getAll()) {
      if (item.cliente) set.add(item.cliente)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  },

  listarPorCliente(cliente: string) {
    return this.listarPropostas().filter((p) => p.cliente.toLowerCase() === cliente.toLowerCase())
  },

  registrarEnvio(tabela: any, cliente: any) {
    const clienteNome = typeof cliente === 'string' ? cliente : cliente?.nome
    if (!clienteNome) return

    const inboxItem: PropostaClienteInbox = {
      id: `${tabela.id || 'tab'}-${clienteNome}-${Date.now()}`,
      tabelaId: tabela.id,
      tabelaNome: tabela.nome || 'Tabela sem nome',
      cliente: clienteNome,
      clienteEmail: typeof cliente === 'object' ? cliente?.email : undefined,
      clienteTelefone: typeof cliente === 'object' ? cliente?.telefone : undefined,
      dataEnvio: new Date().toISOString(),
      dataVencimento: tabela.dataVencimento,
      status: 'enviada',
      condicoesPagamento: tabela.condicoesPagamento,
      prazoEntrega: tabela.prazoEntrega,
      observacoes: tabela.observacoes,
      produtos: (tabela.produtos || []).map((p: any, index: number) => ({
        // Reproduz o cálculo da proposta para mostrar ao cliente os detalhes da negociação
        // (preço base, IPI, desconto aplicado e preço final)
        id: p.id || `${index + 1}`,
        produto: p.produto,
        produtoCodigo: p.produtoCodigo,
        marca: p.marca,
        quantidade: Number(p.quantidade || 0),
        unidadeMedida: p.unidadeMedida,
        valorUnitario: Number(p.valorUnitario || 0),
        aliquotaIpi: Number(p.aliquotaIpi || 0),
        desconto: Number(p.desconto || 0),
        descontoTipo: p.descontoTipo,
        valorUnitarioFinal: (() => {
          let v = Number(p.valorUnitario || 0)
          if (p.aliquotaIpi) v = v * (1 + Number(p.aliquotaIpi) / 100)
          if (p.desconto) {
            if (p.descontoTipo === 'percentual') v = v * (1 - Number(p.desconto) / 100)
            else v = Math.max(0, v - Number(p.desconto))
          }
          return Number(v.toFixed(2))
        })(),
        valorTotalFinal: (() => {
          let v = Number(p.valorUnitario || 0)
          if (p.aliquotaIpi) v = v * (1 + Number(p.aliquotaIpi) / 100)
          if (p.desconto) {
            if (p.descontoTipo === 'percentual') v = v * (1 - Number(p.desconto) / 100)
            else v = Math.max(0, v - Number(p.desconto))
          }
          return Number((v * Number(p.quantidade || 0)).toFixed(2))
        })(),
        apresentacaoTipo: p.apresentacaoTipo,
        apresentacaoUrl: p.apresentacaoUrl,
        apresentacaoNome: p.apresentacaoNome
      }))
    }

    const items = getAll()
    items.push(inboxItem)
    saveAll(items)
  },

  marcarComoVisualizada(id: string) {
    const items = getAll().map((item) => (item.id === id ? { ...item, status: 'visualizada' as const } : item))
    saveAll(items)
  },

  registrarDecisao(
    id: string,
    decisao: 'aceita_preco' | 'recusada_preco',
    observacao?: string
  ) {
    const now = new Date().toISOString()
    const atuais = getAll()
    const item = atuais.find((x) => x.id === id)
    if (!item) return

    const atualizado: PropostaClienteInbox = {
      ...item,
      status: 'visualizada',
      decisaoCliente: decisao,
      decisaoData: now,
      decisaoObservacao: observacao?.trim() || undefined
    }

    // Remove da área do cliente
    saveAll(atuais.filter((x) => x.id !== id))

    // Envia para a caixa do representante
    const rep = getAllRep()
    rep.unshift(atualizado)
    saveAllRep(rep)
  },

  listarRetornosRepresentante() {
    return getAllRep().sort((a, b) => new Date(b.decisaoData || b.dataEnvio).getTime() - new Date(a.decisaoData || a.dataEnvio).getTime())
  },

  limparRetornoRepresentante(id: string) {
    saveAllRep(getAllRep().filter((x) => x.id !== id))
  }
}

