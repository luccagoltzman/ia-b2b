import { apiService } from './apiService'

export interface Benchmark {
  id: string
  categoria: string | null
  tipoMetrica: string
  valorBenchmark: number
  unidade: string | null
  descricao: string | null
  fonte: string | null
  periodo: string | null
  ativo: boolean
  createdAt: string
  updatedAt: string
}

export const benchmarkService = {
  /**
   * Busca todos os benchmarks
   */
  async obterBenchmarks(filtros?: {
    categoria?: string
    tipoMetrica?: string
  }): Promise<Benchmark[]> {
    return await apiService.getBenchmarks(filtros)
  },

  /**
   * Busca benchmarks agrupados por categoria
   */
  async obterBenchmarksAgrupados(): Promise<Record<string, Benchmark[]>> {
    const benchmarks = await this.obterBenchmarks()
    
    return benchmarks.reduce((acc, benchmark) => {
      const categoria = benchmark.categoria || 'Geral'
      if (!acc[categoria]) {
        acc[categoria] = []
      }
      acc[categoria].push(benchmark)
      return acc
    }, {} as Record<string, Benchmark[]>)
  },

  /**
   * Busca um benchmark específico
   */
  async obterBenchmark(
    categoria: string | null,
    tipoMetrica: string
  ): Promise<Benchmark | null> {
    const benchmarks = await this.obterBenchmarks({ 
      categoria: categoria || undefined, 
      tipoMetrica 
    })
    return benchmarks[0] || null
  },

  /**
   * Formata valor do benchmark para exibição
   */
  formatarValor(benchmark: Benchmark): string {
    const valor = benchmark.valorBenchmark
    const unidade = benchmark.unidade === 'percentual' ? '%' : 
                   benchmark.unidade === 'reais' ? 'R$' : 
                   benchmark.unidade || ''

    if (unidade === '%') {
      return `${valor.toFixed(2)}%`
    } else if (unidade === 'R$') {
      return `R$ ${valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    }
    
    return `${valor.toFixed(2)} ${unidade}`
  },

  /**
   * Formata nome do tipo de métrica para exibição
   */
  formatarTipoMetrica(tipoMetrica: string): string {
    return tipoMetrica
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }
}

