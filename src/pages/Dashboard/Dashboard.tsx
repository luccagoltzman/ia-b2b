import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../../services/apiService'
import StatCard from '../../components/StatCard/StatCard'
import RecentActivity from '../../components/RecentActivity/RecentActivity'
import QuickActions from '../../components/QuickActions/QuickActions'
import ProdutosInsights from '../../components/ProdutosInsights/ProdutosInsights'
import './Dashboard.scss'

interface DashboardStats {
  totalVisitas: number
  taxaConversao: number
  propostasPendentes: number
  receitaMensal: number
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const handleAnalisarProduto = (produto: string) => {
    navigate('/analises', { state: { produtoAnalise: produto } })
  }

  if (loading) {
    return <div className="loading-container">Carregando...</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Visão Geral</h2>
        <p className="text-secondary">Acompanhe suas métricas e performance</p>
      </div>

      <div className="dashboard-stats grid grid-4">
        <StatCard
          title="Total de Visitas"
          value={stats?.totalVisitas || 0}
          icon="📍"
          trend="+12%"
          trendPositive={true}
        />
        <StatCard
          title="Taxa de Conversão"
          value={`${stats?.taxaConversao || 0}%`}
          icon="📈"
          trend="+5.2%"
          trendPositive={true}
        />
        <StatCard
          title="Propostas Pendentes"
          value={stats?.propostasPendentes || 0}
          icon="📝"
          trend="-3"
          trendPositive={true}
        />
        <StatCard
          title="Receita Mensal"
          value={`R$ ${(stats?.receitaMensal || 0).toLocaleString('pt-BR')}`}
          icon="💰"
          trend="+18%"
          trendPositive={true}
        />
      </div>

      <div className="dashboard-content grid grid-2">
        <RecentActivity />
        <QuickActions />
      </div>

      <div className="dashboard-insights">
        <ProdutosInsights onAnalisarProduto={handleAnalisarProduto} />
      </div>
    </div>
  )
}

export default Dashboard

