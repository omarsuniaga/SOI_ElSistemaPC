import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const BRAND_PRIMARY = [0, 86, 179]
const BRAND_ACCENT = [255, 193, 7]
const BRAND_DARK = [30, 30, 30]
const BRAND_MUTED = [107, 114, 128]
const BRAND_SUCCESS = [16, 185, 129]
const BRAND_WARNING = [245, 158, 11]
const BRAND_DANGER = [220, 53, 69]

export const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const EMPTY = '—'
const BUSINESS_DAY_MINUTES = 13 * 60

function clean(value, fallback = EMPTY) {
  const text = value == null ? '' : String(value).trim()
  return text || fallback
}

function formatHour(value) {
  if (!value) return EMPTY
  return String(value).slice(0, 5)
}

function timeToMinutes(value) {
  const [hours = 0, minutes = 0] = String(value || '00:00').split(':').map(Number)
  return (hours * 60) + minutes
}

function minutesToHours(minutes) {
  const value = Number(minutes) || 0
  return `${(value / 60).toFixed(value % 60 === 0 ? 0 : 1)} h`
}

function titleCase(value) {
  const text = clean(value, '').toLowerCase()
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : EMPTY
}

function drawHeader(doc, title, subtitle) {
  const width = doc.internal.pageSize.getWidth()
  doc.setFillColor(...BRAND_PRIMARY)
  doc.rect(0, 0, width, 26, 'F')
  doc.setFillColor(...BRAND_ACCENT)
  doc.rect(0, 26, width, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('El Sistema Punta Cana', 14, 10)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(title, 14, 18)
  doc.setFontSize(7.5)
  doc.text(subtitle, 14, 24)
  doc.setTextColor(...BRAND_DARK)
}

function drawFooter(doc, page, total) {
  const width = doc.internal.pageSize.getWidth()
  const height = doc.internal.pageSize.getHeight()
  doc.setFillColor(...BRAND_PRIMARY)
  doc.rect(0, height - 8, width, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(6.5)
  const date = new Date().toLocaleDateString('es-DO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  doc.text(`El Sistema Punta Cana — Generado: ${date}`, 10, height - 3)
  doc.text(`Página ${page} de ${total}`, width - 10, height - 3, { align: 'right' })
}

export function groupSalonUsageByDay(usos = []) {
  const grouped = Object.fromEntries(DIAS_SEMANA.map((dia) => [dia, []]))

  for (const uso of usos || []) {
    const dia = clean(uso.dia, '').toLowerCase()
    if (!grouped[dia]) grouped[dia] = []
    grouped[dia].push(uso)
  }

  Object.values(grouped).forEach((items) => {
    items.sort((a, b) => timeToMinutes(a.hora_inicio) - timeToMinutes(b.hora_inicio))
  })

  return grouped
}

export function calculateUsageMinutes(usos = []) {
  return (usos || []).reduce((sum, uso) => {
    const start = timeToMinutes(uso.hora_inicio)
    const end = timeToMinutes(uso.hora_fin)
    return sum + Math.max(0, end - start)
  }, 0)
}

export function buildSalonUsageStats(salon, usos = [], businessDayMinutes = BUSINESS_DAY_MINUTES) {
  const grouped = groupSalonUsageByDay(usos)
  const totalMinutes = calculateUsageMinutes(usos)
  const emptyDays = DIAS_SEMANA.filter((dia) => (grouped[dia] || []).length === 0)
  const availableMinutes = DIAS_SEMANA.length * businessDayMinutes
  const occupancyRate = availableMinutes > 0 ? Math.round((totalMinutes / availableMinutes) * 100) : 0

  return {
    salonId: salon?.id,
    salonNombre: clean(salon?.nombre, 'Salón sin nombre'),
    totalUsos: (usos || []).length,
    totalMinutes,
    occupiedHours: minutesToHours(totalMinutes),
    emptyDays,
    emptyDaysLabel: emptyDays.length ? emptyDays.map(titleCase).join(', ') : 'Sin días vacíos',
    occupancyRate,
    status: totalMinutes === 0 ? 'vacío' : occupancyRate >= 60 ? 'alta ocupación' : 'disponible',
  }
}

export function buildSalonDayRows(usos = []) {
  const grouped = groupSalonUsageByDay(usos)

  return DIAS_SEMANA.flatMap((dia) => {
    const items = grouped[dia] || []
    if (items.length === 0) {
      return [[titleCase(dia), 'Disponible', '—', '—', 'Salón vacío ese día']]
    }

    return items.map((uso, index) => [
      index === 0 ? titleCase(dia) : '',
      `${formatHour(uso.hora_inicio)} - ${formatHour(uso.hora_fin)}`,
      clean(uso.clase_nombre),
      clean(uso.maestro_nombre, 'Sin maestro'),
      clean(uso.instrumento, 'General'),
    ])
  })
}

function drawSummaryChart(doc, stats, startY) {
  const left = 12
  const barX = 72
  const barWidth = 140
  let y = startY

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...BRAND_DARK)
  doc.text('Gráfica de utilización semanal por salón', left, y)
  y += 8

  stats.slice(0, 12).forEach((item) => {
    const rate = Math.min(100, Math.max(0, item.occupancyRate))
    const fill = rate === 0 ? BRAND_SUCCESS : rate >= 60 ? BRAND_DANGER : BRAND_WARNING

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...BRAND_DARK)
    doc.text(doc.splitTextToSize(item.salonNombre, 54), left, y + 3)
    doc.setDrawColor(220, 220, 220)
    doc.setFillColor(245, 245, 248)
    doc.roundedRect(barX, y - 1, barWidth, 5, 1, 1, 'FD')
    doc.setFillColor(...fill)
    doc.roundedRect(barX, y - 1, (barWidth * rate) / 100, 5, 1, 1, 'F')
    doc.setTextColor(...BRAND_MUTED)
    doc.text(`${rate}% · ${item.occupiedHours}`, barX + barWidth + 4, y + 3)
    y += 9
  })

  if (stats.length > 12) {
    doc.setTextColor(...BRAND_MUTED)
    doc.setFontSize(7)
    doc.text(`+ ${stats.length - 12} salones adicionales en el detalle`, left, y + 2)
    y += 6
  }

  return y
}

function drawSalonDetail(doc, salon, usos, index, total) {
  if (index > 0) doc.addPage()

  const stats = buildSalonUsageStats(salon, usos)
  drawHeader(
    doc,
    `USO DE SALÓN: ${stats.salonNombre}`,
    `Salón ${index + 1} de ${total} · Estado: ${stats.status} · Ocupación semanal estimada: ${stats.occupancyRate}%`,
  )

  autoTable(doc, {
    startY: 34,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    body: [
      ['Salón', stats.salonNombre, 'Capacidad', `${salon?.capacidad || EMPTY} personas`],
      ['Piso', salon?.piso === 0 || salon?.piso === '0' ? 'Planta Baja' : `Piso ${clean(salon?.piso)}`, 'Condición', clean(salon?.condicion || salon?.condicion_fisica)],
      ['Usos semanales', String(stats.totalUsos), 'Horas ocupadas', stats.occupiedHours],
      ['Días vacíos', stats.emptyDaysLabel, 'Estado', stats.status],
    ],
    styles: { fontSize: 7.5, cellPadding: 1.6, valign: 'top' },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: 'bold', fillColor: [240, 245, 255] },
      1: { cellWidth: 94 },
      2: { cellWidth: 30, fontStyle: 'bold', fillColor: [240, 245, 255] },
      3: { cellWidth: 90 },
    },
  })

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    margin: { left: 10, right: 10 },
    theme: 'striped',
    head: [['Día', 'Horario', 'Clase / Uso', 'Maestro', 'Instrumento']],
    body: buildSalonDayRows(usos),
    headStyles: { fillColor: BRAND_PRIMARY, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7, cellPadding: 1.6, valign: 'top' },
    alternateRowStyles: { fillColor: [240, 245, 255] },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold' },
      1: { cellWidth: 34, halign: 'center' },
      2: { cellWidth: 72 },
      3: { cellWidth: 62 },
      4: { cellWidth: 42 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.row.raw?.[1] === 'Disponible') {
        data.cell.styles.textColor = BRAND_SUCCESS
        data.cell.styles.fontStyle = 'bold'
      }
    },
    didDrawPage: (data) => drawFooter(doc, data.pageNumber, doc.internal.getNumberOfPages()),
  })
}

export function generarPdfUsoSalones(salonesReport = []) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' })
  const reports = salonesReport.length ? salonesReport : [{ salon: { nombre: 'Sin salones' }, usos: [] }]
  const stats = reports.map((item) => buildSalonUsageStats(item.salon, item.usos || []))
  const generatedAt = new Date().toLocaleDateString('es-DO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  drawHeader(
    doc,
    'REPORTE DE USO DE SALONES',
    `Generado: ${generatedAt} · Salones: ${reports.length} · Objetivo: identificar salones vacíos`,
  )

  const chartEndY = drawSummaryChart(doc, stats, 38)

  autoTable(doc, {
    startY: chartEndY + 4,
    margin: { left: 10, right: 10 },
    theme: 'striped',
    head: [['Salón', 'Usos', 'Horas ocupadas', 'Ocupación', 'Días vacíos', 'Lectura rápida']],
    body: stats.map((item) => [
      item.salonNombre,
      item.totalUsos,
      item.occupiedHours,
      `${item.occupancyRate}%`,
      item.emptyDaysLabel,
      item.status,
    ]),
    headStyles: { fillColor: BRAND_PRIMARY, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7, cellPadding: 1.5, valign: 'top' },
    alternateRowStyles: { fillColor: [240, 245, 255] },
    columnStyles: {
      0: { cellWidth: 54 },
      1: { cellWidth: 14, halign: 'center' },
      2: { cellWidth: 28, halign: 'center' },
      3: { cellWidth: 24, halign: 'center' },
      4: { cellWidth: 86 },
      5: { cellWidth: 34, halign: 'center' },
    },
  })

  reports.forEach((item, index) => {
    drawSalonDetail(doc, item.salon, item.usos || [], index + 1, reports.length)
  })

  const totalPages = doc.internal.getNumberOfPages()
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page)
    drawFooter(doc, page, totalPages)
  }

  return doc
}

export function descargarPdfUsoSalones(salonesReport = []) {
  const doc = generarPdfUsoSalones(salonesReport)
  const date = new Date().toISOString().slice(0, 10)
  doc.save(`uso-salones-${date}.pdf`)
}
