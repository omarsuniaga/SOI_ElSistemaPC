/**
 * pdf/reporteImpactoSocial.js
 * Generates a social impact report PDF.
 *
 * @param {object} impacto — output of domain buildImpactoSocial
 *   { totalBecas, totalPatrocinios, valorSubsidios, valorRecuperado }
 * @returns {jsPDF}
 */
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const BRAND_COLOR = [5, 150, 105]
const HEADER_TEXT_COLOR = [255, 255, 255]
const LABEL_COLOR = [100, 116, 139]
const VALUE_COLOR = [15, 23, 42]
const TEAL_COLOR = [13, 148, 136]

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

export function generateImpactoSocial(impacto) {
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
  doc.text('REPORTE DE IMPACTO SOCIAL', 14, 22)
  doc.text(fmtDate(new Date().toISOString()), pageW - 14, 22, { align: 'right' })

  // --- Sub-header ---
  doc.setFillColor(13, 148, 136)
  doc.rect(0, 36, pageW, 10, 'F')
  doc.setTextColor(...HEADER_TEXT_COLOR)
  doc.setFontSize(8)
  doc.text('Consolidado de becas, patrocinios y subsidios del periodo', 14, 43)

  // --- KPI cards (text-based) ---
  const kpiData = [
    { label: 'Total Becas', value: String(impacto?.totalBecas || 0), color: BRAND_COLOR },
    { label: 'Total Patrocinios', value: String(impacto?.totalPatrocinios || 0), color: TEAL_COLOR },
    { label: 'Valor Subsidios (%)', value: String(Number(impacto?.valorSubsidios || 0).toFixed(1)) + '%', color: BRAND_COLOR },
    { label: 'Valor Recuperado', value: fmtMoney(impacto?.valorRecuperado), color: TEAL_COLOR },
  ]

  const cardW = (pageW - 28 - 12) / 4
  const cardY = 52
  const cardH = 22

  kpiData.forEach((kpi, i) => {
    const cardX = 14 + i * (cardW + 4)
    doc.setFillColor(240, 253, 244)
    doc.roundedRect(cardX, cardY, cardW, cardH, 2, 2, 'F')
    doc.setDrawColor(...kpi.color)
    doc.setLineWidth(0.8)
    doc.line(cardX, cardY, cardX, cardY + cardH)
    doc.setTextColor(...LABEL_COLOR)
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.text(kpi.label.toUpperCase(), cardX + 3, cardY + 6)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...kpi.color)
    doc.text(kpi.value, cardX + 3, cardY + 15)
  })

  // --- Detalle table ---
  const afterCards = cardY + cardH + 10
  doc.setTextColor(...LABEL_COLOR)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('RESUMEN POR CATEGORIA', 14, afterCards)

  autoTable(doc, {
    startY: afterCards + 3,
    head: [['Categoria', 'Cantidad', 'Valor / Detalle']],
    body: [
      ['Becas otorgadas', String(impacto?.totalBecas || 0), 'Familias con reduccion de cuota'],
      ['Patrocinios activos', String(impacto?.totalPatrocinios || 0), fmtMoney(impacto?.valorRecuperado) + ' recuperado'],
      ['Porcentaje subsidios', '-', String(Number(impacto?.valorSubsidios || 0).toFixed(1)) + '% promedio'],
    ],
    headStyles: { fillColor: BRAND_COLOR, textColor: HEADER_TEXT_COLOR, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    columnStyles: {
      1: { halign: 'center', fontStyle: 'bold', textColor: BRAND_COLOR },
    },
    margin: { left: 14, right: 14 },
  })

  // --- Note ---
  const afterTable = doc.lastAutoTable.finalY + 8
  doc.setFillColor(254, 249, 195)
  doc.roundedRect(14, afterTable, pageW - 28, 16, 2, 2, 'F')
  doc.setTextColor(133, 77, 14)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text('Nota:', 18, afterTable + 6)
  doc.setFont('helvetica', 'normal')
  doc.text('Los datos de becas y patrocinios individuales se incorporaran en PR5 con el modulo de bienestar.', 18 + 8, afterTable + 6)
  doc.text('Este reporte muestra los totales agregados disponibles en el periodo actual.', 18, afterTable + 12)

  // --- Footer ---
  const pageH = doc.internal.pageSize.getHeight()
  doc.setDrawColor(...BRAND_COLOR)
  doc.setLineWidth(0.5)
  doc.line(14, pageH - 18, pageW - 14, pageH - 18)
  doc.setTextColor(...LABEL_COLOR)
  doc.setFontSize(7)
  doc.text('Generado el: ' + fmtDateTime(new Date().toISOString()) + ' | Sistema SOI', 14, pageH - 12)
  doc.text('Informe de gestion social — uso interno.', pageW - 14, pageH - 12, { align: 'right' })

  return doc
}
