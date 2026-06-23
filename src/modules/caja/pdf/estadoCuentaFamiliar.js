/**
 * pdf/estadoCuentaFamiliar.js
 * Generates a family account statement PDF.
 *
 * @param {object} statement — output of domain buildEstadoCuentaFamiliar
 *   { familia, resumen: { totalCuotas, totalPagado, saldoPendiente, walletBalance }, movimientos }
 * @returns {jsPDF}
 */
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const BRAND_COLOR = [5, 150, 105]
const HEADER_TEXT_COLOR = [255, 255, 255]
const LABEL_COLOR = [100, 116, 139]
const VALUE_COLOR = [15, 23, 42]
const RED_COLOR = [239, 68, 68]
const GREEN_COLOR = [5, 150, 105]

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

export function generateEstadoCuenta(statement) {
  const { familia, resumen, movimientos } = statement
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
  doc.text('ESTADO DE CUENTA FAMILIAR', 14, 22)
  doc.text(fmtDate(new Date().toISOString()), pageW - 14, 22, { align: 'right' })

  // --- Familia info ---
  doc.setTextColor(...LABEL_COLOR)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DE LA FAMILIA', 14, 46)

  autoTable(doc, {
    startY: 49,
    head: [],
    body: [
      ['Familia', familia?.nombre || familia?.codigo || '-'],
      ['Representante', familia?.representante_nombre || familia?.representante || '-'],
      ['Codigo', familia?.codigo || '-'],
    ],
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 } },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: LABEL_COLOR, cellWidth: 50 },
      1: { textColor: VALUE_COLOR },
    },
    margin: { left: 14, right: 14 },
  })

  // --- Resumen financiero ---
  const afterFamilia = doc.lastAutoTable.finalY + 8
  doc.setTextColor(...LABEL_COLOR)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('RESUMEN FINANCIERO', 14, afterFamilia)

  const saldoColor = resumen.saldoPendiente > 0 ? RED_COLOR : GREEN_COLOR

  autoTable(doc, {
    startY: afterFamilia + 3,
    head: [['Concepto', 'Monto']],
    body: [
      ['Total cuotas generadas', fmtMoney(resumen.totalCuotas)],
      ['Total pagado', fmtMoney(resumen.totalPagado)],
      ['Saldo pendiente', fmtMoney(resumen.saldoPendiente)],
      ['Saldo wallet disponible', fmtMoney(resumen.walletBalance)],
    ],
    headStyles: { fillColor: BRAND_COLOR, textColor: HEADER_TEXT_COLOR, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    didDrawCell: (data) => {
      if (data.row.index === 2 && data.column.index === 1) {
        doc.setTextColor(...saldoColor)
      }
    },
    margin: { left: 14, right: 14 },
  })

  // --- Movimientos ---
  const afterResumen = doc.lastAutoTable.finalY + 8
  doc.setTextColor(...LABEL_COLOR)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('HISTORIAL DE MOVIMIENTOS', 14, afterResumen)

  const movRows = (movimientos || []).map(m => [
    fmtDate(m.fecha_pago || m.created_at),
    m.concepto || m.descripcion || 'Pago',
    m.metodo_pago || '-',
    fmtMoney(m.monto),
  ])

  autoTable(doc, {
    startY: afterResumen + 3,
    head: [['Fecha', 'Concepto', 'Metodo', 'Monto']],
    body: movRows.length > 0 ? movRows : [['Sin movimientos', '', '', '']],
    headStyles: { fillColor: BRAND_COLOR, textColor: HEADER_TEXT_COLOR, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    margin: { left: 14, right: 14 },
  })

  // --- Footer ---
  const pageH = doc.internal.pageSize.getHeight()
  doc.setDrawColor(...BRAND_COLOR)
  doc.setLineWidth(0.5)
  doc.line(14, pageH - 18, pageW - 14, pageH - 18)
  doc.setTextColor(...LABEL_COLOR)
  doc.setFontSize(7)
  doc.text('Generado el: ' + fmtDateTime(new Date().toISOString()) + ' | Sistema SOI', 14, pageH - 12)
  doc.text('Documento confidencial — uso interno.', pageW - 14, pageH - 12, { align: 'right' })

  return doc
}
