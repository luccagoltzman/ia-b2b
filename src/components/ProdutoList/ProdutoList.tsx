import './ProdutoList.scss'

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

interface ProdutoListProps {
  produtos: Produto[]
  loading: boolean
  onRefresh: () => void
  onEdit: (produto: Produto) => void
  onDelete?: (produto: Produto) => void
}

const ProdutoList = ({ produtos, loading, onRefresh, onEdit, onDelete }: ProdutoListProps) => {
  if (loading) {
    return (
      <div className="card">
        <div className="produto-list-loading">Carregando produtos...</div>
      </div>
    )
  }

  if (produtos.length === 0) {
    return (
      <div className="card">
        <div className="produto-list-empty">
          <p>Nenhum produto cadastrado</p>
          <button className="btn btn-primary" onClick={onRefresh}>
            Atualizar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Produtos cadastrados</h3>
        <button className="btn btn-secondary" onClick={onRefresh}>
          Atualizar
        </button>
      </div>

      <div className="produto-list">
        <table className="produto-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Marca</th>
              <th>Unidade</th>
              <th>Valor Unit.</th>
              <th>Apresentação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto) => (
              <tr key={produto.id}>
                <td>
                  <strong>{produto.produto}</strong>
                  {produto.produtoCodigo && (
                    <div className="produto-table-sub">Cód: {produto.produtoCodigo}</div>
                  )}
                  {produto.categoria && (
                    <div className="produto-table-sub">{produto.categoria}</div>
                  )}
                </td>
                <td>{produto.marca}</td>
                <td>{produto.unidadeMedida}</td>
                <td>R$ {Number(produto.valorUnitario).toFixed(2)}</td>
                <td>
                  {produto.apresentacaoTipo ? (
                    <div className="produto-table-sub">
                      {produto.apresentacaoTipo === 'pdf' ? 'PDF' : 'Imagem'}
                    </div>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td>
                  <div className="produto-list-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onEdit(produto)}
                      title="Editar"
                    >
                      ✏️ Editar
                    </button>
                    {onDelete && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (window.confirm(`Excluir o produto "${produto.produto}"?`)) {
                            onDelete(produto)
                          }
                        }}
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="produto-list-mobile">
        {produtos.map((produto) => (
          <div key={produto.id} className="produto-card">
            <div className="produto-card-main">
              <strong className="produto-card-nome">{produto.produto}</strong>
              <div className="produto-card-sub">{produto.marca}</div>
              <div className="produto-card-sub">Unid: {produto.unidadeMedida}</div>
              <div className="produto-card-sub">R$ {Number(produto.valorUnitario).toFixed(2)}</div>
              {produto.apresentacaoTipo && (
                <div className="produto-card-sub">
                  Apresentação: {produto.apresentacaoTipo === 'pdf' ? 'PDF' : 'Imagem'}
                </div>
              )}
            </div>
            <div className="produto-card-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(produto)}>
                Editar
              </button>
              {onDelete && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    if (window.confirm(`Excluir "${produto.produto}"?`)) onDelete(produto)
                  }}
                >
                  Excluir
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProdutoList

