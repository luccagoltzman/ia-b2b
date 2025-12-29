import { useState } from 'react'
import './Configuracoes.scss'

const Configuracoes = () => {
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // Esta função será implementada no backend
    localStorage.setItem('apiKey', apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="configuracoes">
      <div className="configuracoes-header">
        <h2>Configurações</h2>
        <p className="text-secondary">
          Configure suas preferências e integrações
        </p>
      </div>

      <div className="configuracoes-content">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Integração com IA</h3>
          </div>
          <div className="configuracoes-form">
            <div className="configuracoes-form-group">
              <label className="configuracoes-form-label">
                API Key do ChatGPT (Opcional)
              </label>
              <input
                type="password"
                className="input"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
              <p className="configuracoes-form-help">
                Se não fornecer, o backend usará a API key configurada no servidor
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleSave}
            >
              {saved ? '✓ Salvo!' : 'Salvar Configurações'}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Sobre o Sistema</h3>
          </div>
          <div className="configuracoes-info">
            <p>
              <strong>IA B2B</strong> - Sistema inteligente para representantes comerciais
            </p>
            <p className="text-secondary">
              Versão 1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Configuracoes

