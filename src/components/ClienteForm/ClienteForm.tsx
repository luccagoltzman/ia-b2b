import { useState, useEffect } from 'react'
import './ClienteForm.scss'

export interface Cliente {
  id: string
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
}

export type ClienteFormDados = {
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
}

interface ClienteFormProps {
  cliente?: Cliente | null
  /** Nome sugerido ao abrir o formulário para novo cliente (ex.: vindo do prompt de proposta) */
  initialNome?: string
  onSubmit: (dados: ClienteFormDados) => void
  onCancel: () => void
}

const defaultForm = (): ClienteFormDados & Record<string, string> => ({
  nome: '',
  email: '',
  telefone: '',
  empresa: '',
  cnpj: '',
  endereco: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
  inscricaoEstadual: ''
})

const ClienteForm = ({ cliente, initialNome, onSubmit, onCancel }: ClienteFormProps) => {
  const [formData, setFormData] = useState(defaultForm())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome,
        email: cliente.email || '',
        telefone: cliente.telefone || '',
        empresa: cliente.empresa || '',
        cnpj: cliente.cnpj || '',
        endereco: cliente.endereco || '',
        numero: cliente.numero || '',
        bairro: cliente.bairro || '',
        cidade: cliente.cidade || '',
        estado: cliente.estado || '',
        cep: cliente.cep || '',
        inscricaoEstadual: cliente.inscricaoEstadual || ''
      })
    } else {
      const nome = (initialNome || '').trim()
      setFormData({ ...defaultForm(), nome })
    }
  }, [cliente, initialNome])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome.trim()) {
      alert('Informe o nome do cliente.')
      return
    }
    setLoading(true)
    try {
      await onSubmit({
        nome: formData.nome.trim(),
        email: formData.email.trim() || undefined,
        telefone: formData.telefone.trim() || undefined,
        empresa: formData.empresa.trim() || undefined,
        cnpj: formData.cnpj.trim() || undefined,
        endereco: formData.endereco.trim() || undefined,
        numero: formData.numero.trim() || undefined,
        bairro: formData.bairro.trim() || undefined,
        cidade: formData.cidade.trim() || undefined,
        estado: formData.estado.trim() || undefined,
        cep: formData.cep.trim() || undefined,
        inscricaoEstadual: formData.inscricaoEstadual.trim() || undefined
      })
    } finally {
      setLoading(false)
    }
  }

  const update = (key: keyof typeof formData, value: string) =>
    setFormData(prev => ({ ...prev, [key]: value }))

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{cliente ? 'Editar Cliente' : 'Novo Cliente'}</h3>
      </div>
      <form className="cliente-form" onSubmit={handleSubmit}>
        <div className="cliente-form-section">
          <h4 className="cliente-form-section-title">Identificação</h4>
          <div className="cliente-form-row">
            <div className="cliente-form-group">
              <label className="cliente-form-label">Nome / Nome fantasia *</label>
              <input
                type="text"
                className="input"
                value={formData.nome}
                onChange={(e) => update('nome', e.target.value)}
                required
                placeholder="Nome do contato ou nome fantasia"
              />
            </div>
            <div className="cliente-form-group">
              <label className="cliente-form-label">Razão social / Empresa</label>
              <input
                type="text"
                className="input"
                value={formData.empresa}
                onChange={(e) => update('empresa', e.target.value)}
                placeholder="Razão social da empresa"
              />
            </div>
            <div className="cliente-form-group cliente-form-group-cnpj">
              <label className="cliente-form-label">CNPJ</label>
              <input
                type="text"
                className="input"
                value={formData.cnpj}
                onChange={(e) => update('cnpj', e.target.value)}
                placeholder="00.000.000/0001-00"
              />
            </div>
          </div>
          <div className="cliente-form-row">
            <div className="cliente-form-group">
              <label className="cliente-form-label">Inscrição estadual</label>
              <input
                type="text"
                className="input"
                value={formData.inscricaoEstadual}
                onChange={(e) => update('inscricaoEstadual', e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>
        </div>

        <div className="cliente-form-section">
          <h4 className="cliente-form-section-title">Contato</h4>
          <div className="cliente-form-row">
            <div className="cliente-form-group">
              <label className="cliente-form-label">Email</label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="cliente-form-group">
              <label className="cliente-form-label">Telefone / WhatsApp</label>
              <input
                type="tel"
                className="input"
                value={formData.telefone}
                onChange={(e) => update('telefone', e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
        </div>

        <div className="cliente-form-section">
          <h4 className="cliente-form-section-title">Endereço</h4>
          <div className="cliente-form-row">
            <div className="cliente-form-group">
              <label className="cliente-form-label">Logradouro</label>
              <input
                type="text"
                className="input"
                value={formData.endereco}
                onChange={(e) => update('endereco', e.target.value)}
                placeholder="Rua, avenida..."
              />
            </div>
            <div className="cliente-form-group cliente-form-group-numero">
              <label className="cliente-form-label">Número</label>
              <input
                type="text"
                className="input"
                value={formData.numero}
                onChange={(e) => update('numero', e.target.value)}
                placeholder="Nº"
              />
            </div>
            <div className="cliente-form-group">
              <label className="cliente-form-label">Bairro</label>
              <input
                type="text"
                className="input"
                value={formData.bairro}
                onChange={(e) => update('bairro', e.target.value)}
                placeholder="Bairro"
              />
            </div>
          </div>
          <div className="cliente-form-row">
            <div className="cliente-form-group">
              <label className="cliente-form-label">Cidade</label>
              <input
                type="text"
                className="input"
                value={formData.cidade}
                onChange={(e) => update('cidade', e.target.value)}
                placeholder="Cidade"
              />
            </div>
            <div className="cliente-form-group cliente-form-group-estado">
              <label className="cliente-form-label">Estado</label>
              <input
                type="text"
                className="input"
                value={formData.estado}
                onChange={(e) => update('estado', e.target.value)}
                placeholder="UF"
                maxLength={2}
              />
            </div>
            <div className="cliente-form-group cliente-form-group-cep">
              <label className="cliente-form-label">CEP</label>
              <input
                type="text"
                className="input"
                value={formData.cep}
                onChange={(e) => update('cep', e.target.value)}
                placeholder="00000-000"
              />
            </div>
          </div>
        </div>

        <div className="cliente-form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : cliente ? 'Salvar' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ClienteForm
