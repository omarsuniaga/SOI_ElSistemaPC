/**
 * pdf/recibosPago.js
 * Generates a payment receipt PDF for a single pago.
 *
 * @param {object} pago    — pago record (monto, metodo_pago, fecha_pago, id, concepto, cuota_id)
 * @param {object} familia — familia record (nombre, codigo, representante_nombre)
 * @param {object} cajero  — { nombre, email } from session
 * @returns {jsPDF}        — caller should call doc.save('recibo-...pdf') or doc.output('blob')
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
  return new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtDateTime(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('es-VE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function generateReciboPago(pago, familia, cajero) {
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
  doc.text('RECIBO DE PAGO', 14, 22)

  const reciboNum = String(pago.id || '').slice(0, 8).toUpperCase() || 'N/A'
  doc.text('Nro: ' + reciboNum, pageW - 14, 22, { align: 'right' })

  // --- Familia section ---
  doc.setTextColor(...LABEL_COLOR)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DE LA FAMILIA', 14, 46)

  const familiaRows = [
    ['Familia', familia?.nombre || familia?.codigo || '-'],
    ['Representante', familia?.representante_nombre || familia?.representante || '-'],
    ['Codigo', familia?.codigo || '-'],
    ['Fecha de pago', fmtDate(pago.fecha_pago)],
  ]

  autoTable(doc, {
    startY: 49,
    head: [],
    body: familiaRows,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 } },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: LABEL_COLOR, cellWidth: 50 },
      1: { textColor: VALUE_COLOR },
    },
    margin: { left: 14, right: 14 },
  })

  // --- Detalle del pago ---
  const afterFamilia = doc.lastAutoTable.finalY + 8

  doc.setTextColor(...LABEL_COLOR)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('DETALLE DEL PAGO', 14, afterFamilia)

  autoTable(doc, {
    startY: afterFamilia + 3,
    head: [['Concepto', 'Metodo de pago', 'Monto']],
    body: [[
      pago.concepto || (pago.cuota_id ? 'Cuota ' + pago.cuota_id : 'Pago general'),
      pago.metodo_pago || '-',
      fmtMoney(pago.monto),
    ]],
    headStyles: { fillColor: BRAND_COLOR, textColor: HEADER_TEXT_COLOR, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    margin: { left: 14, right: 14 },
  })

  // --- Total box ---
  const afterDetalle = doc.lastAutoTable.finalY + 6
  const totalBoxW = 80
  const totalBoxX = pageW - 14 - totalBoxW

  doc.setFillColor(...BRAND_COLOR)
  doc.roundedRect(totalBoxX, afterDetalle, totalBoxW, 16, 3, 3, 'F')
  doc.setTextColor(...HEADER_TEXT_COLOR)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('TOTAL PAGADO:', totalBoxX + 4, afterDetalle + 7)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(fmtMoney(pago.monto), totalBoxX + totalBoxW - 4, afterDetalle + 11, { align: 'right' })

  // --- Cajero ---
  const afterTotal = afterDetalle + 26
  doc.setTextColor(...LABEL_COLOR)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Registrado por: ' + (cajero?.nombre || cajero?.email || '-'), 14, afterTotal)

  // --- Footer ---
  const pageH = doc.internal.pageSize.getHeight()
  doc.setDrawColor(...BRAND_COLOR)
  doc.setLineWidth(0.5)
  doc.line(14, pageH - 18, pageW - 14, pageH - 18)
  doc.setTextColor(...LABEL_COLOR)
  doc.setFontSize(7)
  doc.text('Generado el: ' + fmtDateTime(new Date().toISOString()) + ' | Sistema SOI', 14, pageH - 12)
  doc.text('Este documento es un comprobante de pago valido.', pageW - 14, pageH - 12, { align: 'right' })

  return doc
}
