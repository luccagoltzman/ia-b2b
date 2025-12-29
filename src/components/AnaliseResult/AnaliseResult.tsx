import './AnaliseResult.scss'

interface AnaliseResultProps {
  data: {
    tipo: string
    dados: any
    resultado: string
  }
}

const AnaliseResult = ({ data }: AnaliseResultProps) => {
  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      performance: 'Análise de Performance',
      concorrencia: 'Análise de Concorrência',
      tendencia: 'Análise de Tendências',
      oportunidade: 'Identificação de Oportunidades'
    }
    return labels[tipo] || tipo
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{getTipoLabel(data.tipo)}</h3>
      </div>
      <div className="analise-result">
        <div className="analise-result-content">
          {data.resultado.split('\n').map((paragraph, index) => (
            <p key={index} className="analise-result-paragraph">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="analise-result-actions">
          <button className="btn btn-secondary">Copiar Resultado</button>
          <button className="btn btn-primary">Exportar PDF</button>
        </div>
      </div>
    </div>
  )
}

export default AnaliseResult

