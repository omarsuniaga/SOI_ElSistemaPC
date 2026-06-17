import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const BRAND_PRIMARY = [0, 86, 179]
const BRAND_ACCENT = [255, 193, 7]
const BRAND_DARK = [30, 30, 30]
const EMPTY = '—'

function clean(value, fallback = EMPTY) {
  const text = value == null ? '' : String(value).trim()
  return text || fallback
}

function titleCaseDay(day) {
  const value = clean(day, '').toLowerCase()
  if (!value) return EMPTY
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatHora(time) {
  if (!time) return EMPTY
  return time.slice(0, 5)
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

export function generarPdfReporteMaestro(maestro, clases = [], inscripcionesMap = {}, context = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  const generatedAt = new Date().toLocaleDateString('es-DO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  // 1. DIBUJAR PÁGINA DE PERFIL / HORARIO GENERAL DEL MAESTRO
  drawHeader(
    doc,
    'REPORTE ACADÉMICO DE DOCENTE',
    `Docente: ${clean(maestro.nombre)} · Generado: ${generatedAt}`
  )

  // Tabla de Perfil del Maestro
  const estadoLabel = maestro.is_active ? 'Activo' : 'Inactivo'
  autoTable(doc, {
    startY: 32,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    body: [
      ['Docente', clean(maestro.nombre), 'Estado', estadoLabel],
      ['Email', clean(maestro.email), 'Teléfono', clean(maestro.telefono)],
      ['Instrumento Principal', clean(maestro.instrumento), 'Especialidades', (maestro.especialidades || []).join(', ') || EMPTY],
      ['Biografía / Reseña', clean(maestro.bio), 'Total Clases Asignadas', String(clases.length)],
    ],
    styles: { fontSize: 8.5, cellPadding: 2, valign: 'top' },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold', fillColor: [240, 245, 255] },
      1: { cellWidth: 60 },
      2: { cellWidth: 35, fontStyle: 'bold', fillColor: [240, 245, 255] },
      3: { cellWidth: 58 },
    },
  })

  // Listado de clases asignadas y sus horarios resumidos
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('RESUMEN DE HORARIOS Y CLASES', 14, doc.lastAutoTable.finalY + 8)

  const salones = context.salones || []
  const findSalon = (id) => salones.find(s => s.id === id)?.nombre || 'Sin salón'

  const clasesRows = clases.map((c, idx) => {
    const horariosTexto = (c.horarios || []).map(h => 
      `${titleCaseDay(h.dia)} ${formatHora(h.hora_inicio)} - ${formatHora(h.hora_fin)} (${findSalon(h.salon_id)})`
    ).join('\n') || EMPTY

    return [
      idx + 1,
      clean(c.nombre),
      clean(c.instrumento),
      horariosTexto,
      c.total_alumnos || 0,
      c.es_suplente ? 'Suplente' : 'Titular'
    ]
  })

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 12,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    head: [['#', 'Nombre de Clase', 'Instrumento', 'Horarios y Salones', 'Alumnos', 'Rol']],
    body: clasesRows.length ? clasesRows : [['—', 'Sin clases asignadas', '—', '—', '—', '—']],
    headStyles: { fillColor: BRAND_PRIMARY, textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8, cellPadding: 2, valign: 'middle' },
    alternateRowStyles: { fillColor: [240, 245, 255] },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 45 },
      2: { cellWidth: 30 },
      3: { cellWidth: 65 },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 18, halign: 'center' }
    }
  })

  // 2. CREAR PÁGINAS DE LISTADO DE ALUMNOS POR CLASE
  clases.forEach((c) => {
    doc.addPage()
    drawHeader(
      doc,
      `LISTADO DE ALUMNOS — CLASE: ${c.nombre.toUpperCase()}`,
      `Docente: ${clean(maestro.nombre)} · Instrumento: ${clean(c.instrumento)}`
    )

    // Horarios de la clase
    const horariosTexto = (c.horarios || []).map(h => 
      `${titleCaseDay(h.dia)} ${formatHora(h.hora_inicio)} - ${formatHora(h.hora_fin)} en ${findSalon(h.salon_id)}`
    ).join(', ') || 'Sin horario'

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.text(`Horarios: ${horariosTexto}`, 14, 32)
    doc.text(`Rol docente: ${c.es_suplente ? 'Suplente' : 'Titular'}`, 14, 36)

    // Estudiantes inscritos en esta clase
    const inscritos = inscripcionesMap[c.id] || []
    
    const alumnosRows = inscritos.map((ins, index) => {
      const a = ins.alumno || ins || {}
      return [
        index + 1,
        clean(a.nombre_completo || a.nombre, 'Sin nombre'),
        clean(a.cedula || a.documento_identidad),
        clean(a.instrumento_principal || a.instrumento),
        clean(a.familiar_telefono || a.telefono || a.representante_tlf),
        formatDate(ins.fecha_inscripcion || ins.created_at)
      ]
    })

    autoTable(doc, {
      startY: 40,
      margin: { left: 14, right: 14 },
      theme: 'striped',
      head: [['#', 'Alumno', 'Cédula / Documento', 'Instrumento', 'Teléfono Contacto', 'Fecha Inscripción']],
      body: alumnosRows.length ? alumnosRows : [['—', 'No hay alumnos inscritos en esta clase', '—', '—', '—', '—']],
      headStyles: { fillColor: BRAND_PRIMARY, textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
      bodyStyles: { fontSize: 8, cellPadding: 2 },
      alternateRowStyles: { fillColor: [240, 245, 255] },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 55 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30 },
        4: { cellWidth: 35 },
        5: { cellWidth: 23, halign: 'center' }
      }
    })
  })

  // Añadir numeración de páginas correcta en pie de página
  const totalPages = doc.internal.getNumberOfPages()
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page)
    drawFooter(doc, page, totalPages)
  }

  return doc
}

export function descargarPdfReporteMaestro(maestro, clases = [], inscripcionesMap = {}, context = {}) {
  const doc = generarPdfReporteMaestro(maestro, clases, inscripcionesMap, context)
  const safeName = clean(maestro.nombre, 'docente')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30) || 'reporte'

  const date = new Date().toISOString().slice(0, 10)
  doc.save(`reporte-clases-maestro-${safeName}-${date}.pdf`)
}
