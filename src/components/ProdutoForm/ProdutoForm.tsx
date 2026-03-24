import { useState, useEffect } from 'react'
import './ProdutoForm.scss'

export type ProdutoFormDados = {
  produto: string
  produtoCodigo?: string
  marca: string
  categoria?: string
  unidadeMedida: string
  valorUnitario: number
  aliquotaIpi?: number
  // Anexo de apresentação (opcional). Se não enviar, o backend mantém o atual (em update).
  apresentacaoArquivo?: File | null
  // Quando true, o backend deve remover a apresentação existente (se houver).
  apresentacaoRemover?: boolean
}

export interface Produto {
  id: string
  produto: string
  produtoCodigo?: string
  marca: string
  categoria?: string
  unidadeMedida: string
  valorUnitario: number
  aliquotaIpi?: number
  apresentacaoTipo?: 'imagem' | 'pdf'
  apresentacaoUrl?: string
  apresentacaoNome?: string
}

interface ProdutoFormProps {
  produto?: Produto | null
  onSubmit: (dados: ProdutoFormDados) => void
  onCancel: () => void
}

const defaultDados = (): ProdutoFormDados => ({
  produto: '',
  produtoCodigo: '',
  marca: '',
  categoria: '',
  unidadeMedida: 'unidade',
  valorUnitario: 0,
  aliquotaIpi: 0,
  apresentacaoArquivo: null,
  apresentacaoRemover: false
})

const ProdutoForm = ({ produto, onSubmit, onCancel }: ProdutoFormProps) => {
  const [formData, setFormData] = useState<ProdutoFormDados>(defaultDados())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (produto) {
      setFormData({
        produto: produto.produto || '',
        produtoCodigo: produto.produtoCodigo || '',
        marca: produto.marca || '',
        categoria: produto.categoria || '',
        unidadeMedida: produto.unidadeMedida || 'unidade',
        valorUnitario: Number(produto.valorUnitario ?? 0),
        aliquotaIpi: Number(produto.aliquotaIpi ?? 0),
        apresentacaoArquivo: null,
        apresentacaoRemover: false
      })
    } else {
      setFormData(defaultDados())
    }
  }, [produto])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.produto.trim()) {
      alert('Informe o nome do produto.')
      return
    }

    if (!formData.marca.trim()) {
      alert('Informe a marca do produto.')
      return
    }

    if (!Number.isFinite(formData.valorUnitario) || formData.valorUnitario < 0) {
      alert('Informe um valor unitário válido.')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        produto: formData.produto.trim(),
        produtoCodigo: formData.produtoCodigo?.trim() || undefined,
        marca: formData.marca.trim(),
        categoria: formData.categoria?.trim() || undefined,
        unidadeMedida: formData.unidadeMedida,
        valorUnitario: Number(formData.valorUnitario),
        aliquotaIpi: Number(formData.aliquotaIpi ?? 0),
        apresentacaoArquivo: formData.apresentacaoArquivo || undefined,
        apresentacaoRemover: !!formData.apresentacaoRemover
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{produto ? 'Editar Produto' : 'Novo Produto'}</h3>
      </div>
      <form className="produto-form" onSubmit={handleSubmit}>
        <div className="produto-form-row">
          <div className="produto-form-group">
            <label className="produto-form-label">Produto *</label>
            <input
              type="text"
              className="input"
              value={formData.produto}
              onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
              required
              placeholder="Nome do produto"
            />
          </div>
          <div className="produto-form-group">
            <label className="produto-form-label">Código</label>
            <input
              type="text"
              className="input"
              value={formData.produtoCodigo || ''}
              onChange={(e) => setFormData({ ...formData, produtoCodigo: e.target.value })}
              placeholder="Código do produto"
            />
          </div>
        </div>

        <div className="produto-form-row">
          <div className="produto-form-group">
            <label className="produto-form-label">Marca *</label>
            <input
              type="text"
              className="input"
              value={formData.marca}
              onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
              required
              placeholder="Marca"
            />
          </div>
          <div className="produto-form-group">
            <label className="produto-form-label">Categoria</label>
            <input
              type="text"
              className="input"
              value={formData.categoria || ''}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              placeholder="Categoria"
            />
          </div>
        </div>

        <div className="produto-form-row">
          <div className="produto-form-group">
            <label className="produto-form-label">Unidade de Medida</label>
            <select
              className="input"
              value={formData.unidadeMedida || 'unidade'}
              onChange={(e) => setFormData({ ...formData, unidadeMedida: e.target.value })}
            >
              <option value="unidade">Unidade</option>
              <option value="kg">Quilograma (kg)</option>
              <option value="g">Grama (g)</option>
              <option value="litro">Litro (L)</option>
              <option value="ml">Mililitro (mL)</option>
              <option value="caixa">Caixa</option>
              <option value="pacote">Pacote</option>
              <option value="fardo">Fardo</option>
            </select>
          </div>
          <div className="produto-form-group">
            <label className="produto-form-label">Valor Unitário (R$) *</label>
            <input
              type="number"
              className="input"
              value={formData.valorUnitario === 0 ? '' : formData.valorUnitario}
              onChange={(e) => setFormData({ ...formData, valorUnitario: parseFloat(e.target.value) || 0 })}
              step="0.01"
              min="0"
              required
              placeholder="0.00"
            />
          </div>
          <div className="produto-form-group">
            <label className="produto-form-label">Alíquota IPI (%)</label>
            <input
              type="number"
              className="input"
              value={formData.aliquotaIpi === 0 ? '' : formData.aliquotaIpi}
              onChange={(e) => setFormData({ ...formData, aliquotaIpi: parseFloat(e.target.value) || 0 })}
              step="0.01"
              min="0"
              max="100"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="produto-form-section">
          <div className="produto-form-row">
            <div className="produto-form-group">
              <label className="produto-form-label">Apresentação do produto (opcional)</label>
              <input
                type="file"
                className="input"
                accept="image/*,application/pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null
                  setFormData({ ...formData, apresentacaoArquivo: f })
                }}
              />
              {produto?.apresentacaoUrl && !formData.apresentacaoArquivo && (
                <div className="produto-form-apresentacao-info">
                  <div>
                    <strong>Atual:</strong> {produto.apresentacaoTipo === 'pdf' ? 'PDF' : 'Imagem'}{' '}
                    {produto.apresentacaoNome ? `(${produto.apresentacaoNome})` : ''}
                  </div>
                  <label className="produto-form-apresentacao-remove">
                    <input
                      type="checkbox"
                      checked={!!formData.apresentacaoRemover}
                      onChange={(e) => setFormData({ ...formData, apresentacaoRemover: e.target.checked })}
                    />
                    Remover apresentação
                  </label>
                </div>
              )}
              {formData.apresentacaoArquivo && (
                <div className="produto-form-apresentacao-selected">
                  Arquivo selecionado: <strong>{formData.apresentacaoArquivo.name}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="produto-form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : produto ? 'Salvar' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProdutoForm

