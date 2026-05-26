/**
 * attendancePdfService.js
 * Genera el PDF institucional de asistencia diaria (hoja carta, jsPDF + autoTable).
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { callGroq } from './groqService.js'

// ─── Paleta institucional ────────────────────────────────────────────────────
const C = {
  headerBg:    [15,  40,  80],   // azul institucional oscuro
  headerText:  [255, 255, 255],
  accent:      [30,  90,  180],  // azul medio (subtítulos, bordes)
  rowAlt:      [245, 248, 255],  // fila par
  rowNormal:   [255, 255, 255],
  presente:    [22,  163,  74],  // verde
  ausente:     [220,  38,  38],  // rojo
  justificado: [161, 107,   0],  // ámbar oscuro
  summary:     [240, 245, 255],  // fondo bloque resumen
  obs:         [250, 252, 255],  // fondo bloque observaciones
  border:      [180, 200, 230],
  muted:       [120, 130, 150],
  text:        [20,  30,  50],
}

// Carta: 215.9 × 279.4 mm
const PAGE_W = 215.9
const PAGE_H = 279.4
const MARGIN = 14
const CONTENT_W = PAGE_W - MARGIN * 2

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtFecha(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
  } catch { return dateStr }
}

function fmtHora(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hh = parseInt(h)
  return `${hh % 12 || 12}:${m} ${hh < 12 ? 'AM' : 'PM'}`
}

/** Convierte DSL a texto plano legible, quitando tokens */
function dslToPlain(dsl) {
  if (!dsl) return ''
  return dsl
    .replace(/#(\w[\w\s]*)/g, '$1')        // #Nombre → Nombre
    .replace(/\[([^\]]+)\]/g, '[$1]')       // [contenido] → [contenido] (conservar)
    .replace(/\(([^)]+)\)/g, '→ $1')        // (sugerencia) → → sugerencia
    .replace(/\{([^}]+)\}/g, 'Tarea: $1')   // {tarea} → Tarea: tarea
    .replace(/\$(\S+)/g, '$1')              // $medida → medida
    .replace(/>/g, '')                       // > objetivos
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Genera un resumen IA comparando asistencia actual vs snapshot anterior */
async function generarResumenIA(alumnos, estadoHoy, snapshots) {
  try {
    const resumenHoy = alumnos.map(a => {
      const e = estadoHoy[a.id]
      return `${a.nombre_completo}: ${e === 'P' ? 'Presente' : e === 'A' ? 'Ausente' : e === 'J' ? 'Justificado' : 'Sin registrar'}`
    }).join('\n')

    const snapAnterior = snapshots?.[0]
    let contextoAnterior = 'No hay registro de clase anterior disponible.'
    if (snapAnterior) {
      const asistPrev = snapAnterior.asistencia || []
      const prevMap = Object.fromEntries(asistPrev.map(a => [a.alumno_id, a.estado]))
      const lineas = alumnos.map(a => {
        const prev = prevMap[a.id]
        const hoy = estadoHoy[a.id]
        const cambio = prev && prev !== hoy ? ` (antes: ${prev})` : ''
        return `${a.nombre_completo}: ${hoy || '—'}${cambio}`
      })
      contextoAnterior = `Clase anterior (${snapAnterior.fecha || 'fecha desconocida'}):\n${lineas.join('\n')}`
    }

    const messages = [
      {
        role: 'system',
        content: `Sos un asistente pedagógico. Generá un resumen breve (máximo 3 oraciones)
comparando la asistencia de hoy con la clase anterior.
Destacá cambios significativos (alumnos que faltaron, mejoras en asistencia, tendencias).
Tono profesional y conciso. Respondé en español.`,
      },
      {
        role: 'user',
        content: `Asistencia de HOY:\n${resumenHoy}\n\n${contextoAnterior}`,
      },
    ]

    const result = await callGroq(messages)
    return result || null
  } catch {
    return null
  }
}

// ─── Sección: Header institucional ───────────────────────────────────────────

function drawHeader(doc, institucionNombre) {
  // Fondo header
  doc.setFillColor(...C.headerBg)
  doc.rect(0, 0, PAGE_W, 32, 'F')

  // Línea decorativa accent
  doc.setFillColor(...C.accent)
  doc.rect(0, 32, PAGE_W, 2, 'F')

  // Institución (izquierda)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...C.headerText)
  doc.text(institucionNombre || 'SISTEMA OPERATIVO INSTITUCIONAL', MARGIN, 13)

  // Subtítulo
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(180, 205, 240)
  doc.text('Portal de Gestión Académica', MARGIN, 20)

  // Título derecho
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...C.headerText)
  doc.text('REGISTRO DE ASISTENCIA', PAGE_W - MARGIN, 13, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(180, 205, 240)
  doc.text('Documento oficial — SOI', PAGE_W - MARGIN, 20, { align: 'right' })

  return 40 // y cursor después del header
}

// ─── Sección: Info de la clase ────────────────────────────────────────────────

function drawClaseInfo(doc, y, { clase, maestro, horario, fecha, salonNombre }) {
  const boxH = 28
  doc.setFillColor(...C.summary)
  doc.setDrawColor(...C.border)
  doc.roundedRect(MARGIN, y, CONTENT_W, boxH, 2, 2, 'FD')

  doc.setTextColor(...C.text)
  const col1 = MARGIN + 4
  const col2 = MARGIN + CONTENT_W / 2 + 4
  const lineH = 6.5

  const rows = [
    [
      ['Clase:', clase?.nombre || '—'],
      ['Fecha:', fmtFecha(fecha)],
    ],
    [
      ['Maestro:', maestro?.nombre_completo || maestro?.email || '—'],
      ['Horario:', horario ? `${fmtHora(horario.hora_inicio)} – ${fmtHora(horario.hora_fin)}` : '—'],
    ],
    [
      ['Instrumento:', clase?.instrumento || clase?.nivel || '—'],
      ['Salón:', salonNombre || '—'],
    ],
  ]

  rows.forEach((row, i) => {
    const lineY = y + 6 + i * lineH
    row.forEach(([label, value], j) => {
      const x = j === 0 ? col1 : col2
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      doc.setTextColor(...C.muted)
      doc.text(label, x, lineY)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(...C.text)
      doc.text(value, x + doc.getTextWidth(label) + 2, lineY)
    })
  })

  return y + boxH + 6
}

// ─── Sección: Tabla de asistencia ─────────────────────────────────────────────

function drawTabla(doc, y, alumnos, estado, justificaciones) {
  const rows = alumnos.map((a, i) => {
    const e = estado[a.id]
    const justif = justificaciones?.[a.id]
    return [
      String(i + 1),
      a.nombre_completo || '—',
      e === 'P' ? 'PRESENTE' : e === 'A' ? 'AUSENTE' : e === 'J' ? 'JUSTIFICADO' : '—',
      justif?.motivo ? justif.motivo.slice(0, 45) + (justif.motivo.length > 45 ? '…' : '') : '',
    ]
  })

  autoTable(doc, {
    startY: y,
    head: [['#', 'Alumno / Estudiante', 'Estado', 'Justificación']],
    body: rows,
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: CONTENT_W,
    headStyles: {
      fillColor: C.accent,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 72 },
      2: { cellWidth: 28, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: CONTENT_W - 10 - 72 - 28 },
    },
    bodyStyles: { fontSize: 8, cellPadding: 2.5, textColor: C.text },
    alternateRowStyles: { fillColor: C.rowAlt },
    didParseCell(data) {
      if (data.column.index === 2 && data.section === 'body') {
        const v = data.cell.raw
        if (v === 'PRESENTE')    data.cell.styles.textColor = C.presente
        if (v === 'AUSENTE')     data.cell.styles.textColor = C.ausente
        if (v === 'JUSTIFICADO') data.cell.styles.textColor = C.justificado
      }
    },
    styles: { lineColor: C.border, lineWidth: 0.2 },
  })

  return doc.lastAutoTable.finalY + 6
}

// ─── Sección: Resumen + barra visual ─────────────────────────────────────────

function drawResumen(doc, y, alumnos, estado, resumenIA) {
  const total      = alumnos.length
  const presentes  = Object.values(estado).filter(v => v === 'P').length
  const ausentes   = Object.values(estado).filter(v => v === 'A').length
  const justifs    = Object.values(estado).filter(v => v === 'J').length
  const pct        = total > 0 ? Math.round((presentes / total) * 100) : 0

  // Calcular altura del bloque según si hay resumenIA
  const iaLines = resumenIA
    ? doc.splitTextToSize(resumenIA, CONTENT_W - 8)
    : []
  const boxH = 20 + (iaLines.length > 0 ? 6 + iaLines.length * 4.5 : 0)

  doc.setFillColor(...C.summary)
  doc.setDrawColor(...C.border)
  doc.roundedRect(MARGIN, y, CONTENT_W, boxH, 2, 2, 'FD')

  // Título sección
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...C.accent)
  doc.text('RESUMEN DE ASISTENCIA', MARGIN + 4, y + 6)

  // Contadores
  const statsY = y + 13
  const items = [
    { label: 'Presentes',    val: presentes, color: C.presente },
    { label: 'Ausentes',     val: ausentes,  color: C.ausente },
    { label: 'Justificados', val: justifs,   color: C.justificado },
    { label: 'Total',        val: total,     color: C.accent },
  ]
  const colW = CONTENT_W / items.length

  items.forEach(({ label, val, color }, i) => {
    const cx = MARGIN + i * colW + colW / 2
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...color)
    doc.text(String(val), cx, statsY, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...C.muted)
    doc.text(label, cx, statsY + 4.5, { align: 'center' })
  })

  // Barra de asistencia
  const barY = statsY + 8
  const barW = CONTENT_W - 8
  const barH = 4
  const barX = MARGIN + 4

  doc.setFillColor(220, 220, 230)
  doc.roundedRect(barX, barY, barW, barH, 1, 1, 'F')
  if (pct > 0) {
    doc.setFillColor(...C.presente)
    doc.roundedRect(barX, barY, (barW * pct) / 100, barH, 1, 1, 'F')
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...C.text)
  doc.text(`${pct}% asistencia`, barX + barW + 2, barY + 3)

  // Resumen IA
  if (iaLines.length > 0) {
    const iaY = barY + barH + 5
    doc.setFont('helvetica', 'bolditalic')
    doc.setFontSize(7)
    doc.setTextColor(...C.accent)
    doc.text('Análisis comparativo IA:', MARGIN + 4, iaY)

    doc.setFont('helvetica', 'italic')
    doc.setFontSize(7.5)
    doc.setTextColor(...C.text)
    doc.text(iaLines, MARGIN + 4, iaY + 4.5)
  }

  return y + boxH + 6
}

// ─── Sección: Observaciones ───────────────────────────────────────────────────

function drawObservaciones(doc, y, dslContent) {
  const plain = dslToPlain(dslContent)
  if (!plain) return y

  const lines = doc.splitTextToSize(plain, CONTENT_W - 8)
  const boxH = 10 + lines.length * 4.5

  // Si no cabe en la página, nueva página
  if (y + boxH > PAGE_H - 30) {
    doc.addPage()
    y = 20
  }

  doc.setFillColor(...C.obs)
  doc.setDrawColor(...C.border)
  doc.roundedRect(MARGIN, y, CONTENT_W, boxH, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...C.accent)
  doc.text('OBSERVACIONES DE CLASE', MARGIN + 4, y + 6)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...C.text)
  doc.text(lines, MARGIN + 4, y + 11)

  return y + boxH + 6
}

// ─── Sección: Firma ───────────────────────────────────────────────────────────

function drawFirma(doc, y, maestro, fecha) {
  // Si no cabe, nueva página
  if (y + 30 > PAGE_H - 15) {
    doc.addPage()
    y = 20
  }

  // Línea de firma
  doc.setDrawColor(...C.border)
  doc.setLineWidth(0.4)
  doc.line(MARGIN, y + 14, MARGIN + 70, y + 14)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...C.muted)
  doc.text('Firma del Maestro', MARGIN, y + 18)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...C.text)
  doc.text(maestro?.nombre_completo || '—', MARGIN, y + 23)

  // Fecha a la derecha
  doc.line(PAGE_W - MARGIN - 70, y + 14, PAGE_W - MARGIN, y + 14)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...C.muted)
  doc.text('Fecha', PAGE_W - MARGIN - 70, y + 18)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...C.text)
  doc.text(fmtFecha(fecha), PAGE_W - MARGIN - 70, y + 23)

  return y + 30
}

// ─── Sección: Footer ──────────────────────────────────────────────────────────

function drawFooter(doc, totalPages) {
  const pages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)

    // Línea separadora
    doc.setDrawColor(...C.border)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, PAGE_H - 12, PAGE_W - MARGIN, PAGE_H - 12)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...C.muted)

    const ts = new Date().toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
    doc.text(`Generado por SOI · ${ts}`, MARGIN, PAGE_H - 7)
    doc.text(`Página ${i} de ${pages}`, PAGE_W - MARGIN, PAGE_H - 7, { align: 'right' })
  }
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Genera y descarga el PDF de asistencia del día.
 *
 * @param {Object} opts
 * @param {Object}   opts.clase
 * @param {Object}   opts.maestro
 * @param {Object}   opts.horario
 * @param {Array}    opts.alumnos
 * @param {Object}   opts.estado        - { alumnoId: 'P'|'A'|'J' }
 * @param {Object}   opts.justificaciones
 * @param {string}   opts.fecha
 * @param {string}   opts.dslContent
 * @param {string}   opts.salonNombre
 * @param {Array}    opts.snapshots     - sesiones anteriores para comparar
 * @param {string}   [opts.institucion] - nombre de la institución
 */
export async function generarPdfHoy({
  clase, maestro, horario, alumnos, estado, justificaciones,
  fecha, dslContent, salonNombre, snapshots, institucion,
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  // 1. Resumen IA (puede tardar, lo hacemos primero)
  const resumenIA = await generarResumenIA(alumnos, estado, snapshots)

  // 2. Construir PDF
  let y = drawHeader(doc, institucion)
  y = drawClaseInfo(doc, y, { clase, maestro, horario, fecha, salonNombre })
  y = drawTabla(doc, y, alumnos, estado, justificaciones)
  y = drawResumen(doc, y, alumnos, estado, resumenIA)
  y = drawObservaciones(doc, y, dslContent)
  y = drawFirma(doc, y, maestro, fecha)
  drawFooter(doc)

  // 3. Descargar
  const nombreClase = (clase?.nombre || 'clase').replace(/\s+/g, '_')
  const fechaStr = fecha?.replace(/-/g, '') || 'hoy'
  doc.save(`asistencia_${nombreClase}_${fechaStr}.pdf`)
}
