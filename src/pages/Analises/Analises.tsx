import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import AnaliseForm from '../../components/AnaliseForm/AnaliseForm'
import AnaliseResult from '../../components/AnaliseResult/AnaliseResult'
import BenchmarksCard from '../../components/BenchmarksCard/BenchmarksCard'
import InfoPriceSync from '../../components/InfoPriceSync/InfoPriceSync'
import { apiService } from '../../services/apiService'
import './Analises.scss'

interface AnaliseData {
  tipo: string
  dados: any
  resultado?: string
}

const Analises = () => {
  const location = useLocation()
  const [analiseData, setAnaliseData] = useState<AnaliseData | null>(null)
  const [loading, setLoading] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState<string | null>(null)
  const [mostrarBenchmarks, setMostrarBenchmarks] = useState(false)

  useEffect(() => {
    // Se veio do Dashboard com produto selecionado, fazer análise automática
    const produtoAnalise = (location.state as any)?.produtoAnalise
    if (produtoAnalise) {
      setProdutoSelecionado(produtoAnalise)
      handleAnalisarProduto(produtoAnalise)
    }
  }, [location])

  const handleAnaliseSubmit = async (tipo: string, dados: any) => {
    setLoading(true)
    try {
      const resultado = await apiService.gerarAnalise(tipo, dados)
      setAnaliseData({
        tipo,
        dados,
        resultado
      })
    } catch (error) {
      console.error('Erro ao gerar análise:', error)
      alert('Erro ao gerar análise. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnalisarProduto = async (produto: string) => {
    setLoading(true)
    setProdutoSelecionado(produto)
    try {
      const resultado = await apiService.analisarProduto(produto)
      setAnaliseData({
        tipo: 'produto',
        dados: { produto },
        resultado: resultado.analise || resultado.resultado || JSON.stringify(resultado, null, 2)
      })
    } catch (error: any) {
      console.error('Erro ao analisar produto:', error)
      alert(error.response?.data?.message || 'Erro ao analisar produto. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleSincronizado = () => {
    // Recarregar benchmarks após sincronização
    setMostrarBenchmarks(true)
  }

  return (
    <div className="analises">
      <div className="analises-header">
        <h2>Análises Inteligentes</h2>
        <p className="text-secondary">
          Use IA para analisar dados e obter insights valiosos para suas negociações
        </p>
      </div>

      {produtoSelecionado && (
        <div className="analises-produto-info">
          <p>
            <strong>Analisando produto:</strong> {produtoSelecionado}
          </p>
        </div>
      )}

      <div className="analises-content">
        <div className="analises-form-section">
          <AnaliseForm onSubmit={handleAnaliseSubmit} loading={loading} />
        </div>

        {analiseData?.resultado && (
          <div className="analises-result-section">
            <AnaliseResult data={{
              tipo: analiseData.tipo,
              dados: analiseData.dados,
              resultado: analiseData.resultado
            }} />
          </div>
        )}
      </div>

      <div className="analises-market-section">
        <div className="market-sync">
          <InfoPriceSync onSincronizado={handleSincronizado} />
        </div>

        <div className="market-benchmarks">
          <div className="benchmarks-toggle">
            <button
              className="btn-toggle-benchmarks"
              onClick={() => setMostrarBenchmarks(!mostrarBenchmarks)}
            >
              {mostrarBenchmarks ? 'Ocultar' : 'Mostrar'} Benchmarks do Setor
            </button>
          </div>

          {mostrarBenchmarks && (
            <>
              <BenchmarksCard titulo="Benchmarks Gerais" />
              {produtoSelecionado && (
                <BenchmarksCard 
                  categoria={produtoSelecionado} 
                  titulo={`Benchmarks - ${produtoSelecionado}`}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Analises

