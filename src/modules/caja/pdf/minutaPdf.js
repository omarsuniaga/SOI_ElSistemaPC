/**
 * pdf/minutaPdf.js
 * Generates a meeting minutes (minuta) PDF.
 *
 * @param {object} minuta — { titulo, fecha_reunion, visibilidad, participantes, puntos_tratados, acuerdos, id }
 * @returns {jsPDF}
 */
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const BRAND_COLOR = [5, 150, 105]
const HEADER_TEXT_COLOR = [255, 255, 255]
const LABEL_COLOR = [100, 116, 139]
const VALUE_COLOR = [15, 23, 42]

function fmtDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('es-VE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

function fmtDateTime(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('es-VE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function parseListField(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  try { return JSON.parse(value) } catch (_e) { return [value] }
}

export function generateMinutaPdf(minuta) {
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
  doc.text('MINUTA DE REUNION', 14, 22)
  doc.text('Visibilidad: ' + (minuta?.visibilidad || '-').toUpperCase(), pageW - 14, 22, { align: 'right' })

  // --- Titulo ---
  doc.setTextColor(...VALUE_COLOR)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  const titulo = minuta?.titulo || 'Sin titulo'
  doc.text(titulo, 14, 46)

  doc.setTextColor(...LABEL_COLOR)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Fecha: ' + fmtDate(minuta?.fecha_reunion), 14, 53)

  // --- Participantes ---
  const participantes = parseListField(minuta?.participantes)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...LABEL_COLOR)
  doc.text('PARTICIPANTES', 14, 62)

  const partRows = participantes.length > 0
    ? participantes.map((p, i) => [String(i + 1), typeof p === 'object' ? (p.nombre || JSON.stringify(p)) : String(p)])
    : [['—', 'Sin participantes registrados']]

  autoTable(doc, {
    startY: 65,
    head: [['#', 'Nombre / Cargo']],
    body: partRows,
    headStyles: { fillColor: BRAND_COLOR, textColor: HEADER_TEXT_COLOR, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    columnStyles: { 0: { cellWidth: 12, halign: 'center' } },
    margin: { left: 14, right: 14 },
  })

  // --- Puntos tratados ---
  const afterPart = doc.lastAutoTable.finalY + 8
  doc.setTextColor(...LABEL_COLOR)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('PUNTOS TRATADOS', 14, afterPart)

  const puntos = parseListField(minuta?.puntos_tratados)
  const puntosRows = puntos.length > 0
    ? puntos.map((p, i) => [String(i + 1) + '.', typeof p === 'object' ? JSON.stringify(p) : String(p)])
    : [['—', 'Sin puntos registrados']]

  autoTable(doc, {
    startY: afterPart + 3,
    head: [],
    body: puntosRows,
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: { top: 2, bottom: 2, left: 2, right: 2 } },
    columnStyles: {
      0: { cellWidth: 10, fontStyle: 'bold', textColor: BRAND_COLOR },
      1: { textColor: VALUE_COLOR },
    },
    margin: { left: 14, right: 14 },
  })

  // --- Acuerdos ---
  const acuerdos = parseListField(minuta?.acuerdos)
  if (acuerdos.length > 0) {
    const afterPuntos = doc.lastAutoTable.finalY + 8
    doc.setTextColor(...LABEL_COLOR)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('ACUERDOS Y COMPROMISOS', 14, afterPuntos)

    const acuerdoRows = acuerdos.map((a, i) => [String(i + 1) + '.', typeof a === 'object' ? JSON.stringify(a) : String(a)])

    autoTable(doc, {
      startY: afterPuntos + 3,
      head: [],
      body: acuerdoRows,
      theme: 'grid',
      styles: { fontSize: 8.5, cellPadding: { top: 2, bottom: 2, left: 2, right: 2 } },
      columnStyles: {
        0: { cellWidth: 10, fontStyle: 'bold', textColor: BRAND_COLOR },
        1: { textColor: VALUE_COLOR },
      },
      margin: { left: 14, right: 14 },
    })
  }

  // --- Firma ---
  const pageH = doc.internal.pageSize.getHeight()
  const sigY = pageH - 42
  doc.setDrawColor(...LABEL_COLOR)
  doc.setLineWidth(0.3)
  doc.line(14, sigY, 80, sigY)
  doc.setTextColor(...LABEL_COLOR)
  doc.setFontSize(8)
  doc.text('Secretaria / Elaboro', 14, sigY + 5)
  doc.line(pageW - 14 - 66, sigY, pageW - 14, sigY)
  doc.text('Coordinacion / Aprobado', pageW - 14 - 66, sigY + 5)

  // --- Footer ---
  doc.setDrawColor(...BRAND_COLOR)
  doc.setLineWidth(0.5)
  doc.line(14, pageH - 18, pageW - 14, pageH - 18)
  doc.setTextColor(...LABEL_COLOR)
  doc.setFontSize(7)
  doc.text('Generado el: ' + fmtDateTime(new Date().toISOString()) + ' | Sistema SOI', 14, pageH - 12)
  doc.text('Documento oficial — distribucion segun visibilidad.', pageW - 14, pageH - 12, { align: 'right' })

  return doc
}
