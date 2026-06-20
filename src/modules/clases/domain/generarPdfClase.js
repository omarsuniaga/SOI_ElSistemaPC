import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatHora, getEstadoLabel } from '../utils/clasesUtils.js'

const BRAND_PRIMARY = [0, 86, 179]
const BRAND_ACCENT = [255, 193, 7]
const BRAND_DARK = [30, 30, 30]
const EMPTY = '—'

function clean(value, fallback = EMPTY) {
  const text = value == null ? '' : String(value).trim()
  return text || fallback
}

function findById(items = [], id) {
  if (!id) return null
  return items.find((item) => item?.id === id) || null
}

function resolveName(entity) {
  return clean(entity?.nombre_completo || entity?.nombre || entity?.name)
}

function titleCaseDay(day) {
  const value = clean(day, '').toLowerCase()
  if (!value) return EMPTY
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatDate(rawDate) {
  if (!rawDate) return EMPTY
  try {
    const value = String(rawDate).slice(0, 10)
    const [year, month, day] = value.split('-').map(Number)
    const date = year && month && day ? new Date(year, month - 1, day) : new Date(rawDate)
    return date.toLocaleDateString('es-DO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).replace(' de ', ' ')
  } catch {
    return EMPTY
  }
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

export function resolveClasePdfMetadata(clase, { maestros = [], programas = [] } = {}) {
  const principal = findById(maestros, clase?.maestro_principal_id || clase?.maestro_id)
  const suplente = findById(maestros, clase?.maestro_suplente_id || clase?.maestro_auxiliar_id)
  const programa = findById(programas, clase?.programa_id)

  return {
    nombre: clean(clase?.nombre, 'Clase sin nombre'),
    instrumento: clean(clase?.instrumento),
    estado: getEstadoLabel(clase?.estado || 'activa'),
    tipo: clean(clase?.tipo_clase || clase?.tipo),
    programa: resolveName(programa),
    maestroPrincipal: resolveName(principal),
    maestroSuplente: suplente ? resolveName(suplente) : EMPTY,
    capacidad: clase?.capacidad_maxima ?? clase?.max_alumnos ?? EMPTY,
    descripcion: clean(clase?.descripcion || clase?.notas_pedagogicas),
  }
}

export function formatClaseHorariosForPdf(horarios = [], salones = []) {
  if (!horarios?.length) return EMPTY

  return horarios.map((horario) => {
    const salon = findById(salones, horario?.salon_id)
    const salonName = salon ? resolveName(salon) : 'Sin salón'
    return `${titleCaseDay(horario?.dia)} ${formatHora(horario?.hora_inicio)} - ${formatHora(horario?.hora_fin)} · ${salonName}`
  }).join('\n')
}

export function buildClasePdfRows(inscritos = []) {
  return inscritos.map((inscripcion, index) => {
    const alumno = inscripcion?.alumno || inscripcion || {}
    const turno = inscripcion?.hora_inicio || inscripcion?.hora_fin
      ? `${formatHora(inscripcion?.hora_inicio)} - ${formatHora(inscripcion?.hora_fin)}`
      : EMPTY

    return [
      index + 1,
      clean(alumno.nombre_completo || alumno.nombre, 'Sin nombre'),
      clean(alumno.documento_identidad || alumno.cedula || alumno.identificacion),
      clean(alumno.instrumento_principal || alumno.instrumento),
      clean(alumno.telefono || alumno.telefono_contacto || alumno.celular),
      formatDate(inscripcion?.fecha_inscripcion || inscripcion?.created_at),
      turno,
    ]
  })
}

export function buildClasePdfFilename(claseNombre, date = new Date().toISOString().slice(0, 10)) {
  const slug = clean(claseNombre, 'clase')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'clase'

  return `clase-${slug}-${date}.pdf`
}

export function generarPdfClase(clase, inscritos = [], context = {}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' })
  const metadata = resolveClasePdfMetadata(clase, context)
  const horarios = formatClaseHorariosForPdf(clase?.horarios || [], context.salones || [])
  const generatedAt = new Date().toLocaleDateString('es-DO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  drawHeader(
    doc,
    'REPORTE DE CLASE',
    `${metadata.nombre} · Generado: ${generatedAt} · Total alumnos: ${inscritos.length}`,
  )

  autoTable(doc, {
    startY: 34,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    body: [
      ['Clase', metadata.nombre, 'Estado', metadata.estado],
      ['Maestro titular', metadata.maestroPrincipal, 'Maestro suplente', metadata.maestroSuplente],
      ['Instrumento', metadata.instrumento, 'Programa', metadata.programa],
      ['Tipo', metadata.tipo, 'Capacidad', String(metadata.capacidad)],
      ['Horarios', horarios, 'Notas', metadata.descripcion],
    ],
    styles: { fontSize: 7.5, cellPadding: 1.5, valign: 'top' },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold', fillColor: [240, 245, 255] },
      1: { cellWidth: 82 },
      2: { cellWidth: 28, fontStyle: 'bold', fillColor: [240, 245, 255] },
      3: { cellWidth: 120 },
    },
  })

  const rows = buildClasePdfRows(inscritos)
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    margin: { left: 10, right: 10 },
    theme: 'striped',
    head: [['#', 'Alumno', 'Documento', 'Instrumento', 'Teléfono', 'Inscripción', 'Turno individual']],
    body: rows.length ? rows : [['—', 'No hay alumnos inscritos', '—', '—', '—', '—', '—']],
    headStyles: { fillColor: BRAND_PRIMARY, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7, cellPadding: 1.5 },
    alternateRowStyles: { fillColor: [240, 245, 255] },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 58 },
      2: { cellWidth: 34 },
      3: { cellWidth: 34 },
      4: { cellWidth: 38 },
      5: { cellWidth: 28, halign: 'center' },
      6: { cellWidth: 32, halign: 'center' },
    },
    didDrawPage: (data) => {
      drawFooter(doc, data.pageNumber, doc.internal.getNumberOfPages())
    },
  })

  const totalPages = doc.internal.getNumberOfPages()
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page)
    drawFooter(doc, page, totalPages)
  }

  return doc
}


function drawClaseMetadataTable(doc, clase, inscritos, context, startY) {
  const metadata = resolveClasePdfMetadata(clase, context)
  const horarios = formatClaseHorariosForPdf(clase?.horarios || [], context.salones || [])

  autoTable(doc, {
    startY,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    body: [
      ['Clase', metadata.nombre, 'Estado', metadata.estado],
      ['Maestro titular', metadata.maestroPrincipal, 'Maestro suplente', metadata.maestroSuplente],
      ['Instrumento', metadata.instrumento, 'Programa', metadata.programa],
      ['Tipo', metadata.tipo, 'Capacidad', String(metadata.capacidad)],
      ['Horarios', horarios, 'Total alumnos', String(inscritos.length)],
    ],
    styles: { fontSize: 7.5, cellPadding: 1.5, valign: 'top' },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold', fillColor: [240, 245, 255] },
      1: { cellWidth: 82 },
      2: { cellWidth: 28, fontStyle: 'bold', fillColor: [240, 245, 255] },
      3: { cellWidth: 120 },
    },
  })

  return doc.lastAutoTable.finalY
}

function drawAlumnosTable(doc, inscritos, startY) {
  const rows = buildClasePdfRows(inscritos)

  autoTable(doc, {
    startY,
    margin: { left: 10, right: 10 },
    theme: 'striped',
    head: [['#', 'Alumno', 'Documento', 'Instrumento', 'Tel?fono', 'Inscripci?n', 'Turno individual']],
    body: rows.length ? rows : [['?', 'No hay alumnos inscritos', '?', '?', '?', '?', '?']],
    headStyles: { fillColor: BRAND_PRIMARY, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7, cellPadding: 1.5 },
    alternateRowStyles: { fillColor: [240, 245, 255] },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 58 },
      2: { cellWidth: 34 },
      3: { cellWidth: 34 },
      4: { cellWidth: 38 },
      5: { cellWidth: 28, halign: 'center' },
      6: { cellWidth: 32, halign: 'center' },
    },
    didDrawPage: (data) => {
      drawFooter(doc, data.pageNumber, doc.internal.getNumberOfPages())
    },
  })

  return doc.lastAutoTable.finalY
}

export function generarPdfListadoAlumnosPorClases(clasesReport = [], context = {}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' })
  const generatedAt = new Date().toLocaleDateString('es-DO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const reports = clasesReport.length
    ? clasesReport
    : [{ clase: { nombre: 'Sin clases' }, inscritos: [] }]

  reports.forEach((item, index) => {
    if (index > 0) doc.addPage()

    const clase = item.clase || {}
    const inscritos = item.inscritos || []
    const metadata = resolveClasePdfMetadata(clase, context)

    drawHeader(
      doc,
      'PDF LISTADOS ALUMNOS X CLASES',
      `${metadata.nombre} ? Generado: ${generatedAt} ? Clase ${index + 1} de ${reports.length}`,
    )

    const metadataEndY = drawClaseMetadataTable(doc, clase, inscritos, context, 34)
    drawAlumnosTable(doc, inscritos, metadataEndY + 8)
  })

  const totalPages = doc.internal.getNumberOfPages()
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page)
    drawFooter(doc, page, totalPages)
  }

  return doc
}

export function descargarPdfClase(clase, inscritos = [], context = {}) {
  const doc = generarPdfClase(clase, inscritos, context)
  doc.save(buildClasePdfFilename(clase?.nombre))
}

export function descargarPdfListadoAlumnosPorClases(clasesReport = [], context = {}) {
  const doc = generarPdfListadoAlumnosPorClases(clasesReport, context)
  const date = new Date().toISOString().slice(0, 10)
  doc.save(`listado-alumnos-por-clases-${date}.pdf`)
}

