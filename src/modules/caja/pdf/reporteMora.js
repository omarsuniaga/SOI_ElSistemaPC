/**
 * pdf/reporteMora.js
 * Generates a delinquency (mora) report PDF.
 *
 * @param {object} moraData — output of domain buildMoraReport
 *   { items: [{ familia, representante, cuota, diasMora, nivel }], totalMora }
 * @returns {jsPDF}
 */
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const BRAND_COLOR = [5, 150, 105]
const HEADER_TEXT_COLOR = [255, 255, 255]
const LABEL_COLOR = [100, 116, 139]
const RED_COLOR = [239, 68, 68]
const ORANGE_COLOR = [245, 158, 11]
const YELLOW_COLOR = [234, 179, 8]

function fmtMoney(val) {
  return '$' + Number(val || 0).toFixed(2)
}

function fmtDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtDateTime(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('es-VE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function nivelColor(nivel) {
  if (nivel === 'critico') return RED_COLOR
  if (nivel === 'mora') return ORANGE_COLOR
  return YELLOW_COLOR
}

function nivelLabel(nivel) {
  if (nivel === 'critico') return 'CRITICO'
  if (nivel === 'mora') return 'MORA'
  return 'VENCIDO'
}

export function generateReporteMora(moraData) {
  const { items, totalMora } = moraData
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()

  // --- Header ---
  doc.setFillColor(...BRAND_COLOR)
  doc.rect(0, 0, pageW, 36, 'F')
  doc.setTextColor(...HEADER_TEXT_COLOR)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Portal de Caja — El Sistema PC', 14, 13)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('REPORTE DE MORA', 14, 22)
  doc.text(fmtDate(new Date().toISOString()), pageW - 14, 22, { align: 'right' })

  // --- Summary ---
  const criticos = (items || []).filter(i => i.nivel === 'critico').length
  const enMora = (items || []).filter(i => i.nivel === 'mora').length
  const vencidos = (items || []).filter(i => i.nivel === 'vencido').length

  autoTable(doc, {
    startY: 44,
    head: [['Total casos', 'Critico (>60 dias)', 'Mora (31-60 dias)', 'Vencido (1-30 dias)']],
    body: [[
      String(totalMora || 0),
      String(criticos),
      String(enMora),
      String(vencidos),
    ]],
    headStyles: { fillColor: [15, 23, 42], textColor: HEADER_TEXT_COLOR, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 10, fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { textColor: LABEL_COLOR },
      1: { textColor: RED_COLOR },
      2: { textColor: ORANGE_COLOR },
      3: { textColor: YELLOW_COLOR },
    },
    margin: { left: 14, right: 14 },
  })

  // --- Detail table ---
  const afterSummary = doc.lastAutoTable.finalY + 8
  doc.setTextColor(...LABEL_COLOR)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('DETALLE POR FAMILIA', 14, afterSummary)

  const detailRows = (items || [])
    .sort((a, b) => (b.diasMora || 0) - (a.diasMora || 0))
    .map(item => [
      item.familia?.nombre || item.familia?.id || '-',
      item.representante?.nombre || item.representante?.email || '-',
      fmtDate(item.cuota?.fecha_vencimiento),
      fmtMoney(item.cuota?.monto_base || item.cuota?.saldo_pendiente),
      String(item.diasMora || 0) + ' dias',
      nivelLabel(item.nivel),
    ])

  autoTable(doc, {
    startY: afterSummary + 3,
    head: [['Familia', 'Representante', 'Vencimiento', 'Monto', 'Dias mora', 'Nivel']],
    body: detailRows.length > 0 ? detailRows : [['Sin datos de mora', '', '', '', '', '']],
    headStyles: { fillColor: BRAND_COLOR, textColor: HEADER_TEXT_COLOR, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        const nivel = data.cell.text[0]
        if (nivel === 'CRITICO') data.cell.styles.textColor = RED_COLOR
        else if (nivel === 'MORA') data.cell.styles.textColor = ORANGE_COLOR
        else data.cell.styles.textColor = YELLOW_COLOR
        data.cell.styles.fontStyle = 'bold'
      }
    },
    margin: { left: 14, right: 14 },
  })

  // --- Footer ---
  const pageH = doc.internal.pageSize.getHeight()
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setDrawColor(...BRAND_COLOR)
    doc.setLineWidth(0.5)
    doc.line(14, pageH - 18, pageW - 14, pageH - 18)
    doc.setTextColor(...LABEL_COLOR)
    doc.setFontSize(7)
    doc.text('Generado el: ' + fmtDateTime(new Date().toISOString()) + ' | Sistema SOI', 14, pageH - 12)
    doc.text('Pagina ' + i + ' de ' + totalPages, pageW - 14, pageH - 12, { align: 'right' })
  }

  return doc
}
