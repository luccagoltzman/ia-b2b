import { useBenchmarks } from '../../hooks/useBenchmarks'
import { benchmarkService, Benchmark } from '../../services/benchmarkService'
import './BenchmarksCard.scss'

interface BenchmarksCardProps {
  categoria?: string
  tipoMetrica?: string
  titulo?: string
}

const BenchmarksCard = ({ 
  categoria, 
  tipoMetrica,
  titulo = 'Benchmarks do Setor'
}: BenchmarksCardProps) => {
  const { benchmarks, loading, error } = useBenchmarks({ categoria, tipoMetrica })

  if (loading) {
    return (
      <div className="benchmarks-card">
        <div className="benchmarks-header">
          <h3>{titulo}</h3>
        </div>
        <div className="loading-state">Carregando benchmarks...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="benchmarks-card">
        <div className="benchmarks-header">
          <h3>{titulo}</h3>
        </div>
        <div className="error-state">
          <p>Erro: {error}</p>
        </div>
      </div>
    )
  }

  if (benchmarks.length === 0) {
    return (
      <div className="benchmarks-card">
        <div className="benchmarks-header">
          <h3>{titulo}</h3>
        </div>
        <div className="empty-state">
          <p>⚠️ Nenhum benchmark disponível.</p>
          <p className="text-secondary">
            Execute a sincronização da InfoPrice para gerar benchmarks automaticamente.
          </p>
        </div>
      </div>
    )
  }

  // Agrupar por categoria
  const benchmarksAgrupados = benchmarks.reduce((acc, benchmark) => {
    const cat = benchmark.categoria || 'Geral'
    if (!acc[cat]) {
      acc[cat] = []
    }
    acc[cat].push(benchmark)
    return acc
  }, {} as Record<string, Benchmark[]>)

  return (
    <div className="benchmarks-card">
      <div className="benchmarks-header">
        <h3>{titulo}</h3>
        {categoria && (
          <span className="benchmark-filter-badge">{categoria}</span>
        )}
      </div>

      <div className="benchmarks-content">
        {Object.entries(benchmarksAgrupados).map(([categoriaNome, benchmarksCategoria]) => (
          <div key={categoriaNome} className="benchmark-category">
            <h4 className="category-title">{categoriaNome}</h4>
            <div className="benchmark-list">
              {benchmarksCategoria.map((benchmark) => (
                <div key={benchmark.id} className="benchmark-item">
                  <div className="benchmark-label">
                    {benchmarkService.formatarTipoMetrica(benchmark.tipoMetrica)}
                  </div>
                  <div className="benchmark-value">
                    {benchmarkService.formatarValor(benchmark)}
                  </div>
                  {benchmark.descricao && (
                    <div className="benchmark-description">
                      {benchmark.descricao}
                    </div>
                  )}
                  {benchmark.periodo && (
                    <div className="benchmark-period">
                      Período: {benchmark.periodo}
                    </div>
                  )}
                  {benchmark.fonte && (
                    <div className="benchmark-source">
                      Fonte: {benchmark.fonte}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BenchmarksCard

