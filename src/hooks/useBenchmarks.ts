import { useState, useEffect } from 'react'
import { benchmarkService, Benchmark } from '../services/benchmarkService'

export const useBenchmarks = (filtros?: {
  categoria?: string
  tipoMetrica?: string
}) => {
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregarBenchmarks = async () => {
    try {
      setLoading(true)
      setError(null)
      const dados = await benchmarkService.obterBenchmarks(filtros)
      setBenchmarks(dados)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao carregar benchmarks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarBenchmarks()
  }, [filtros?.categoria, filtros?.tipoMetrica])

  return { 
    benchmarks, 
    loading, 
    error, 
    refetch: carregarBenchmarks 
  }
}

