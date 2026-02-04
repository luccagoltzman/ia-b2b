import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx-js-style'

// Cores do projeto (mantido para referência futura)
// const COLORS = {
//   primary: '#4f46e5',
//   primaryDark: '#4338ca',
//   secondary: '#059669',
//   textPrimary: '#0f172a',
//   textSecondary: '#475569',
//   bgPrimary: '#ffffff',
//   bgTertiary: '#f8fafc',
//   success: '#10b981',
//   warning: '#f59e0b',
//   error: '#ef4444',
//   info: '#3b82f6'
// }

interface Proposta {
  id: string
  cliente: string
  produto?: string
  marca?: string
  categoria?: string
  valor: number
  status: string
  dataCriacao: string
  dataVencimento: string
  descricao?: string
  observacoes?: string
  valorUnitario?: number
  quantidade?: number
  unidadeMedida?: string
  desconto?: number
  descontoTipo?: 'percentual' | 'valor'
  condicoesPagamento?: string
  prazoEntrega?: string
  estrategiaRepresentacao?: string
  publicoAlvo?: string
  diferenciaisCompetitivos?: string
  // Novos campos - Cliente
  clienteCnpj?: string
  clienteEndereco?: string
  clienteNumero?: string
  clienteBairro?: string
  clienteCidade?: string
  clienteCep?: string
  clienteEstado?: string
  clienteTelefone?: string
  clienteEmail?: string
  clienteNomeFantasia?: string
  // Novos campos - Produto
  produtoCodigo?: string
  aliquotaIpi?: number
  // Novos campos - Comercial
  valorFrete?: number
  tipoPedido?: string
  transportadora?: string
  informacoesAdicionais?: string
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    rascunho: 'Rascunho',
    pendente: 'Pendente',
    enviada: 'Enviada',
    em_analise_gerente_compras: 'Em Análise - Gerente',
    em_analise_diretoria: 'Em Análise - Diretoria',
    aprovada: 'Aprovada',
    rejeitada: 'Rejeitada',
    cancelada: 'Cancelada'
  }
  return statusMap[status] || status
}

// Cores para documentos comerciais (visual formal)
const DOC = {
  headerBg: [15, 23, 42] as [number, number, number],      // #0f172a navy
  headerAccent: [30, 58, 138] as [number, number, number], // #1e3a8a
  textPrimary: [15, 23, 42] as [number, number, number],
  textSecondary: [71, 85, 105] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  rowAlt: [248, 250, 252] as [number, number, number],
  margin: 18,
  fontTitle: 16,
  fontSubtitle: 11,
  fontSmall: 9
}

function addDocumentHeader(doc: jsPDF, title: string, subtitle: string, docRef?: string) {
  const pageWidth = doc.internal.pageSize.getWidth()
  doc.setFillColor(...DOC.headerBg)
  doc.rect(0, 0, pageWidth, 36, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(DOC.fontTitle)
  doc.setFont('helvetica', 'bold')
  doc.text(title, DOC.margin, 14)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(subtitle, DOC.margin, 22)
  if (docRef) {
    doc.setFontSize(9)
    doc.text(`Ref: ${docRef}`, pageWidth - DOC.margin, 14, { align: 'right' })
    doc.text(`Emissão: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`, pageWidth - DOC.margin, 22, { align: 'right' })
  }
  doc.setTextColor(...DOC.textPrimary)
}

function addClientBlock(doc: jsPDF, cliente: string, clientInfo?: { email?: string; telefone?: string }) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const contentWidth = pageWidth - DOC.margin * 2
  doc.setDrawColor(...DOC.border)
  doc.setLineWidth(0.5)
  doc.rect(DOC.margin, 42, contentWidth, clientInfo?.email || clientInfo?.telefone ? 32 : 22, 'S')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DOC.textSecondary)
  doc.text('DESTINATÁRIO / CLIENTE', DOC.margin + 4, 50)
  doc.setTextColor(...DOC.textPrimary)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(cliente, DOC.margin + 8, 58)
  let y = 65
  if (clientInfo?.email) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...DOC.textSecondary)
    doc.text(`E-mail: ${clientInfo.email}`, DOC.margin + 8, y)
    y += 6
  }
  if (clientInfo?.telefone) {
    doc.text(`Telefone / WhatsApp: ${clientInfo.telefone}`, DOC.margin + 8, y)
  }
  doc.setTextColor(...DOC.textPrimary)
}

function addDocumentFooter(doc: jsPDF, text: string) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setFontSize(8)
  doc.setTextColor(...DOC.textSecondary)
  doc.text(text, pageWidth / 2, pageHeight - 10, { align: 'center' })
  doc.text(`Documento gerado em ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, pageHeight - 6, { align: 'center' })
}

export const exportService = {
  // Exportar lista de propostas para PDF
  exportPropostasToPDF(propostas: Proposta[]) {
    const doc = new jsPDF('l', 'mm', 'a4')
    
    // Cabeçalho
    doc.setFillColor(79, 70, 229) // #4f46e5
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Propostas Comerciais', 20, 25)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Total: ${propostas.length} proposta(s)`, 20, 35)
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, doc.internal.pageSize.getWidth() - 100, 35)
    
    // Resetar cor do texto
    doc.setTextColor(15, 23, 42) // #0f172a
    
    // Preparar dados da tabela
    const tableData = propostas.map(proposta => [
      proposta.cliente || '-',
      proposta.produto || '-',
      proposta.marca || '-',
      formatCurrency(proposta.valor),
      getStatusLabel(proposta.status),
      formatDate(proposta.dataVencimento)
    ])
    
    // Tabela
    autoTable(doc, {
      startY: 50,
      head: [['Cliente', 'Produto', 'Marca', 'Valor', 'Status', 'Vencimento']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [79, 70, 229], // #4f46e5
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [15, 23, 42] // #0f172a
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // #f8fafc
      },
      styles: {
        cellPadding: 3,
        lineColor: [226, 232, 240], // #e2e8f0
        lineWidth: 0.5
      },
      margin: { top: 50, left: 20, right: 20 }
    })
    
    // Rodapé
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(71, 85, 105) // #475569
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      )
    }
    
    // Salvar arquivo
    doc.save(`propostas_${new Date().toISOString().split('T')[0]}.pdf`)
  },

  // Exportar proposta individual para PDF (formato de pedido comercial)
  exportPropostaToPDF(proposta: Proposta) {
    const doc = new jsPDF('p', 'mm', 'a4')
    
    // Configurações
    const marginLeft = 15
    const marginRight = 15
    const pageWidth = doc.internal.pageSize.getWidth()
    const contentWidth = pageWidth - marginLeft - marginRight
    
    // Cabeçalho - Informações da Empresa Representante
    doc.setFillColor(79, 70, 229) // #4f46e5
    doc.rect(0, 0, pageWidth, 35, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('PEDIDO N°', marginLeft, 15)
    
    // Número do pedido (usar ID ou gerar)
    const pedidoNumero = proposta.id.substring(0, 8).toUpperCase() || '0000'
    doc.setFontSize(14)
    doc.text(pedidoNumero, marginLeft + 35, 15)
    
    // Empresa Representada (Marca)
    if (proposta.marca) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Representada: ${proposta.marca}`, marginLeft, 25)
    }
    
    // Resetar cor
    doc.setTextColor(15, 23, 42) // #0f172a
    let yPos = 45
    
    // Informações do Cliente
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Cliente:', marginLeft, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(proposta.cliente || '-', marginLeft + 20, yPos)
    yPos += 6
    
    if (proposta.clienteNomeFantasia) {
      doc.setFont('helvetica', 'bold')
      doc.text('Nome Fantasia:', marginLeft, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(proposta.clienteNomeFantasia, marginLeft + 35, yPos)
      yPos += 6
    }
    
    if (proposta.clienteCnpj) {
      doc.setFont('helvetica', 'bold')
      doc.text('CNPJ:', marginLeft, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(proposta.clienteCnpj, marginLeft + 20, yPos)
      yPos += 6
    }
    
    // Endereço completo
    if (proposta.clienteEndereco || proposta.clienteNumero || proposta.clienteBairro || 
        proposta.clienteCidade || proposta.clienteCep || proposta.clienteEstado) {
      const enderecoCompleto = [
        proposta.clienteEndereco,
        proposta.clienteNumero ? `N° ${proposta.clienteNumero}` : '',
        proposta.clienteBairro ? `Bairro: ${proposta.clienteBairro}` : '',
        proposta.clienteCidade ? `Cidade: ${proposta.clienteCidade}` : '',
        proposta.clienteCep ? `CEP: ${proposta.clienteCep}` : '',
        proposta.clienteEstado ? `Estado: ${proposta.clienteEstado}` : ''
      ].filter(Boolean).join(' - ')
      
      doc.setFont('helvetica', 'bold')
      doc.text('Endereço:', marginLeft, yPos)
      doc.setFont('helvetica', 'normal')
      const enderecoLines = doc.splitTextToSize(enderecoCompleto, contentWidth - 25)
      doc.text(enderecoLines, marginLeft + 25, yPos)
      yPos += enderecoLines.length * 5 + 2
    }
    
    if (proposta.clienteTelefone) {
      doc.setFont('helvetica', 'bold')
      doc.text('Telefone:', marginLeft, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(proposta.clienteTelefone, marginLeft + 25, yPos)
      yPos += 6
    }
    
    if (proposta.clienteEmail) {
      doc.setFont('helvetica', 'bold')
      doc.text('E-mail:', marginLeft, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(proposta.clienteEmail, marginLeft + 20, yPos)
      yPos += 10
    }
    
    // Tabela de Produtos
    yPos += 5
    const tableData: any[][] = []
    
    // Calcular valores
    const valorUnitario = proposta.valorUnitario || 0
    const quantidade = proposta.quantidade || 0
    const aliquotaIpi = proposta.aliquotaIpi || 0
    const precoLiquido = valorUnitario
    const precoComImpostos = precoLiquido * (1 + aliquotaIpi / 100)
    const subtotal = precoComImpostos * quantidade
    
    tableData.push([
      '1',
      proposta.produtoCodigo || '-',
      proposta.produto || '-',
      quantidade.toString(),
      formatCurrency(precoLiquido),
      `${aliquotaIpi}%`,
      formatCurrency(precoComImpostos),
      formatCurrency(subtotal)
    ])
    
    // Cabeçalho da tabela
    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Código', 'Produto', 'Qtde.', 'Preço Líquido', 'Alíq. IPI', 'Preço Líq. c/ Impostos', 'Subtotal']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [79, 70, 229], // #4f46e5
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [15, 23, 42]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // #f8fafc
      },
      styles: {
        cellPadding: 2,
        lineColor: [226, 232, 240],
        lineWidth: 0.5
      },
      columnStyles: {
        0: { cellWidth: 10 }, // #
        1: { cellWidth: 30 }, // Código
        2: { cellWidth: 50 }, // Produto
        3: { cellWidth: 20 }, // Qtde
        4: { cellWidth: 30 }, // Preço Líquido
        5: { cellWidth: 25 }, // Alíq IPI
        6: { cellWidth: 35 }, // Preço c/ Impostos
        7: { cellWidth: 30 }  // Subtotal
      },
      margin: { left: marginLeft, right: marginRight }
    })
    
    yPos = (doc as any).lastAutoTable.finalY + 10
    
    // Valor do Frete
    const valorFrete = proposta.valorFrete || 0
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Valor do frete:', marginLeft, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(formatCurrency(valorFrete), pageWidth - marginRight - 40, yPos, { align: 'right' })
    yPos += 8
    
    // Valor Total
    const valorTotal = subtotal + valorFrete
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Valor total:', marginLeft, yPos)
    doc.setFont('helvetica', 'bold')
    doc.text(formatCurrency(valorTotal), pageWidth - marginRight - 40, yPos, { align: 'right' })
    yPos += 12
    
    // Informações Comerciais
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    if (proposta.condicoesPagamento) {
      doc.setFont('helvetica', 'bold')
      doc.text('Condição de Pagamento:', marginLeft, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(proposta.condicoesPagamento, marginLeft + 50, yPos)
      yPos += 6
    }
    
    doc.setFont('helvetica', 'bold')
    doc.text('Data de Emissão:', pageWidth - marginRight - 60, yPos - 6)
    doc.setFont('helvetica', 'normal')
    doc.text(formatDate(proposta.dataCriacao), pageWidth - marginRight - 20, yPos - 6, { align: 'right' })
    
    if (proposta.clienteEmail) {
      doc.setFont('helvetica', 'normal')
      doc.text(`e-mail: ${proposta.clienteEmail}`, marginLeft, yPos)
      yPos += 6
    }
    
    if (proposta.tipoPedido) {
      doc.setFont('helvetica', 'bold')
      doc.text('Tipo de pedido:', marginLeft, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(proposta.tipoPedido.charAt(0).toUpperCase() + proposta.tipoPedido.slice(1), marginLeft + 40, yPos)
      yPos += 6
    }
    
    if (proposta.transportadora) {
      doc.setFont('helvetica', 'bold')
      doc.text('Transportadora:', marginLeft, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(proposta.transportadora, marginLeft + 40, yPos)
      yPos += 6
    }
    
    if (proposta.informacoesAdicionais) {
      doc.setFont('helvetica', 'bold')
      doc.text('Informações Adicionais:', marginLeft, yPos)
      doc.setFont('helvetica', 'normal')
      const infoLines = doc.splitTextToSize(proposta.informacoesAdicionais, contentWidth - 50)
      doc.text(infoLines, marginLeft + 50, yPos)
      yPos += infoLines.length * 5 + 6
    }
    
    if (proposta.clienteTelefone) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text(`Contatos ${proposta.clienteTelefone}`, marginLeft, yPos)
    }
    
    // Rodapé
    doc.setFontSize(8)
    doc.setTextColor(71, 85, 105)
    doc.text(
      `Gerado em ${new Date().toLocaleString('pt-BR')}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
    
    // Salvar arquivo
    const fileName = `pedido_${pedidoNumero}_${proposta.cliente.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  },

  // Exportar lista de propostas para Excel
  exportPropostasToExcel(propostas: Proposta[]) {
    // Preparar dados
    const headers = [
      'Cliente', 'Produto', 'Marca', 'Categoria', 
      'Valor Unitário', 'Quantidade', 'Unidade', 'Desconto',
      'Valor Total', 'Status', 'Data Criação', 'Data Vencimento',
      'Condições Pagamento', 'Prazo Entrega', 'Público-Alvo',
      'Descrição', 'Observações'
    ]
    
    const data = propostas.map(proposta => [
      proposta.cliente || '',
      proposta.produto || '',
      proposta.marca || '',
      proposta.categoria || '',
      proposta.valorUnitario || 0, // Número para formatação
      proposta.quantidade || 0, // Número
      proposta.unidadeMedida || '',
      proposta.desconto 
        ? (proposta.descontoTipo === 'percentual' ? `${proposta.desconto}%` : proposta.desconto)
        : '',
      proposta.valor || 0, // Número para formatação
      getStatusLabel(proposta.status),
      formatDate(proposta.dataCriacao),
      formatDate(proposta.dataVencimento),
      proposta.condicoesPagamento || '',
      proposta.prazoEntrega || '',
      proposta.publicoAlvo || '',
      proposta.descricao || '',
      proposta.observacoes || ''
    ])
    
    // Criar workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
    
    // Estilos
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
      fill: { fgColor: { rgb: '4F46E5' } }, // Primary color
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        top: { style: 'thin', color: { rgb: '4338CA' } },
        bottom: { style: 'thin', color: { rgb: '4338CA' } },
        left: { style: 'thin', color: { rgb: '4338CA' } },
        right: { style: 'thin', color: { rgb: '4338CA' } }
      }
    }
    
    const cellStyle = {
      font: { sz: 10, color: { rgb: '0F172A' } },
      alignment: { vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: 'E2E8F0' } },
        bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
        left: { style: 'thin', color: { rgb: 'E2E8F0' } },
        right: { style: 'thin', color: { rgb: 'E2E8F0' } }
      }
    }
    
    const currencyStyle = {
      ...cellStyle,
      numFmt: '"R$" #,##0.00',
      alignment: { horizontal: 'right', vertical: 'center' }
    }
    
    // Aplicar estilos ao cabeçalho
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
      if (!ws[cellAddress]) continue
      ws[cellAddress].s = headerStyle
    }
    
    // Aplicar estilos às células de dados
    for (let row = 1; row <= data.length; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
        if (!ws[cellAddress]) continue
        
        // Estilo especial para colunas de valor
        if (col === 4 || col === 8) { // Valor Unitário e Valor Total
          ws[cellAddress].s = currencyStyle
        } else if (col === 5 || col === 6) { // Quantidade e Unidade
          ws[cellAddress].s = {
            ...cellStyle,
            alignment: { horizontal: 'center', vertical: 'center' }
          }
        } else if (col === 9) { // Status
          const status = data[row - 1][9] as string
          let statusColor = '3B82F6' // info (azul)
          if (status.includes('Aprovada')) statusColor = '10B981' // success (verde)
          if (status.includes('Rejeitada') || status.includes('Cancelada')) statusColor = 'EF4444' // error (vermelho)
          if (status.includes('Pendente')) statusColor = 'F59E0B' // warning (laranja)
          
          ws[cellAddress].s = {
            ...cellStyle,
            fill: { fgColor: { rgb: statusColor + '20' } }, // 20 = 12.5% opacity
            font: { ...cellStyle.font, bold: true, color: { rgb: statusColor } },
            alignment: { horizontal: 'center', vertical: 'center' }
          }
        } else {
          ws[cellAddress].s = cellStyle
        }
        
        // Alternar cor de fundo das linhas (apenas se não tiver fill customizado)
        if (row % 2 === 0 && col !== 9 && !ws[cellAddress].s.fill) {
          ws[cellAddress].s.fill = { fgColor: { rgb: 'F8FAFC' } } // bg-tertiary
        }
      }
    }
    
    // Ajustar larguras das colunas
    ws['!cols'] = [
      { wch: 25 }, // Cliente
      { wch: 20 }, // Produto
      { wch: 15 }, // Marca
      { wch: 15 }, // Categoria
      { wch: 15 }, // Valor Unitário
      { wch: 12 }, // Quantidade
      { wch: 12 }, // Unidade
      { wch: 12 }, // Desconto
      { wch: 15 }, // Valor Total
      { wch: 20 }, // Status
      { wch: 15 }, // Data Criação
      { wch: 15 }, // Data Vencimento
      { wch: 20 }, // Condições Pagamento
      { wch: 15 }, // Prazo Entrega
      { wch: 25 }, // Público-Alvo
      { wch: 40 }, // Descrição
      { wch: 40 }  // Observações
    ]
    
    // Ajustar altura do cabeçalho
    ws['!rows'] = [{ hpt: 30 }]
    
    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Propostas')
    
    // Salvar arquivo
    const fileName = `propostas_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  },

  // Exportar proposta individual para Excel
  exportPropostaToExcel(proposta: Proposta) {
    // Interface para itens das seções
    interface SectionItem {
      label: string
      value: string | number
      isCurrency?: boolean
      isBold?: boolean
      isMultiline?: boolean
    }

    // Criar dados organizados por seções
    const sections: { title: string; items: SectionItem[] }[] = [
      { title: 'INFORMAÇÕES BÁSICAS', items: [
        { label: 'Cliente', value: proposta.cliente || '' },
        { label: 'Produto', value: proposta.produto || '' },
        { label: 'Marca', value: proposta.marca || '' },
        { label: 'Categoria', value: proposta.categoria || '' },
        { label: 'Status', value: getStatusLabel(proposta.status) },
        { label: 'Data Criação', value: formatDate(proposta.dataCriacao) },
        { label: 'Data Vencimento', value: formatDate(proposta.dataVencimento) }
      ]},
      { title: 'VALORES E QUANTIDADES', items: [
        { label: 'Valor Unitário', value: proposta.valorUnitario || '', isCurrency: true },
        { label: 'Quantidade', value: proposta.quantidade || '' },
        { label: 'Unidade de Medida', value: proposta.unidadeMedida || '' },
        { label: 'Desconto', value: proposta.desconto 
          ? (proposta.descontoTipo === 'percentual' ? `${proposta.desconto}%` : proposta.desconto)
          : '', isCurrency: proposta.descontoTipo === 'valor' },
        { label: 'Valor Total', value: proposta.valor || 0, isCurrency: true, isBold: true }
      ]},
      { title: 'CONDIÇÕES COMERCIAIS', items: [
        { label: 'Condições de Pagamento', value: proposta.condicoesPagamento || '' },
        { label: 'Prazo de Entrega', value: proposta.prazoEntrega || '' }
      ]},
      { title: 'ESTRATÉGIA DE REPRESENTAÇÃO', items: [
        { label: 'Estratégia', value: proposta.estrategiaRepresentacao || '', isMultiline: true },
        { label: 'Público-Alvo', value: proposta.publicoAlvo || '' },
        { label: 'Diferenciais Competitivos', value: proposta.diferenciaisCompetitivos || '', isMultiline: true }
      ]},
      { title: 'INFORMAÇÕES ADICIONAIS', items: [
        { label: 'Descrição', value: proposta.descricao || '', isMultiline: true },
        { label: 'Observações', value: proposta.observacoes || '', isMultiline: true }
      ]}
    ]
    
    // Preparar dados para planilha
    const rows: any[][] = []
    
    sections.forEach((section, sectionIndex) => {
      // Título da seção
      rows.push([section.title, ''])
      
      // Itens da seção
      section.items.forEach(item => {
        if (item.value !== undefined && item.value !== null && item.value !== '') {
          rows.push([item.label, item.value])
        }
      })
      
      // Espaço entre seções (exceto na última)
      if (sectionIndex < sections.length - 1) {
        rows.push(['', ''])
      }
    })
    
    // Criar worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(rows)
    
    // Estilos
    const sectionTitleStyle = {
      font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '4F46E5' } }, // Primary color
      alignment: { horizontal: 'left', vertical: 'center' },
      border: {
        top: { style: 'medium', color: { rgb: '4338CA' } },
        bottom: { style: 'medium', color: { rgb: '4338CA' } },
        left: { style: 'medium', color: { rgb: '4338CA' } },
        right: { style: 'medium', color: { rgb: '4338CA' } }
      }
    }
    
    const labelStyle = {
      font: { bold: true, sz: 10, color: { rgb: '475569' } },
      fill: { fgColor: { rgb: 'F8FAFC' } },
      alignment: { horizontal: 'left', vertical: 'top' },
      border: {
        top: { style: 'thin', color: { rgb: 'E2E8F0' } },
        bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
        left: { style: 'thin', color: { rgb: 'E2E8F0' } },
        right: { style: 'thin', color: { rgb: 'E2E8F0' } }
      }
    }
    
    const valueStyle = {
      font: { sz: 10, color: { rgb: '0F172A' } },
      alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
      border: {
        top: { style: 'thin', color: { rgb: 'E2E8F0' } },
        bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
        left: { style: 'thin', color: { rgb: 'E2E8F0' } },
        right: { style: 'thin', color: { rgb: 'E2E8F0' } }
      }
    }
    
    // Aplicar estilos
    let rowIndex = 0
    sections.forEach((section) => {
      // Título da seção
      const titleCell = XLSX.utils.encode_cell({ r: rowIndex, c: 0 })
      const titleCell2 = XLSX.utils.encode_cell({ r: rowIndex, c: 1 })
      ws[titleCell].s = sectionTitleStyle
      ws[titleCell2].s = sectionTitleStyle
      ws[`!merges`] = ws[`!merges`] || []
      ws[`!merges`].push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 1 } })
      rowIndex++
      
      // Itens
      section.items.forEach(item => {
        if (item.value !== undefined && item.value !== null && item.value !== '') {
          const labelCell = XLSX.utils.encode_cell({ r: rowIndex, c: 0 })
          const valueCell = XLSX.utils.encode_cell({ r: rowIndex, c: 1 })
          
          ws[labelCell].s = labelStyle
          
          let cellValueStyle: any = { ...valueStyle }
          if (item.isCurrency) {
            cellValueStyle = {
              ...cellValueStyle,
              numFmt: '"R$" #,##0.00',
              alignment: { ...valueStyle.alignment, horizontal: 'right' }
            }
          }
          if (item.isBold) {
            cellValueStyle.font = { 
              ...cellValueStyle.font, 
              bold: true, 
              color: { rgb: '4F46E5' } 
            }
          }
          
          ws[valueCell].s = cellValueStyle
          rowIndex++
        }
      })
      
      // Espaço entre seções
      rowIndex++
    })
    
    // Ajustar larguras
    ws['!cols'] = [
      { wch: 30 },
      { wch: 70 }
    ]
    
    // Ajustar alturas das linhas
    const rowHeights: any[] = []
    sections.forEach((section) => {
      // Título da seção
      rowHeights.push({ hpt: 25 })
      
      // Itens da seção
      section.items.forEach(item => {
        if (item.value !== undefined && item.value !== null && item.value !== '') {
          // Altura maior para campos multilinha
          rowHeights.push({ hpt: item.isMultiline ? 50 : 25 })
        }
      })
      
      // Espaço entre seções (exceto na última)
      if (section !== sections[sections.length - 1]) {
        rowHeights.push({ hpt: 10 })
      }
    })
    ws['!rows'] = rowHeights
    
    XLSX.utils.book_append_sheet(wb, ws, 'Proposta')
    
    const fileName = `proposta_${proposta.cliente.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  },

  // Exportar tabela de produtos para PDF (formato comercial com dados do cliente)
  exportTabelaProdutosToPDF(tabela: any, cliente?: string, clientInfo?: { email?: string; telefone?: string }) {
    const doc = new jsPDF('p', 'mm', 'a4')
    const marginLeft = DOC.margin
    const marginRight = DOC.margin
    const pageWidth = doc.internal.pageSize.getWidth()
    const contentWidth = pageWidth - marginLeft - marginRight
    const docRef = `TAB-${tabela.id?.substring(0, 8).toUpperCase() || new Date().getTime()}`

    addDocumentHeader(doc, 'TABELA DE PRODUTOS', tabela.nome, docRef)

    if (cliente) {
      addClientBlock(doc, cliente, clientInfo)
    }

    let yPos = cliente ? 78 : 48
    doc.setFontSize(DOC.fontSmall)
    doc.setFont('helvetica', 'bold')
    doc.text('Validade:', marginLeft, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(formatDate(tabela.dataVencimento), marginLeft + 22, yPos)
    yPos += 10

    const tableData = tabela.produtos.map((produto: any, index: number) => {
      const valorTotal = produto.valorUnitario * produto.quantidade
      return [
        (index + 1).toString(),
        produto.produtoCodigo || '-',
        produto.produto,
        produto.marca,
        produto.quantidade.toString(),
        produto.unidadeMedida,
        formatCurrency(produto.valorUnitario),
        formatCurrency(valorTotal)
      ]
    })

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Código', 'Produto', 'Marca', 'Quantidade', 'Unidade', 'Valor Unit.', 'Valor Total']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: DOC.headerBg,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: { fontSize: 9, textColor: DOC.textPrimary },
      alternateRowStyles: { fillColor: DOC.rowAlt },
      styles: { cellPadding: 3, lineColor: DOC.border, lineWidth: 0.3 },
      margin: { left: marginLeft, right: marginRight }
    })

    yPos = (doc as any).lastAutoTable.finalY + 14

    if (tabela.condicoesPagamento || tabela.prazoEntrega) {
      doc.setDrawColor(...DOC.border)
      doc.rect(marginLeft, yPos - 4, contentWidth, 24, 'S')
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...DOC.textSecondary)
      doc.text('CONDIÇÕES COMERCIAIS', marginLeft + 4, yPos + 2)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...DOC.textPrimary)
      if (tabela.condicoesPagamento) {
        doc.text(`Pagamento: ${tabela.condicoesPagamento}`, marginLeft + 8, yPos + 9)
      }
      if (tabela.prazoEntrega) {
        doc.text(`Entrega: ${tabela.prazoEntrega}`, marginLeft + 8, yPos + 16)
      }
      yPos += 28
    }

    if (tabela.observacoes) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text('Observações:', marginLeft, yPos)
      doc.setFont('helvetica', 'normal')
      const obsLines = doc.splitTextToSize(tabela.observacoes, contentWidth - 20)
      doc.text(obsLines, marginLeft, yPos + 6)
    }

    addDocumentFooter(doc, 'Documento comercial · Uso confidencial')
    const fileName = `tabela_${tabela.nome.replace(/\s+/g, '_')}_${cliente ? cliente.replace(/\s+/g, '_') + '_' : ''}${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  },

  // Exportar tabela de produtos para Excel
  exportTabelaProdutosToExcel(tabela: any, cliente?: string) {
    const wb = XLSX.utils.book_new()
    
    // Planilha de Produtos (SEM mostrar descontos - são internos)
    const produtosHeaders = ['#', 'Código', 'Produto', 'Marca', 'Quantidade', 'Unidade', 'Valor Unitário', 'Valor Total']
    const produtosData = tabela.produtos.map((produto: any, index: number) => {
      const valorTotal = produto.valorUnitario * produto.quantidade
      return [
        index + 1,
        produto.produtoCodigo || '',
        produto.produto,
        produto.marca,
        produto.quantidade,
        produto.unidadeMedida,
        produto.valorUnitario,
        valorTotal
      ]
    })
    
    const wsProdutos = XLSX.utils.aoa_to_sheet([produtosHeaders, ...produtosData])
    
    // Estilos
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
      fill: { fgColor: { rgb: '4F46E5' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '4338CA' } },
        bottom: { style: 'thin', color: { rgb: '4338CA' } },
        left: { style: 'thin', color: { rgb: '4338CA' } },
        right: { style: 'thin', color: { rgb: '4338CA' } }
      }
    }
    
    const cellStyle = {
      font: { sz: 10, color: { rgb: '0F172A' } },
      alignment: { vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: 'E2E8F0' } },
        bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
        left: { style: 'thin', color: { rgb: 'E2E8F0' } },
        right: { style: 'thin', color: { rgb: 'E2E8F0' } }
      }
    }
    
    const currencyStyle = {
      ...cellStyle,
      numFmt: '"R$" #,##0.00',
      alignment: { horizontal: 'right', vertical: 'center' }
    }
    
    // Aplicar estilos
    const range = XLSX.utils.decode_range(wsProdutos['!ref'] || 'A1')
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
      if (wsProdutos[cellAddress]) {
        wsProdutos[cellAddress].s = headerStyle
      }
    }
    
    for (let row = 1; row <= produtosData.length; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
        if (!wsProdutos[cellAddress]) continue
        
        if (col === 6) { // Valor Unitário
          wsProdutos[cellAddress].s = currencyStyle
        } else if (row % 2 === 0) {
          wsProdutos[cellAddress].s = {
            ...cellStyle,
            fill: { fgColor: { rgb: 'F8FAFC' } }
          }
        } else {
          wsProdutos[cellAddress].s = cellStyle
        }
      }
    }
    
    wsProdutos['!cols'] = [
      { wch: 5 }, { wch: 15 }, { wch: 30 }, { wch: 15 },
      { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }
    ]
    
    XLSX.utils.book_append_sheet(wb, wsProdutos, 'Produtos')
    
    const fileName = `tabela_${tabela.nome.replace(/\s+/g, '_')}_${cliente ? cliente.replace(/\s+/g, '_') + '_' : ''}${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  },

  // Gerar Nota de Retorno do Cliente (PDF comercial com dados do cliente)
  exportNotaRetornoClienteToPDF(
    tabela: any,
    cliente: string,
    produtosSelecionados: any[],
    clientInfo?: { email?: string; telefone?: string }
  ) {
    const doc = new jsPDF('p', 'mm', 'a4')
    const marginLeft = DOC.margin
    const marginRight = DOC.margin
    const pageWidth = doc.internal.pageSize.getWidth()
    const contentWidth = pageWidth - marginLeft - marginRight
    const docRef = `NR-${tabela.id?.substring(0, 6).toUpperCase() || Date.now()}-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '')}`

    addDocumentHeader(doc, 'NOTA DE RETORNO', 'Confirmação de seleção de produtos pelo cliente', docRef)
    addClientBlock(doc, cliente, clientInfo)

    let yPos = 78
    doc.setDrawColor(...DOC.border)
    doc.rect(marginLeft, yPos - 4, contentWidth, 18, 'S')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...DOC.textSecondary)
    doc.text('REFERÊNCIA', marginLeft + 4, yPos + 2)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...DOC.textPrimary)
    doc.text(`Tabela: ${tabela.nome}`, marginLeft + 8, yPos + 8)
    doc.text(`Data do retorno: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, marginLeft + 8, yPos + 14)
    yPos += 24

    const tableData = produtosSelecionados.map((produto: any, index: number) => {
      const valorTotal = produto.valorUnitario * produto.quantidade
      return [
        (index + 1).toString(),
        produto.produtoCodigo || '-',
        produto.produto,
        produto.marca,
        produto.quantidade.toString(),
        produto.unidadeMedida,
        formatCurrency(produto.valorUnitario),
        formatCurrency(valorTotal)
      ]
    })

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Código', 'Produto', 'Marca', 'Quantidade', 'Unidade', 'Valor Unit.', 'Valor Total']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: DOC.headerBg,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: { fontSize: 9, textColor: DOC.textPrimary },
      alternateRowStyles: { fillColor: DOC.rowAlt },
      styles: { cellPadding: 3, lineColor: DOC.border, lineWidth: 0.3 },
      margin: { left: marginLeft, right: marginRight }
    })

    yPos = (doc as any).lastAutoTable.finalY + 12

    const valorTotal = produtosSelecionados.reduce((total: number, produto: any) => {
      let valorUnitario = produto.valorUnitario
      if (produto.aliquotaIpi) valorUnitario = valorUnitario * (1 + produto.aliquotaIpi / 100)
      if (produto.desconto) {
        if (produto.descontoTipo === 'percentual') valorUnitario = valorUnitario * (1 - produto.desconto / 100)
        else valorUnitario = Math.max(0, valorUnitario - produto.desconto)
      }
      return total + valorUnitario * produto.quantidade
    }, 0)

    doc.setFillColor(...DOC.rowAlt)
    doc.rect(marginLeft, yPos - 4, contentWidth, 14, 'F')
    doc.setDrawColor(...DOC.border)
    doc.rect(marginLeft, yPos - 4, contentWidth, 14, 'S')
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('VALOR TOTAL DA SELEÇÃO', marginLeft + 6, yPos + 4)
    doc.text(formatCurrency(valorTotal), pageWidth - marginRight - 6, yPos + 4, { align: 'right' })
    yPos += 20

    if (tabela.condicoesPagamento || tabela.prazoEntrega) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...DOC.textSecondary)
      if (tabela.condicoesPagamento) doc.text(`Condições de pagamento: ${tabela.condicoesPagamento}`, marginLeft, yPos)
      yPos += 5
      if (tabela.prazoEntrega) doc.text(`Prazo de entrega: ${tabela.prazoEntrega}`, marginLeft, yPos)
      yPos += 8
      doc.setTextColor(...DOC.textPrimary)
    }
    if (tabela.observacoes) {
      doc.setFont('helvetica', 'bold')
      doc.text('Observações:', marginLeft, yPos)
      doc.setFont('helvetica', 'normal')
      const obsLines = doc.splitTextToSize(tabela.observacoes, contentWidth - 20)
      doc.text(obsLines, marginLeft, yPos + 5)
    }

    addDocumentFooter(doc, 'Documento comercial · Confirmação de pedido')
    const fileName = `nota_retorno_${cliente.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  },

  // Gerar Nota de Retorno do Cliente (Excel)
  exportNotaRetornoClienteToExcel(tabela: any, cliente: string, produtosSelecionados: any[]) {
    const wb = XLSX.utils.book_new()
    
    // Planilha de Produtos Selecionados
    const headers = ['#', 'Código', 'Produto', 'Marca', 'Quantidade', 'Unidade', 'Valor Unitário', 'Valor Total']
    const data = produtosSelecionados.map((produto: any, index: number) => {
      const valorTotal = produto.valorUnitario * produto.quantidade
      return [
        index + 1,
        produto.produtoCodigo || '',
        produto.produto,
        produto.marca,
        produto.quantidade,
        produto.unidadeMedida,
        produto.valorUnitario,
        valorTotal
      ]
    })
    
    const ws = XLSX.utils.aoa_to_sheet([
      ['NOTA DE RETORNO DO CLIENTE'],
      [''],
      ['Cliente:', cliente],
      ['Tabela:', tabela.nome],
      ['Data do Retorno:', new Date().toLocaleDateString('pt-BR')],
      [''],
      headers,
      ...data
    ])
    
    // Estilos
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
      fill: { fgColor: { rgb: '4F46E5' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '4338CA' } },
        bottom: { style: 'thin', color: { rgb: '4338CA' } },
        left: { style: 'thin', color: { rgb: '4338CA' } },
        right: { style: 'thin', color: { rgb: '4338CA' } }
      }
    }
    
    const cellStyle = {
      font: { sz: 10, color: { rgb: '0F172A' } },
      alignment: { vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: 'E2E8F0' } },
        bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
        left: { style: 'thin', color: { rgb: 'E2E8F0' } },
        right: { style: 'thin', color: { rgb: 'E2E8F0' } }
      }
    }
    
    const currencyStyle = {
      ...cellStyle,
      numFmt: '"R$" #,##0.00',
      alignment: { horizontal: 'right', vertical: 'center' }
    }
    
    // Aplicar estilos ao título
    ws['A1'].s = {
      font: { bold: true, sz: 16, color: { rgb: '4F46E5' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    }
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }]
    
    // Aplicar estilos ao cabeçalho da tabela
    const headerRow = 6
    for (let col = 0; col < headers.length; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: col })
      if (ws[cellAddress]) {
        ws[cellAddress].s = headerStyle
      }
    }
    
    // Aplicar estilos aos dados
    for (let row = 1; row <= data.length; row++) {
      for (let col = 0; col < headers.length; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: headerRow + row, c: col })
        if (!ws[cellAddress]) continue
        
        if (col === 6 || col === 7) { // Valor Unitário e Valor Total
          ws[cellAddress].s = currencyStyle
        } else if (row % 2 === 0) {
          ws[cellAddress].s = {
            ...cellStyle,
            fill: { fgColor: { rgb: 'F8FAFC' } }
          }
        } else {
          ws[cellAddress].s = cellStyle
        }
      }
    }
    
    // Calcular e adicionar valor total
    const valorTotal = produtosSelecionados.reduce((total: number, produto: any) => {
      let valorUnitario = produto.valorUnitario
      if (produto.aliquotaIpi) {
        valorUnitario = valorUnitario * (1 + produto.aliquotaIpi / 100)
      }
      if (produto.desconto) {
        if (produto.descontoTipo === 'percentual') {
          valorUnitario = valorUnitario * (1 - produto.desconto / 100)
        } else {
          valorUnitario = Math.max(0, valorUnitario - produto.desconto)
        }
      }
      return total + (valorUnitario * produto.quantidade)
    }, 0)
    
    const totalRow = headerRow + data.length + 2
    ws[XLSX.utils.encode_cell({ r: totalRow, c: 6 })] = { v: 'Valor Total:', t: 's' }
    ws[XLSX.utils.encode_cell({ r: totalRow, c: 7 })] = { v: valorTotal, t: 'n' }
    ws[XLSX.utils.encode_cell({ r: totalRow, c: 6 })].s = {
      font: { bold: true, sz: 11, color: { rgb: '4F46E5' } },
      alignment: { horizontal: 'right', vertical: 'center' }
    }
    ws[XLSX.utils.encode_cell({ r: totalRow, c: 7 })].s = {
      ...currencyStyle,
      font: { bold: true, sz: 12, color: { rgb: '4F46E5' } }
    }
    
    ws['!cols'] = [
      { wch: 5 }, { wch: 15 }, { wch: 30 }, { wch: 15 },
      { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }
    ]
    
    XLSX.utils.book_append_sheet(wb, ws, 'Nota de Retorno')
    
    const fileName = `nota_retorno_${cliente.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  }
}

