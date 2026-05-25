/**
 * reportService.js
 *
 * Three institutional PDF generator functions.
 * Each function queries Supabase, builds HTML via reportTemplates, opens a new window, prints.
 *
 * Exports:
 *   generateDailyReport(sesionId)
 *   generateMonthlyAttendance(claseId, year, month)
 *   generateMonthlyPedagogical(claseId, year, month)
 *
 * Also exports stat helpers for testing:
 *   calcAttendanceStats(asistenciaArray) → { P, A, J, total }
 *   buildAlumnoAttMap(sesiones) → { [alumnoId]: { [sesionId]: estado } }
 */

import { supabase } from '../../lib/supabaseClient.js'
import { AppToast } from '../../shared/components/AppToast.js'
import { generateMonthlyPatterns } from './groqService.js'
import {
  header, footer, metricChips, attendanceCell, progressBar,
  obsBlock, contentChips, openReport, wrapDocument, esc
} from './reportTemplates.js'

// ---------------------------------------------------------------------------
// Stat helpers (exported for tests)
// ---------------------------------------------------------------------------

export function calcAttendanceStats(asistenciaArr) {
  const arr = asistenciaArr || []
  const P = arr.filter(a => a.estado === 'P').length
  const A = arr.filter(a => a.estado === 'A').length
  const J = arr.filter(a => a.estado === 'J').length
  return { P, A, J, total: arr.length }
}

export function buildAlumnoAttMap(sesiones) {
  const map = {}
  for (const ses of sesiones) {
    for (const att of ses.asistencia || []) {
      if (!map[att.alumno_id]) map[att.alumno_id] = {}
      map[att.alumno_id][ses.id] = att.estado
    }
  }
  return map
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function monthName(month) {
  const names = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  return names[month - 1] ?? ''
}

function lastDayOfMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

function padMM(n) { return String(n).padStart(2, '0') }

// ---------------------------------------------------------------------------
// Doc 1 — Daily Attendance Report
// ---------------------------------------------------------------------------

/**
 * Generate and print Daily Attendance Report for a single session.
 * @param {string} sesionId — UUID of the sesiones_clase row
 */
export async function generateDailyReport(sesionId) {
  try {
    // 1. Fetch session data in parallel
    const [sesionRes, obsRes] = await Promise.all([
      supabase
        .from('sesiones_clase')
        .select(`id, fecha, numero_sesion, tipo_sesion, asistencia,
                 clases ( id, nombre, instrumento, maestros ( nombre_completo ) )`)
        .eq('id', sesionId)
        .single(),
      supabase
        .from('observaciones_sesion')
        .select('contenido_ia_dsl, contenido_dsl')
        .eq('sesion_clase_id', sesionId)
        .maybeSingle()
    ])

    if (sesionRes.error) throw sesionRes.error
    const sesion = sesionRes.data
    const obs = obsRes.data

    // Fetch alumnos of the class
    const { data: alumnos, error: alumnosErr } = await supabase
      .from('alumnos')
      .select('id, nombre_completo, nombre_corto')
      .eq('clase_id', sesion.clases.id)
      .order('nombre_completo')
    if (alumnosErr) throw alumnosErr

    if (!alumnos || alumnos.length === 0) {
      AppToast.error('No hay alumnos registrados para esta clase.')
      return
    }

    // 2. Compute stats
    const att = sesion.asistencia || []
    const stats = calcAttendanceStats(att)
    const attByAlumno = {}
    att.forEach(a => { attByAlumno[a.alumno_id] = a })

    const landscape = alumnos.length > 20

    // Parse DSL content chips
    const dslRaw = obs?.contenido_ia_dsl || obs?.contenido_dsl || ''
    const contentItems = dslRaw
      .split(/[\n,]/)
      .map(s => s.replace(/^\s*[\-\*\d\.]+\s*/, '').trim())
      .filter(s => s.length > 2 && s.length < 60)
      .slice(0, 12)

    // Parse obs blocks
    const obsLines = dslRaw.split('\n').filter(l => l.trim())
    const obsParsed = []
    for (const line of obsLines) {
      if (/destacad|excelente|logr/i.test(line)) obsParsed.push({ type: 'pos', label: 'Destacado', text: line.replace(/^[\-\*]\s*/, '') })
      else if (/alerta|ausencia|riesgo|falt/i.test(line)) obsParsed.push({ type: 'neg', label: 'Alerta', text: line.replace(/^[\-\*]\s*/, '') })
      else if (/novedad|nota|aviso/i.test(line)) obsParsed.push({ type: 'info', label: 'Novedad', text: line.replace(/^[\-\*]\s*/, '') })
    }
    const obsBlocks = obsParsed.slice(0, 4)
      .map(o => obsBlock(o.type, o.label, o.text))
      .join('')

    // 3. Build HTML
    const docTag = `REPORTE DIARIO · ${formatDate(sesion.fecha)}`
    const clase = sesion.clases.nombre
    const docente = sesion.clases.maestros?.nombre_completo ?? 'Docente'
    const periodo = `Sesión #${sesion.numero_sesion} · ${formatDate(sesion.fecha)}`

    const headerHtml = header({ docTag, clase, docente, periodo })

    const chips = metricChips([
      { label: 'Presentes',    value: stats.P, type: 'ok'   },
      { label: 'Ausentes',     value: stats.A, type: 'bad'  },
      { label: 'Justificados', value: stats.J, type: 'warn' },
      { label: 'Total',        value: alumnos.length, type: 'navy' },
    ])

    const tableRows = alumnos.map((al, i) => {
      const a = attByAlumno[al.id]
      const estado = a?.estado ?? '—'
      const cell = ['P','A','J'].includes(estado) ? attendanceCell(estado) : esc(estado)
      const obs_ = esc(a?.observacion || '')
      return `<tr>
        <td>${i + 1}</td>
        <td>${esc(al.nombre_completo)}</td>
        <td style="text-align:center">${cell}</td>
        <td style="font-size:6.5pt;color:#6b7085">${obs_}</td>
      </tr>`
    }).join('')

    const table = `
      <p class="rpt-section-title">Registro de asistencia</p>
      <table class="rpt-table">
        <thead><tr><th>#</th><th>Alumno</th><th>Estado</th><th>Observación</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    `

    const contentSection = contentItems.length > 0
      ? `<p class="rpt-section-title">Contenido de la sesión</p>${contentChips(contentItems)}`
      : ''

    const obsSection = obsBlocks
      ? `<p class="rpt-section-title">Observaciones</p><div class="rpt-obs">${obsBlocks}</div>`
      : ''

    const footerHtml = footer(1, 1, formatDate(sesion.fecha))

    const pageClass = landscape ? 'page land' : 'page'
    const pageHtml = `
      <div class="${pageClass}">
        ${headerHtml}
        ${chips}
        ${table}
        ${contentSection}
        ${obsSection}
        ${footerHtml}
      </div>
    `

    const html = wrapDocument(pageHtml, landscape)

    // 4. Open and print
    const opened = openReport(html)
    if (!opened) {
      AppToast.warn('El navegador bloqueó la ventana emergente. Permite las ventanas emergentes para este sitio e intenta de nuevo.')
    }

  } catch (err) {
    console.error('[reportService] generateDailyReport:', err)
    AppToast.error('Error al generar el reporte: ' + err.message)
  }
}

// Placeholder functions for Doc 2 & Doc 3 to be implemented in next tasks
export async function generateMonthlyAttendance(claseId, year, month) {
  AppToast.info('Función no implementada aún.')
}

export async function generateMonthlyPedagogical(claseId, year, month) {
  AppToast.info('Función no implementada aún.')
}
