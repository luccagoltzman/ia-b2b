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
}

