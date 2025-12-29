import { useState } from 'react'
import AnaliseForm from '../../components/AnaliseForm/AnaliseForm'
import AnaliseResult from '../../components/AnaliseResult/AnaliseResult'
import { apiService } from '../../services/apiService'
import './Analises.scss'

interface AnaliseData {
  tipo: string
  dados: any
  resultado?: string
}

const Analises = () => {
  const [analiseData, setAnaliseData] = useState<AnaliseData | null>(null)
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="analises">
      <div className="analises-header">
        <h2>Análises Inteligentes</h2>
        <p className="text-secondary">
          Use IA para analisar dados e obter insights valiosos para suas negociações
        </p>
      </div>

      <div className="analises-content">
        <div className="analises-form-section">
          <AnaliseForm onSubmit={handleAnaliseSubmit} loading={loading} />
        </div>

        {analiseData?.resultado && (
          <div className="analises-result-section">
            <AnaliseResult data={analiseData} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Analises

