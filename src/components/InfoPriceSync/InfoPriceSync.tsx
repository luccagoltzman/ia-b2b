import { useState, useEffect } from 'react'
import { apiService } from '../../services/apiService'
import './InfoPriceSync.scss'

interface InfoPriceSyncProps {
  onSincronizado?: () => void
}

const InfoPriceSync = ({ onSincronizado }: InfoPriceSyncProps) => {
  const [dias, setDias] = useState(30)
  const [sincronizando, setSincronizando] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [configuracao, setConfiguracao] = useState<any>(null)
  const [verificandoConfig, setVerificandoConfig] = useState(true)

  useEffect(() => {
    const verificarConfiguracao = async () => {
      try {
        setVerificandoConfig(true)
        const config = await apiService.getInfoPriceConfiguracao()
        setConfiguracao(config)
      } catch (error: any) {
        console.error('Erro ao verificar configuração:', error)
        setConfiguracao({ configurado: false })
      } finally {
        setVerificandoConfig(false)
      }
    }

    verificarConfiguracao()
  }, [])

  const sincronizar = async () => {
    try {
      setSincronizando(true)
      setErro(null)
      setResultado(null)

      const response = await apiService.sincronizarInfoPrice(dias)
      setResultado(response)

      // Notificar componente pai se necessário
      if (onSincronizado) {
        onSincronizado()
      }
    } catch (err: any) {
      setErro(err.response?.data?.message || err.message || 'Erro ao sincronizar dados da InfoPrice')
    } finally {
      setSincronizando(false)
    }
  }

  if (verificandoConfig) {
    return (
      <div className="infoprice-sync">
        <div className="loading-state">Verificando configuração...</div>
      </div>
    )
  }

  if (!configuracao?.configurado) {
    return (
      <div className="infoprice-sync">
        <div className="config-warning">
          <h3>⚠️ InfoPrice não configurado</h3>
          <p>Configure a API InfoPrice no backend para habilitar a sincronização de dados de mercado.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="infoprice-sync">
      <div className="sync-header">
        <h3>Sincronizar Dados da InfoPrice</h3>
        <p className="text-secondary">
          Sincronize dados de mercado e gere benchmarks automaticamente
        </p>
      </div>

      <div className="sync-controls">
        <div className="control-group">
          <label htmlFor="dias-sync">
            Últimos N dias:
          </label>
          <input
            id="dias-sync"
            type="number"
            min="1"
            max="90"
            value={dias}
            onChange={(e) => setDias(Math.max(1, Math.min(90, parseInt(e.target.value) || 30)))}
            disabled={sincronizando}
          />
        </div>

        <button 
          onClick={sincronizar} 
          disabled={sincronizando}
          className="btn-sync"
        >
          {sincronizando ? (
            <>
              <span className="spinner"></span>
              Sincronizando...
            </>
          ) : (
            'Sincronizar'
          )}
        </button>
      </div>

      {erro && (
        <div className="error-state">
          <strong>Erro:</strong> {erro}
        </div>
      )}

      {resultado && (
        <div className="resultado">
          <h4>✅ Sincronização Concluída</h4>
          <div className="resultado-stats">
            <div className="stat-item">
              <span className="stat-label">Total processado:</span>
              <span className="stat-value">{resultado.totalProcessados || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Preços cadastrados:</span>
              <span className="stat-value highlight">{resultado.precosCadastrados || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Benchmarks criados:</span>
              <span className="stat-value highlight">{resultado.benchmarksCadastrados || 0}</span>
            </div>
            {resultado.erros !== undefined && (
              <div className="stat-item">
                <span className="stat-label">Erros:</span>
                <span className={`stat-value ${resultado.erros > 0 ? 'error' : ''}`}>
                  {resultado.erros}
                </span>
              </div>
            )}
          </div>
          {resultado.mensagem && (
            <p className="resultado-mensagem">{resultado.mensagem}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default InfoPriceSync

