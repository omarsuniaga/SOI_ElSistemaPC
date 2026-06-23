/**
 * pdf/cierreCajaDiario.js
 * Generates a daily cash close report PDF.
 *
 * @param {object} cierre — { fecha, totalGeneral, porMetodo, cantidadTransacciones }
 *   porMetodo: { [metodo]: { count, total } }
 * @param {string} fecha  — ISO date string for the close date
 * @returns {jsPDF}
 */
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const BRAND_COLOR = [5, 150, 105]
const HEADER_TEXT_COLOR = [255, 255, 255]
const LABEL_COLOR = [100, 116, 139]
const VALUE_COLOR = [15, 23, 42]

function fmtMoney(val) {
  return '$' + Number(val || 0).toFixed(2)
}

function fmtDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('es-VE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtDateTime(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('es-VE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function generateCierreCaja(cierre, fecha) {
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
  doc.text('CIERRE DE CAJA DIARIO', 14, 22)
  doc.text(fmtDate(fecha || cierre?.fecha), pageW - 14, 22, { align: 'right' })

  // --- KPI boxes ---
  const boxY = 44
  const boxH = 20
  const boxW = (pageW - 28 - 8) / 2

  // Total box
  doc.setFillColor(240, 253, 244)
  doc.roundedRect(14, boxY, boxW, boxH, 3, 3, 'F')
  doc.setTextColor(...LABEL_COLOR)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('TOTAL GENERAL', 14 + 4, boxY + 7)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRAND_COLOR)
  doc.text(fmtMoney(cierre?.totalGeneral), 14 + 4, boxY + 15)

  // Transacciones box
  const box2X = 14 + boxW + 8
  doc.setFillColor(240, 253, 244)
  doc.roundedRect(box2X, boxY, boxW, boxH, 3, 3, 'F')
  doc.setTextColor(...LABEL_COLOR)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('TOTAL TRANSACCIONES', box2X + 4, boxY + 7)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRAND_COLOR)
  doc.text(String(cierre?.cantidadTransacciones || 0), box2X + 4, boxY + 15)

  // --- Desglose por metodo ---
  const afterBoxes = boxY + boxH + 10
  doc.setTextColor(...LABEL_COLOR)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('DESGLOSE POR METODO DE PAGO', 14, afterBoxes)

  const porMetodo = cierre?.porMetodo || {}
  const metodoRows = Object.entries(porMetodo).map(([metodo, data]) => [
    metodo,
    String(data.count || 0),
    fmtMoney(data.total),
  ])

  if (metodoRows.length === 0) {
    metodoRows.push(['Sin datos', '0', fmtMoney(0)])
  }

  autoTable(doc, {
    startY: afterBoxes + 3,
    head: [['Metodo de pago', 'Cantidad', 'Total']],
    body: metodoRows,
    headStyles: { fillColor: BRAND_COLOR, textColor: HEADER_TEXT_COLOR, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right', fontStyle: 'bold' },
    },
    foot: [['TOTAL', String(cierre?.cantidadTransacciones || 0), fmtMoney(cierre?.totalGeneral)]],
    footStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    showFoot: 'lastPage',
    margin: { left: 14, right: 14 },
  })

  // --- Firma / sello ---
  const afterTable = doc.lastAutoTable.finalY + 20
  doc.setDrawColor(...LABEL_COLOR)
  doc.setLineWidth(0.3)
  doc.line(14, afterTable, 80, afterTable)
  doc.setTextColor(...LABEL_COLOR)
  doc.setFontSize(8)
  doc.text('Firma responsable de caja', 14, afterTable + 5)

  doc.line(pageW - 14 - 66, afterTable, pageW - 14, afterTable)
  doc.text('Sello / Supervisor', pageW - 14 - 66, afterTable + 5)

  // --- Footer ---
  const pageH = doc.internal.pageSize.getHeight()
  doc.setDrawColor(...BRAND_COLOR)
  doc.setLineWidth(0.5)
  doc.line(14, pageH - 18, pageW - 14, pageH - 18)
  doc.setTextColor(...LABEL_COLOR)
  doc.setFontSize(7)
  doc.text('Generado el: ' + fmtDateTime(new Date().toISOString()) + ' | Sistema SOI', 14, pageH - 12)
  doc.text('Documento oficial de cierre. Conservar en archivo.', pageW - 14, pageH - 12, { align: 'right' })

  return doc
}
