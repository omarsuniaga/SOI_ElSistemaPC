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

function formatHora(time) {
  if (!time) return EMPTY
  return String(time).slice(0, 5)
}

function formatDate(rawDate) {
  if (!rawDate) return EMPTY
  try {
    const value = String(rawDate).slice(0, 10)
    const [year, month, day] = value.split('-').map(Number)
    const date = year && month && day ? new Date(year, month - 1, day) : new Date(rawDate)
    return date.toLocaleDateString('es-DO', {
      weekday: 'short',
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
  doc.setFontSize(13)
  doc.text('El Sistema Punta Cana', 14, 10)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.text(title, 14, 17.5)
  doc.setFontSize(7.5)
  doc.text(subtitle, 14, 23.5)
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
  doc.text(`El Sistema Punta Cana — Histórico de Clases del Maestro — Generado: ${date}`, 10, height - 3)
  doc.text(`Página ${page} de ${total}`, width - 10, height - 3, { align: 'right' })
}

/**
 * Genera el documento PDF de Histórico de Clases de un Maestro.
 *
 * @param {Object} maestro - Datos del maestro
 * @param {Array} sesiones - Array de sesiones enriquecidas con roster, contenido, asistencias y justificaciones
 * @param {Object} options - { rangoLabel, claseLabel, salones }
 * @returns {jsPDF} Instancia de jsPDF
 */
export function generarPdfHistoricoMaestro(maestro = {}, sesiones = [], options = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  const generatedAt = new Date().toLocaleDateString('es-DO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const maestroNombre = clean(maestro.nombre || maestro.nombre_completo || maestro.name, 'Docente')
  const rangoLabel = options.rangoLabel || 'Histórico General'
  const claseLabel = options.claseLabel || 'Todas las clases'

  // Totales acumulados
  const totalSesiones = sesiones.length
  const totalPresentes = sesiones.reduce((acc, s) => acc + (s.presentes || 0), 0)
  const totalAusentes = sesiones.reduce((acc, s) => acc + (s.ausentes || 0), 0)
  const totalJustificados = sesiones.reduce((acc, s) => acc + (s.justificados || 0), 0)
  const totalAsistencias = totalPresentes + totalAusentes + totalJustificados
  const pctAsistencia = totalAsistencias > 0 ? Math.round((totalPresentes / totalAsistencias) * 100) : 0

  // 1. Portada / Resumen
  drawHeader(
    doc,
    'HISTÓRICO ACADÉMICO DE CLASES DEL DOCENTE',
    `Docente: ${maestroNombre} · Período: ${rangoLabel} · Filtro: ${claseLabel}`
  )

  // Resumen del Maestro y Métricas
  autoTable(doc, {
    startY: 32,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    body: [
      ['Docente', maestroNombre, 'Instrumento', clean(maestro.instrumento)],
      ['Email', clean(maestro.email), 'Teléfono', clean(maestro.telefono)],
      ['Total Sesiones Dadas', String(totalSesiones), 'Asistencia Global', `${pctAsistencia}% (${totalPresentes} P / ${totalAusentes} A / ${totalJustificados} J)`],
      ['Período / Rango', rangoLabel, 'Fecha de Emisión', generatedAt],
    ],
    styles: { fontSize: 8, cellPadding: 2, valign: 'middle' },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold', fillColor: [240, 245, 255] },
      1: { cellWidth: 60 },
      2: { cellWidth: 35, fontStyle: 'bold', fillColor: [240, 245, 255] },
      3: { cellWidth: 58 },
    },
  })

  // 2. Tabla Resumen / Índice de Sesiones
  let currentY = doc.lastAutoTable.finalY + 6
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...BRAND_PRIMARY)
  doc.text('CRONOGRAMA DE SESIONES Y ASISTENCIA', 14, currentY)
  doc.setTextColor(...BRAND_DARK)

  const cronogramaRows = sesiones.map((s, idx) => {
    const horario = s.horaInicio ? `${formatHora(s.horaInicio)} - ${formatHora(s.horaFin)}` : 'Horario N/D'
    const salon = s.salonNombre ? ` (${s.salonNombre})` : ''
    return [
      idx + 1,
      formatDate(s.fecha),
      horario + salon,
      clean(s.claseNombre),
      String(s.presentes ?? 0),
      String(s.ausentes ?? 0),
      String(s.justificados ?? 0),
      s.esSuplencia ? 'Suplencia' : 'Titular',
    ]
  })

  autoTable(doc, {
    startY: currentY + 3,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    head: [['#', 'Fecha', 'Horario / Salón', 'Clase', 'P', 'A', 'J', 'Rol']],
    body: cronogramaRows.length ? cronogramaRows : [['—', 'Sin registros en el rango', '—', '—', '—', '—', '—', '—']],
    headStyles: { fillColor: BRAND_PRIMARY, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, cellPadding: 1.8, valign: 'middle' },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 32 },
      2: { cellWidth: 42 },
      3: { cellWidth: 52 },
      4: { cellWidth: 10, halign: 'center' },
      5: { cellWidth: 10, halign: 'center' },
      6: { cellWidth: 10, halign: 'center' },
      7: { cellWidth: 24, halign: 'center' },
    },
  })

  // 3. Ficha Detallada por cada Sesión (Contenido + Roster con Justificaciones)
  sesiones.forEach((sesion, index) => {
    doc.addPage()
    drawHeader(
      doc,
      `FICHA DE CLASE · SESIÓN #${index + 1} — ${formatDate(sesion.fecha)}`,
      `Docente: ${maestroNombre} · Clase: ${clean(sesion.claseNombre)}`
    )

    const horarioText = sesion.horaInicio ? `${formatHora(sesion.horaInicio)} a ${formatHora(sesion.horaFin)}` : 'Horario no registrado'
    const salonText = sesion.salonNombre || 'Salón no asignado'

    // Metadatos de la sesión
    autoTable(doc, {
      startY: 32,
      margin: { left: 14, right: 14 },
      theme: 'grid',
      body: [
        ['Fecha de Clase', formatDate(sesion.fecha), 'Horario Impartido', horarioText],
        ['Clase / Cátedra', clean(sesion.claseNombre), 'Salón / Espacio', salonText],
        ['Presentes (P)', String(sesion.presentes ?? 0), 'Ausentes (A) / Justificados (J)', `${sesion.ausentes ?? 0} A / ${sesion.justificados ?? 0} J`],
      ],
      styles: { fontSize: 8, cellPadding: 2, valign: 'middle' },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold', fillColor: [240, 245, 255] },
        1: { cellWidth: 60 },
        2: { cellWidth: 45, fontStyle: 'bold', fillColor: [240, 245, 255] },
        3: { cellWidth: 48 },
      },
    })

    // Contenido / Observaciones registradas por el maestro
    let finalY = doc.lastAutoTable.finalY + 5
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...BRAND_PRIMARY)
    doc.text('CONTENIDO / TEMA IMPARTIDO Y OBSERVACIONES:', 14, finalY)
    doc.setTextColor(...BRAND_DARK)

    const contenidoTexto = clean(sesion.contenido, 'Sin observaciones ni temas registrados para esta sesión.')
    
    autoTable(doc, {
      startY: finalY + 2,
      margin: { left: 14, right: 14 },
      theme: 'plain',
      body: [[contenidoTexto]],
      bodyStyles: {
        fontSize: 8,
        cellPadding: 3,
        fillColor: [248, 250, 252],
        textColor: [30, 41, 59],
        lineColor: [203, 213, 225],
        lineWidth: 0.2,
      },
    })

    // Roster de Asistencia y Justificaciones
    finalY = doc.lastAutoTable.finalY + 5
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...BRAND_PRIMARY)
    doc.text('REGISTRO DE ASISTENCIA Y JUSTIFICACIONES DE ALUMNOS:', 14, finalY)
    doc.setTextColor(...BRAND_DARK)

    const roster = sesion.roster || []
    const rosterRows = roster.map((a, idx) => {
      let estadoTxt = 'Presente'
      if (a.estado === 'A') estadoTxt = 'Ausente'
      if (a.estado === 'J') estadoTxt = 'Justificado'

      const motivo = a.motivo ? a.motivo : (a.estado === 'J' ? 'Sin motivo especificado' : EMPTY)

      return [
        idx + 1,
        clean(a.nombre, 'Alumno sin nombre'),
        estadoTxt,
        motivo,
      ]
    })

    autoTable(doc, {
      startY: finalY + 2,
      margin: { left: 14, right: 14 },
      theme: 'striped',
      head: [['#', 'Nombre del Alumno', 'Asistencia', 'Causa / Justificación de Ausencia']],
      body: rosterRows.length ? rosterRows : [['—', 'Sin alumnos registrados', '—', '—']],
      headStyles: { fillColor: BRAND_PRIMARY, textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7.5, cellPadding: 2, valign: 'middle' },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 65 },
        2: { cellWidth: 28, halign: 'center' },
        3: { cellWidth: 85 },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 2) {
          const val = data.cell.raw
          if (val === 'Presente') {
            data.cell.styles.textColor = [22, 101, 52] // green
            data.cell.styles.fontStyle = 'bold'
          } else if (val === 'Ausente') {
            data.cell.styles.textColor = [153, 27, 27] // red
            data.cell.styles.fontStyle = 'bold'
          } else if (val === 'Justificado') {
            data.cell.styles.textColor = [161, 98, 7] // amber
            data.cell.styles.fontStyle = 'bold'
          }
        }
        if (data.section === 'body' && data.column.index === 3) {
          if (data.cell.raw && data.cell.raw !== EMPTY) {
            data.cell.styles.textColor = [15, 23, 42]
            data.cell.styles.fontStyle = 'italic'
          }
        }
      },
    })
  })

  // 4. Numeración final de páginas
  const totalPages = doc.internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    drawFooter(doc, p, totalPages)
  }

  return doc
}

/**
 * Descarga directamente el archivo PDF de histórico de clases.
 */
export function descargarPdfHistoricoMaestro(maestro, sesiones = [], options = {}) {
  const doc = generarPdfHistoricoMaestro(maestro, sesiones, options)
  const safeName = clean(maestro.nombre || maestro.nombre_completo || maestro.name, 'docente')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30) || 'maestro'

  const date = new Date().toISOString().slice(0, 10)
  doc.save(`historico-clases-${safeName}-${date}.pdf`)
}
