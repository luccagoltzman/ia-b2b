import { Fragment, useEffect, useMemo, useState } from 'react'
import { clienteAreaService, PropostaClienteInbox } from '../../services/clienteAreaService'
import './AreaCliente.scss'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const API_BASE_URL = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:5000/api'
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

const toAbsoluteAssetUrl = (url?: string) => {
  if (!url) return ''
  const raw = String(url).trim()
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  if (raw.startsWith('//')) return `http:${raw}`
  if (raw.startsWith('/')) return `${API_ORIGIN}${raw}`
  return `${API_ORIGIN}/${raw.replace(/^\/+/, '')}`
}

const AreaCliente = () => {
  const [clienteSelecionado, setClienteSelecionado] = useState<string>('')
  const [propostas, setPropostas] = useState<PropostaClienteInbox[]>([])
  const [observacaoPorProposta, setObservacaoPorProposta] = useState<Record<string, string>>({})
  const [produtoDetalheAberto, setProdutoDetalheAberto] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const all = clienteAreaService.listarPropostas()
    setPropostas(all)
    if (all.length > 0) {
      setClienteSelecionado(all[0].cliente)
    }
  }, [])

  const clientes = useMemo(() => clienteAreaService.listarClientes(), [propostas])
  const propostasCliente = useMemo(
    () => (clienteSelecionado ? propostas.filter((p) => p.cliente === clienteSelecionado) : []),
    [propostas, clienteSelecionado]
  )

  const handleOpenProposta = (id: string) => {
    clienteAreaService.marcarComoVisualizada(id)
    setPropostas(clienteAreaService.listarPropostas())
  }

  const handleDecisao = (id: string, decisao: 'aceita_preco' | 'recusada_preco') => {
    const obs = observacaoPorProposta[id]
    clienteAreaService.registrarDecisao(id, decisao, obs)
    setPropostas(clienteAreaService.listarPropostas())
  }

  const toggleDetalhesProduto = (key: string) => {
    setProdutoDetalheAberto((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleAbrirApresentacao = async (url?: string) => {
    const absoluteUrl = toAbsoluteAssetUrl(url)
    if (!absoluteUrl) {
      alert('Apresentação do produto não disponível.')
      return
    }

    try {
      const response = await fetch(absoluteUrl)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      window.open(objectUrl, '_blank', 'noopener,noreferrer')
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
    } catch {
      // fallback: tenta abrir URL absoluta diretamente
      window.open(absoluteUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="area-cliente">
      <div className="area-cliente-header">
        <div>
          <h2>Área do Cliente</h2>
          <p className="text-secondary">
            Simulação da visão do cliente ao receber propostas do representante.
          </p>
        </div>
      </div>

      <div className="card area-cliente-filtro">
        <div className="area-cliente-filtro-row">
          <label className="area-cliente-label">Cliente</label>
          <select
            className="input"
            value={clienteSelecionado}
            onChange={(e) => setClienteSelecionado(e.target.value)}
          >
            {clientes.length === 0 ? (
              <option value="">Nenhum cliente com proposta enviada</option>
            ) : (
              clientes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {propostasCliente.length === 0 ? (
        <div className="card area-cliente-empty">
          <p>Nenhuma proposta enviada para este cliente.</p>
          <p className="text-secondary">
            Envie uma proposta em Propostas &gt; Tabelas de Produtos para aparecer aqui.
          </p>
        </div>
      ) : (
        <div className="area-cliente-lista">
          {propostasCliente.map((proposta) => (
            <div key={proposta.id} className="card area-cliente-proposta">
              <div className="area-cliente-proposta-header">
                <div>
                  <h3>{proposta.tabelaNome}</h3>
                  <p className="text-secondary">
                    Enviada em {formatDate(proposta.dataEnvio)} · Validade:{' '}
                    {proposta.dataVencimento ? formatDate(proposta.dataVencimento) : '-'}
                  </p>
                  {proposta.decisaoCliente && (
                    <p className={`area-cliente-decisao area-cliente-decisao-${proposta.decisaoCliente}`}>
                      {proposta.decisaoCliente === 'aceita_preco'
                        ? 'Cliente aceitou a proposta com o preço enviado'
                        : 'Cliente não aceitou a proposta com o preço enviado'}
                      {proposta.decisaoData ? ` · ${formatDate(proposta.decisaoData)}` : ''}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className={`badge badge-${proposta.status === 'visualizada' ? 'success' : 'warning'}`}
                  onClick={() => handleOpenProposta(proposta.id)}
                >
                  {proposta.status === 'visualizada' ? 'Visualizada' : 'Nova'}
                </button>
              </div>

              <div className="area-cliente-table-wrapper">
                <table className="area-cliente-table">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Código</th>
                      <th>Marca</th>
                      <th>Qtd</th>
                      <th>Unid.</th>
                      <th>Preço Final</th>
                      <th>Apresentação</th>
                      <th>Detalhes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposta.produtos.map((p) => {
                      const detailKey = `${proposta.id}-${p.id}`
                      const aberto = !!produtoDetalheAberto[detailKey]
                      return (
                        <Fragment key={detailKey}>
                          <tr>
                            <td>{p.produto}</td>
                            <td>{p.produtoCodigo || '-'}</td>
                            <td>{p.marca || '-'}</td>
                            <td>{p.quantidade}</td>
                            <td>{p.unidadeMedida || '-'}</td>
                            <td>{formatCurrency(p.valorUnitarioFinal ?? p.valorUnitario)}</td>
                            <td>
                              {p.apresentacaoUrl ? (
                                <button
                                  type="button"
                                  className="area-cliente-link area-cliente-link-btn"
                                  onClick={() => handleAbrirApresentacao(p.apresentacaoUrl)}
                                >
                                  {p.apresentacaoTipo === 'pdf' ? 'Ver PDF' : 'Ver imagem'}
                                </button>
                              ) : (
                                <span className="text-secondary">—</span>
                              )}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => toggleDetalhesProduto(detailKey)}
                              >
                                {aberto ? 'Ocultar' : 'Ver detalhes'}
                              </button>
                            </td>
                          </tr>
                          {aberto && (
                            <tr className="area-cliente-produto-detail-row">
                              <td colSpan={9}>
                                <div className="area-cliente-produto-detail">
                                  <div><strong>Preço base:</strong> {formatCurrency(p.valorUnitario)}</div>
                                  <div>
                                    <strong>IPI:</strong>{' '}
                                    {p.aliquotaIpi ? `${p.aliquotaIpi}%` : 'Não aplicado'}
                                  </div>
                                  <div>
                                    <strong>Desconto aplicado:</strong>{' '}
                                    {p.desconto
                                      ? p.descontoTipo === 'percentual'
                                        ? `${p.desconto}%`
                                        : formatCurrency(p.desconto)
                                      : 'Sem desconto'}
                                  </div>
                                  <div>
                                    <strong>Preço final unitário:</strong> {formatCurrency(p.valorUnitarioFinal ?? p.valorUnitario)}
                                  </div>
                                  <div>
                                    <strong>Preço final total:</strong> {formatCurrency(p.valorTotalFinal ?? (p.valorUnitario * p.quantidade))}
                                  </div>
                                  <div>
                                    <strong>Apresentação do produto:</strong>{' '}
                                    {p.apresentacaoTipo
                                      ? p.apresentacaoTipo === 'pdf'
                                        ? 'PDF'
                                        : 'Imagem'
                                      : 'Não informada'}
                                    {p.apresentacaoNome ? ` · ${p.apresentacaoNome}` : ''}
                                    {p.apresentacaoUrl && (
                                      <>
                                        {' '}
                                        ·{' '}
                                        <button
                                          type="button"
                                          className="area-cliente-link area-cliente-link-btn"
                                          onClick={() => handleAbrirApresentacao(p.apresentacaoUrl)}
                                        >
                                          Abrir apresentação
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {(proposta.condicoesPagamento || proposta.prazoEntrega || proposta.observacoes) && (
                <div className="area-cliente-info">
                  {proposta.condicoesPagamento && <p><strong>Pagamento:</strong> {proposta.condicoesPagamento}</p>}
                  {proposta.prazoEntrega && <p><strong>Entrega:</strong> {proposta.prazoEntrega}</p>}
                  {proposta.observacoes && <p><strong>Observações:</strong> {proposta.observacoes}</p>}
                </div>
              )}

              <div className="area-cliente-negociacao">
                <label className="area-cliente-label" htmlFor={`obs-${proposta.id}`}>
                  Comentário do cliente (opcional)
                </label>
                <textarea
                  id={`obs-${proposta.id}`}
                  className="textarea"
                  rows={2}
                  placeholder="Ex.: preço acima do esperado / condição aprovada"
                  value={observacaoPorProposta[proposta.id] || proposta.decisaoObservacao || ''}
                  onChange={(e) =>
                    setObservacaoPorProposta((prev) => ({ ...prev, [proposta.id]: e.target.value }))
                  }
                />
                <div className="area-cliente-negociacao-actions">
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => handleDecisao(proposta.id, 'aceita_preco')}
                  >
                    Aceitar proposta com este preço
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleDecisao(proposta.id, 'recusada_preco')}
                  >
                    Não aceitar este preço
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AreaCliente

