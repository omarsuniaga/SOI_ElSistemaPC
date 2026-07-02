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
  header,
  footer,
  metricChips,
  attendanceCell,
  progressBar,
  obsBlock,
  contentChips,
  compBar,
  openReport,
  wrapDocument,
  esc,
} from './reportTemplates.js'

// ---------------------------------------------------------------------------
// Stat helpers (exported for tests)
// ---------------------------------------------------------------------------

export function calcAttendanceStats(asistenciaArr) {
  const arr = asistenciaArr || []
  const P = arr.filter((a) => a.estado === 'P').length
  const A = arr.filter((a) => a.estado === 'A').length
  const J = arr.filter((a) => a.estado === 'J').length
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
  const names = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ]
  return names[month - 1] ?? ''
}

function lastDayOfMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

function padMM(n) {
  return String(n).padStart(2, '0')
}

// ---------------------------------------------------------------------------
// Doc 1 — Daily Attendance Report
// ---------------------------------------------------------------------------

/**
 * Generate and print Daily Attendance Report for a single session.
 * @param {string} sesionId — UUID of the sesiones_clase row
 */
export async function generateDailyReport(sesionId) {
  try {
    // 1. Fetch session data
    const { data: sesion, error: sesionErr } = await supabase
      .from('sesiones_clase')
      .select('id, fecha, clase_id, asistencia, contenido')
      .eq('id', sesionId)
      .single()

    if (sesionErr) throw sesionErr

    // Fetch class details — for emergent sessions (clase_id = null) use session data directly
    let claseData
    if (sesion.clase_id) {
      const { data: cd, error: claseErr } = await supabase
        .from('clases')
        .select('id, nombre, instrumento, maestro_id')
        .eq('id', sesion.clase_id)
        .single()
      if (claseErr) throw claseErr
      claseData = cd
    } else {
      // Sesión emergente: construir objeto clase sintético desde la sesión
      claseData = {
        id: sesionId,
        nombre: sesion.actividad || 'Actividad Especial',
        instrumento: sesion.motivo || '',
        maestro_id: sesion.maestro_id,
      }
    }

    // Fetch maestro details
    let maestroNombre = 'Docente'
    if (claseData.maestro_id) {
      const { data: maestroData } = await supabase
        .from('maestros')
        .select('nombre_completo')
        .eq('id', claseData.maestro_id)
        .single()
      if (maestroData) maestroNombre = maestroData.nombre_completo
    }

    // Count sessions up to this date (solo para clases regulares)
    let numeroSesion = 1
    if (sesion.clase_id) {
      const { count } = await supabase
        .from('sesiones_clase')
        .select('id', { count: 'exact', head: true })
        .eq('clase_id', sesion.clase_id)
        .lte('fecha', sesion.fecha)
      numeroSesion = count || 1
    }

    // Fetch alumnos: para clases regulares desde alumnos_clases;
    // para emergentes desde el JSONB asistencia de la sesión
    let alumnos = []
    if (sesion.clase_id) {
      const { data: alumnosClases, error: alumnosErr } = await supabase
        .from('alumnos_clases')
        .select('alumnos(id, nombre_completo)')
        .eq('clase_id', sesion.clase_id)
        .eq('activo', true)
        .order('alumnos(nombre_completo)')
      if (alumnosErr) throw alumnosErr
      alumnos = (alumnosClases || []).map((r) => r.alumnos).filter(Boolean)
    } else {
      // Emergente: cargar alumnos desde la asistencia JSONB
      const alumnoIds = (sesion.asistencia || []).map((a) => a.alumno_id).filter(Boolean)
      if (alumnoIds.length > 0) {
        const { data: alumnosData } = await supabase
          .from('alumnos')
          .select('id, nombre_completo')
          .in('id', alumnoIds)
        alumnos = alumnosData || []
      }
    }

    if (!alumnos || alumnos.length === 0) {
      AppToast.error('No hay alumnos registrados para esta actividad.')
      return
    }

    // 2. Compute stats
    const att = sesion.asistencia || []
    const stats = calcAttendanceStats(att)
    const attByAlumno = {}
    att.forEach((a) => {
      attByAlumno[a.alumno_id] = a
    })

    const landscape = alumnos.length > 20

    // Parse DSL content from sesiones_clase.contenido (Bug #3 fix)
    const dslRaw = sesion.contenido || ''
    const contentItems = dslRaw
      .split(/[\n,]/)
      .map((s) => s.replace(/^\s*[-*\d.]+\s*/, '').trim())
      .filter((s) => s.length > 2 && s.length < 60)
      .slice(0, 12)

    // Parse obs blocks
    const obsLines = dslRaw.split('\n').filter((l) => l.trim())
    const obsParsed = []
    for (const line of obsLines) {
      if (/destacad|excelente|logr/i.test(line))
        obsParsed.push({ type: 'pos', label: 'Destacado', text: line.replace(/^[-*]\s*/, '') })
      else if (/alerta|ausencia|riesgo|falt/i.test(line))
        obsParsed.push({ type: 'neg', label: 'Alerta', text: line.replace(/^[-*]\s*/, '') })
      else if (/novedad|nota|aviso/i.test(line))
        obsParsed.push({ type: 'info', label: 'Novedad', text: line.replace(/^[-*]\s*/, '') })
    }
    const obsBlocks = obsParsed
      .slice(0, 4)
      .map((o) => obsBlock(o.type, o.label, o.text))
      .join('')

    // 3. Build HTML
    const docTag = `REPORTE DIARIO · ${formatDate(sesion.fecha)}`
    const clase = claseData.nombre
    const docente = maestroNombre
    const periodo = `Sesión #${numeroSesion} · ${formatDate(sesion.fecha)}`

    const headerHtml = header({ docTag, clase, docente, periodo })

    const chips = metricChips([
      { label: 'Presentes', value: stats.P, type: 'ok' },
      { label: 'Ausentes', value: stats.A, type: 'bad' },
      { label: 'Justificados', value: stats.J, type: 'warn' },
      { label: 'Total', value: alumnos.length, type: 'navy' },
    ])

    const tableRows = alumnos
      .map((al, i) => {
        const a = attByAlumno[al.id]
        const estado = a?.estado ?? '—'
        const cell = ['P', 'A', 'J'].includes(estado) ? attendanceCell(estado) : esc(estado)
        const obs_ = esc(a?.observacion || '')
        return `<tr>
        <td>${i + 1}</td>
        <td>${esc(al.nombre_completo)}</td>
        <td style="text-align:center">${cell}</td>
        <td style="font-size:6.5pt;color:#6b7085">${obs_}</td>
      </tr>`
      })
      .join('')

    const table = `
      <p class="rpt-section-title">Registro de asistencia</p>
      <table class="rpt-table">
        <thead><tr><th>#</th><th>Alumno</th><th>Estado</th><th>Observación</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    `

    const contentSection =
      contentItems.length > 0
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

    // 4. Open and print (falls back to file download if popup blocked)
    const date = sesion.fecha?.replace(/-/g, '') || 'fecha'
    const opened = openReport(html, `reporte-diario-${date}`)
    if (!opened) {
      AppToast.info('El reporte se descargó como archivo. Abrilo en el navegador y usá Imprimir → Guardar como PDF.')
    }
  } catch (err) {
    console.error('[reportService] generateDailyReport:', err)
    AppToast.error('Error al generar el reporte: ' + err.message)
  }
}

// ---------------------------------------------------------------------------
// Doc 2 — Monthly Attendance Summary
// ---------------------------------------------------------------------------

/**
 * Generate and print Monthly Attendance Summary.
 * @param {string} claseId — UUID of the class
 * @param {number} year    — e.g. 2026
 * @param {number} month   — 1–12
 */
export async function generateMonthlyAttendance(claseId, year, month) {
  try {
    const mm = padMM(month)
    const lastDay = lastDayOfMonth(year, month)
    const rangeStart = `${year}-${mm}-01`
    const rangeEnd = `${year}-${mm}-${lastDay}`

    // Previous month
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    const prevMM = padMM(prevMonth)
    const prevLastDay = lastDayOfMonth(prevYear, prevMonth)
    const prevStart = `${prevYear}-${prevMM}-01`
    const prevEnd = `${prevYear}-${prevMM}-${prevLastDay}`

    // Parallel fetch
    const [sesionesRes, justRes, prevSesRes, claseRes, alumnosRes] = await Promise.all([
      supabase
        .from('sesiones_clase')
        .select('id, fecha, asistencia')
        .eq('clase_id', claseId)
        .gte('fecha', rangeStart)
        .lte('fecha', rangeEnd)
        .order('fecha'),
      supabase
        .from('justificaciones')
        .select('alumno_id, fecha, tipo, motivo, alumnos(nombre_completo)')
        .eq('clase_id', claseId)
        .gte('fecha', rangeStart)
        .lte('fecha', rangeEnd),
      supabase
        .from('sesiones_clase')
        .select('id, asistencia')
        .eq('clase_id', claseId)
        .gte('fecha', prevStart)
        .lte('fecha', prevEnd),
      supabase
        .from('clases')
        .select('id, nombre, instrumento, maestro_id')
        .eq('id', claseId)
        .single(),
      supabase
        .from('alumnos_clases')
        .select('alumnos(id, nombre_completo)')
        .eq('clase_id', claseId)
        .eq('activo', true),
    ])

    for (const res of [sesionesRes, claseRes, alumnosRes]) {
      if (res.error) throw res.error
    }

    const sesiones = sesionesRes.data || []
    const justificaciones = justRes.data || []
    const prevSesiones = prevSesRes.data || []
    const claseData = claseRes.data
    const alumnos = (alumnosRes.data || [])
      .map((r) => r.alumnos)
      .filter(Boolean)
      .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo))

    if (sesiones.length === 0) {
      AppToast.error('No hay sesiones registradas para este período.')
      return
    }

    // Fetch maestro
    let maestroNombre = 'Docente'
    if (claseData.maestro_id) {
      const { data: maestroData } = await supabase
        .from('maestros')
        .select('nombre_completo')
        .eq('id', claseData.maestro_id)
        .single()
      if (maestroData) maestroNombre = maestroData.nombre_completo
    }

    // Count sessions before this month
    const { count: prevCount } = await supabase
      .from('sesiones_clase')
      .select('id', { count: 'exact', head: true })
      .eq('clase_id', claseId)
      .lt('fecha', rangeStart)
    const baseIndex = prevCount || 0

    const landscape = alumnos.length > 18 || sesiones.length > 16

    // Aggregate totals
    let totalP = 0,
      totalA = 0,
      totalJ = 0
    sesiones.forEach((s) => {
      const st = calcAttendanceStats(s.asistencia)
      totalP += st.P
      totalA += st.A
      totalJ += st.J
    })
    const grandTotal = totalP + totalA + totalJ

    // Previous month totals
    let prevP = 0,
      prevA = 0,
      prevJ = 0
    prevSesiones.forEach((s) => {
      const st = calcAttendanceStats(s.asistencia)
      prevP += st.P
      prevA += st.A
      prevJ += st.J
    })
    const prevTotal = prevP + prevA + prevJ

    const pct = (n, tot) => (tot > 0 ? Math.round((n / tot) * 100) : 0)
    const delta = (cur, prev, tot, ptot) => {
      const c = pct(cur, tot),
        p = pct(prev, ptot)
      const d = c - p
      const sign = d > 0 ? '+' : ''
      return {
        cur: c,
        prev: p,
        diff: d,
        label: `${sign}${d}%`,
        cls: d >= 0 ? 'delta-up' : 'delta-down',
      }
    }

    const dP = delta(totalP, prevP, grandTotal, prevTotal)
    const dA = delta(totalA, prevA, grandTotal, prevTotal)
    const dJ = delta(totalJ, prevJ, grandTotal, prevTotal)

    // Build per-alumno row data
    const attMap = buildAlumnoAttMap(sesiones)

    // Build page 1: header + summary chips + attendance table
    const docTag = `RESUMEN MENSUAL · ${monthName(month).toUpperCase()} ${year}`
    const headerData = {
      docTag,
      clase: claseData.nombre,
      docente: maestroNombre,
      periodo: `${monthName(month)} ${year}`,
      extraItems: [
        { label: 'Sesiones', value: sesiones.length },
        { label: 'Alumnos', value: alumnos.length },
      ],
    }

    const chips = metricChips([
      { label: 'Presentes', value: `${totalP} (${pct(totalP, grandTotal)}%)`, type: 'ok' },
      { label: 'Ausentes', value: `${totalA} (${pct(totalA, grandTotal)}%)`, type: 'bad' },
      { label: 'Justificados', value: `${totalJ} (${pct(totalJ, grandTotal)}%)`, type: 'warn' },
      { label: 'Sesiones', value: sesiones.length, type: 'navy' },
    ])

    // Table header: #, Alumno, S1..SN, P, A, J
    const thSessions = sesiones
      .map((s, i) => `<th style="text-align:center;font-size:6pt">S${baseIndex + i + 1}</th>`)
      .join('')

    const tableRows = alumnos
      .map((al, i) => {
        const alumAtt = attMap[al.id] || {}
        let aP = 0,
          aA = 0,
          aJ = 0
        const cells = sesiones
          .map((s) => {
            const est = alumAtt[s.id] ?? '—'
            if (est === 'P') aP++
            if (est === 'A') aA++
            if (est === 'J') aJ++
            return `<td style="text-align:center">${['P', 'A', 'J'].includes(est) ? attendanceCell(est) : esc(est)}</td>`
          })
          .join('')

        return `<tr>
        <td>${i + 1}</td>
        <td>${esc(al.nombre_completo.split(' ')[0] + ' ' + (al.nombre_completo.split(' ')[2] || al.nombre_completo.split(' ')[1] || ''))}</td>
        ${cells}
        <td style="text-align:center;font-weight:700;color:var(--ok)">${aP}</td>
        <td style="text-align:center;font-weight:700;color:var(--bad)">${aA}</td>
        <td style="text-align:center;font-weight:700;color:var(--warn)">${aJ}</td>
      </tr>`
      })
      .join('')

    const totalRow = `<tr style="background:#f0f4ff;font-weight:700">
      <td colspan="2">TOTALES</td>
      ${sesiones.map(() => '<td></td>').join('')}
      <td style="text-align:center;color:var(--ok)">${totalP}</td>
      <td style="text-align:center;color:var(--bad)">${totalA}</td>
      <td style="text-align:center;color:var(--warn)">${totalJ}</td>
    </tr>`

    const attTable = `
      <p class="rpt-section-title">Asistencia diaria por alumno</p>
      <table class="rpt-table" style="font-size:6.5pt">
        <thead><tr>
          <th>#</th><th>Alumno</th>
          ${thSessions}
          <th style="text-align:center;background:var(--ok)">P</th>
          <th style="text-align:center;background:var(--bad)">A</th>
          <th style="text-align:center;background:var(--warn)">J</th>
        </tr></thead>
        <tbody>${tableRows}${totalRow}</tbody>
      </table>
    `

    const page1 = `
      <div class="${landscape ? 'page land' : 'page'}">
        ${header(headerData)}
        ${chips}
        ${attTable}
        ${footer(1, justificaciones.length > 0 || prevTotal > 0 ? 2 : 1, `${monthName(month)} ${year}`)}
      </div>
    `

    // Page 2 (only if there are justifications)
    let page2 = ''
    if (justificaciones.length > 0 || prevTotal > 0) {
      const justRows = justificaciones
        .map(
          (j, i) => `<tr>
        <td>${i + 1}</td>
        <td>${esc(j.alumnos?.nombre_completo ?? '')}</td>
        <td>${esc(formatDate(j.fecha))}</td>
        <td>${esc(j.tipo ?? 'Justificado')}</td>
        <td>${esc(j.motivo ?? '')}</td>
      </tr>`,
        )
        .join('')

      const justTable = justRows
        ? `
        <p class="rpt-section-title">Justificaciones detalladas</p>
        <table class="rpt-table">
          <thead><tr><th>#</th><th>Alumno</th><th>Fecha</th><th>Tipo</th><th>Motivo</th></tr></thead>
          <tbody>${justRows}</tbody>
        </table>
      `
        : ''

      const compSection =
        prevTotal > 0
          ? `
        <p class="rpt-section-title" style="margin-top:4mm">Comparativa vs ${monthName(prevMonth)} ${prevYear}</p>
        <div style="max-width:260mm">
          ${compBar('Presentes', dP, 'bar-ok')}
          ${compBar('Ausentes', dA, 'bar-bad')}
          ${compBar('Justif.', dJ, 'bar-warn')}
        </div>
      `
          : ''

      const totalPages = 2
      page2 = `
        <div class="${landscape ? 'page land' : 'page'}">
          ${header(headerData)}
          ${justTable}
          ${compSection}
          ${footer(2, totalPages, `${monthName(month)} ${year}`)}
        </div>
      `
    }

    const html = wrapDocument(page1 + page2, landscape)
    const opened = openReport(html, `resumen-asistencia-${year}-${padMM(month)}`)
    if (!opened) {
      AppToast.info('El reporte se descargó como archivo. Abrilo en el navegador y usá Imprimir → Guardar como PDF.')
    }
  } catch (err) {
    console.error('[reportService] generateMonthlyAttendance:', err)
    AppToast.error('Error al generar el resumen: ' + err.message)
  }
}

// ---------------------------------------------------------------------------
// Doc 3 — Monthly Pedagogical Report (always landscape, always 3 pages)
// ---------------------------------------------------------------------------

/**
 * Generate and print Monthly Pedagogical Report.
 * @param {string} claseId — UUID of the class
 * @param {number} year    — e.g. 2026
 * @param {number} month   — 1–12
 */
export async function generateMonthlyPedagogical(claseId, year, month) {
  try {
    const mm = padMM(month)
    const lastDay = lastDayOfMonth(year, month)
    const rangeStart = `${year}-${mm}-01`
    const rangeEnd = `${year}-${mm}-${lastDay}`

    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    const prevMM = padMM(prevMonth)
    const prevLastDay = lastDayOfMonth(prevYear, prevMonth)
    const prevStart = `${prevYear}-${prevMM}-01`
    const prevEnd = `${prevYear}-${prevMM}-${prevLastDay}`

    // Parallel data fetch
    const [sesRes, obsRes, progRes, claseRes, alumnosRes, prevSesRes, justRes] = await Promise.all([
      supabase
        .from('sesiones_clase')
        .select('id, fecha, asistencia')
        .eq('clase_id', claseId)
        .gte('fecha', rangeStart)
        .lte('fecha', rangeEnd)
        .order('fecha'),
      supabase
        .from('observaciones_sesion')
        .select('sesion_clase_id, contenido_ia_dsl, contenido_dsl')
        .in(
          'sesion_clase_id',
          // will be filtered after sesiones are loaded — fetch broad and filter
          (
            await supabase
              .from('sesiones_clase')
              .select('id')
              .eq('clase_id', claseId)
              .gte('fecha', rangeStart)
              .lte('fecha', rangeEnd)
          ).data?.map((s) => s.id) || [],
        ),
      supabase
        .from('progresos')
        .select(
          `id, alumno_id, objetivo_id, tipo, contenido_dsl, created_at,
                 alumnos(nombre_completo),
                 curriculo_objetivos(descripcion, categoria)`,
        )
        .eq('clase_id', claseId)
        .gte('created_at', rangeStart)
        .lte('created_at', rangeEnd),
      supabase
        .from('clases')
        .select('id, nombre, instrumento, maestro_id')
        .eq('id', claseId)
        .single(),
      supabase
        .from('alumnos_clases')
        .select('alumnos(id, nombre_completo)')
        .eq('clase_id', claseId)
        .eq('activo', true),
      supabase
        .from('sesiones_clase')
        .select('id, asistencia')
        .eq('clase_id', claseId)
        .gte('fecha', prevStart)
        .lte('fecha', prevEnd),
      supabase
        .from('justificaciones')
        .select('alumno_id, fecha, tipo, motivo')
        .eq('clase_id', claseId)
        .gte('fecha', rangeStart)
        .lte('fecha', rangeEnd),
    ])

    if (sesRes.error) throw sesRes.error
    if (claseRes.error) throw claseRes.error

    const sesiones = sesRes.data || []
    const obsData = obsRes.data || []
    const progresos = progRes.data || []
    const claseData = claseRes.data
    const alumnos = (alumnosRes.data || [])
      .map((r) => r.alumnos)
      .filter(Boolean)
      .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo))
    const prevSesiones = prevSesRes.data || []
    const justificaciones = justRes.data || []

    if (sesiones.length === 0) {
      AppToast.error('No hay sesiones registradas para este período.')
      return
    }

    // Fetch maestro details
    let maestroNombre = 'Docente'
    if (claseData.maestro_id) {
      const { data: maestroData } = await supabase
        .from('maestros')
        .select('nombre_completo')
        .eq('id', claseData.maestro_id)
        .single()
      if (maestroData) maestroNombre = maestroData.nombre_completo
    }

    // Count sessions before this month
    const { count: prevCount } = await supabase
      .from('sesiones_clase')
      .select('id', { count: 'exact', head: true })
      .eq('clase_id', claseId)
      .lt('fecha', rangeStart)
    const baseIndex = prevCount || 0

    const obsMap = {}
    obsData.forEach((o) => {
      obsMap[o.sesion_clase_id] = o
    })

    // Aggregate totals
    let totalP = 0,
      totalA = 0,
      totalJ = 0
    sesiones.forEach((s) => {
      const st = calcAttendanceStats(s.asistencia)
      totalP += st.P
      totalA += st.A
      totalJ += st.J
    })
    const grandTotal = totalP + totalA + totalJ
    const pct = (n, tot) => (tot > 0 ? Math.round((n / tot) * 100) : 0)

    let prevP = 0,
      prevA = 0,
      prevJ = 0
    prevSesiones.forEach((s) => {
      const st = calcAttendanceStats(s.asistencia)
      prevP += st.P
      prevA += st.A
      prevJ += st.J
    })
    const prevTotal = prevP + prevA + prevJ

    // Collect unique content items across all sessions
    const contentSet = new Set()
    sesiones.forEach((s) => {
      const obs = obsMap[s.id]
      if (!obs) return
      const raw = obs.contenido_ia_dsl || obs.contenido_dsl || ''
      raw.split(/[\n,]/).forEach((item) => {
        const clean = item.replace(/^\s*[-*\d.]+\s*/, '').trim()
        if (clean.length > 2 && clean.length < 60) contentSet.add(clean)
      })
    })
    const allContentItems = [...contentSet].slice(0, 16)

    // Collect obs blocks across sessions
    const allObs = []
    sesiones.forEach((s) => {
      const obs = obsMap[s.id]
      if (!obs) return
      const raw = obs.contenido_ia_dsl || obs.contenido_dsl || ''
      raw.split('\n').forEach((line) => {
        if (/destacad|excelente/i.test(line))
          allObs.push({
            type: 'pos',
            label: 'Destacado Académico',
            text: line.replace(/^[-*]\s*/, ''),
          })
        else if (/alerta|ausencia|riesgo/i.test(line))
          allObs.push({
            type: 'neg',
            label: 'Alerta Asistencia',
            text: line.replace(/^[-*]\s*/, ''),
          })
        else if (/novedad|administrativ/i.test(line))
          allObs.push({
            type: 'info',
            label: 'Novedad Administrativa',
            text: line.replace(/^[-*]\s*/, ''),
          })
        else if (/nota|pedagóg/i.test(line))
          allObs.push({
            type: 'warn',
            label: 'Nota Pedagógica',
            text: line.replace(/^[-*]\s*/, ''),
          })
      })
    })
    const topObs = allObs.slice(0, 4)
    while (topObs.length < 4) topObs.push({ type: 'info', label: 'Nota', text: '—' })

    // Session grid cards
    const sessionCards = sesiones
      .map((s, i) => {
        const st = calcAttendanceStats(s.asistencia)
        const obs = obsMap[s.id]
        const rawContent = obs?.contenido_ia_dsl || obs?.contenido_dsl || ''
        const firstContent =
          rawContent
            .split(/[\n,]/)[0]
            ?.replace(/^[-*\d.]+\s*/, '')
            .trim() || 'Sin contenido registrado'
        return `
        <div class="session-card">
          <div class="sc-top">S${baseIndex + i + 1} · ${esc(formatDate(s.fecha))}</div>
          <div style="font-size:6pt;color:var(--ink3);margin-bottom:2px">${esc(firstContent.slice(0, 45))}</div>
          <div class="sc-att">
            <span class="att-cell att-P">P:${st.P}</span>
            <span class="att-cell att-A">A:${st.A}</span>
            <span class="att-cell att-J">J:${st.J}</span>
          </div>
        </div>
      `
      })
      .join('')

    const docTag = `INFORME PEDAGÓGICO · ${monthName(month).toUpperCase()} ${year}`
    const headerData = {
      docTag,
      clase: claseData.nombre,
      docente: maestroNombre,
      periodo: `${monthName(month)} ${year}`,
      extraItems: [
        { label: 'Sesiones', value: sesiones.length },
        { label: 'Alumnos', value: alumnos.length },
      ],
    }

    // ---- PAGE 1 ----
    const p1 = `
      <div class="page land">
        ${header(headerData)}
        ${metricChips([
          { label: 'Sesiones', value: sesiones.length, type: 'navy' },
          { label: '% Asistencia', value: pct(totalP, grandTotal) + '%', type: 'ok' },
          { label: 'Presentes', value: totalP, type: 'ok' },
          { label: 'Ausentes', value: totalA, type: 'bad' },
          { label: 'Justif.', value: totalJ, type: 'warn' },
          { label: 'Contenidos', value: allContentItems.length, type: 'info' },
        ])}
        <p class="rpt-section-title">Contenidos trabajados</p>
        ${contentChips(allContentItems)}
        <p class="rpt-section-title">Observaciones institucionales</p>
        <div class="rpt-obs">
          ${topObs.map((o) => obsBlock(o.type, o.label, o.text)).join('')}
        </div>
        <p class="rpt-section-title">Cronograma de sesiones</p>
        <div class="session-grid">${sessionCards}</div>
        ${footer(1, 3, `${monthName(month)} ${year}`)}
      </div>
    `

    // ---- PAGE 2 — Individual profiles ----
    const cols = alumnos.length > 12 ? 'cols-4' : 'cols-3'
    const attMap = buildAlumnoAttMap(sesiones)

    // Group justifications by alumno
    const justByAlumno = {}
    justificaciones.forEach((j) => {
      if (!justByAlumno[j.alumno_id]) justByAlumno[j.alumno_id] = []
      justByAlumno[j.alumno_id].push(j)
    })

    // Group progresos by alumno
    const progByAlumno = {}
    progresos.forEach((p) => {
      if (!progByAlumno[p.alumno_id]) progByAlumno[p.alumno_id] = []
      progByAlumno[p.alumno_id].push(p)
    })

    const profileCards = alumnos
      .map((al) => {
        const alumAtt = attMap[al.id] || {}
        let aP = 0,
          aA = 0,
          aJ = 0
        sesiones.forEach((s) => {
          const est = alumAtt[s.id]
          if (est === 'P') aP++
          if (est === 'A') aA++
          if (est === 'J') aJ++
        })
        const total = sesiones.length

        // Badge
        const attPct = pct(aP, total)
        let badge, badgeClass
        if (attPct >= 90 && progByAlumno[al.id]?.some((p) => p.tipo === 'LOGRADO')) {
          badge = 'Destacado'
          badgeClass = 'badge-destacado'
        } else if (attPct < 60) {
          badge = 'En Riesgo'
          badgeClass = 'badge-riesgo'
        } else if (attPct >= 75) {
          badge = 'Estable'
          badgeClass = 'badge-estable'
        } else {
          badge = 'En Mejora'
          badgeClass = 'badge-mejora'
        }

        // Initials
        const names = al.nombre_completo.split(' ')
        const initials = esc((names[0]?.[0] ?? '') + (names[2]?.[0] ?? names[1]?.[0] ?? ''))

        // Justifications section
        const justs = justByAlumno[al.id] || []
        const justSection =
          justs.length > 0
            ? `
        <div class="pc-section">
          <div class="pc-section-title">Justificaciones</div>
          ${justs
            .slice(0, 4)
            .map(
              (j) =>
                `<div class="pc-just-item" style="font-size:6pt">${esc(j.motivo || j.tipo)} — ${esc(formatDate(j.fecha))}</div>`,
            )
            .join('')}
        </div>
      `
            : ''

        // Progress section
        const progs = progByAlumno[al.id] || []
        const progSection =
          progs.length > 0
            ? `
        <div class="pc-section">
          <div class="pc-section-title">Progreso</div>
          ${progs
            .slice(0, 3)
            .map((p) => {
              const label = p.curriculo_objetivos?.descripcion || p.contenido_dsl || 'Objetivo'
              const pctVal = p.tipo === 'LOGRADO' ? 100 : p.tipo === 'EN_PROGRESO' ? 60 : 30
              return progressBar(p.tipo, label.slice(0, 28), pctVal)
            })
            .join('')}
        </div>
      `
            : `<div class="pc-section" style="color:var(--ink3);font-size:6pt">Sin registros de progreso este mes</div>`

        return `
        <div class="profile-card">
          <div class="pc-head">
            <div class="pc-avatar">${initials}</div>
            <div>
              <div class="pc-name">${esc(al.nombre_completo.split(' ')[0] + ' ' + (al.nombre_completo.split(' ')[2] || al.nombre_completo.split(' ')[1] || ''))}</div>
              <span class="pc-badge ${badgeClass}">${esc(badge)}</span>
            </div>
          </div>
          <div class="pc-section">
            <div class="pc-section-title">Asistencia</div>
            <div class="pc-row"><span>Presentes:</span><span><strong>${aP}</strong> de ${total}</span></div>
            <div class="pc-row"><span>Ausentes:</span><span><strong>${aA}</strong></span></div>
            <div class="pc-row"><span>Justificados:</span><span><strong>${aJ}</strong></span></div>
          </div>
          ${justSection}
          ${progSection}
        </div>
      `
      })
      .join('')

    const p2 = `
      <div class="page land">
        ${header(headerData)}
        <p class="rpt-section-title">Perfiles individuales</p>
        <div class="profile-grid ${cols}">${profileCards}</div>
        ${footer(2, 3, `${monthName(month)} ${year}`)}
      </div>
    `

    // ---- PAGE 3 — Comparativa + Groq patterns + Recommendations ----
    // Fetch Groq analysis (graceful fallback if unavailable)
    const groqContext = {
      clase: claseData.nombre,
      docente: maestroNombre,
      mes: `${monthName(month)} ${year}`,
      totalAlumnos: alumnos.length,
    }
    // Attach calculated session number (Bug #4 fix)
    const sesionesConNum = sesiones.map((s, i) => ({
      ...s,
      numero_sesion: baseIndex + i + 1,
    }))
    const groqData = await generateMonthlyPatterns(sesionesConNum, progresos, groqContext)

    const dP = (() => {
      const c = pct(totalP, grandTotal),
        p = pct(prevP, prevTotal || 1)
      const d = c - p
      return {
        cur: c,
        prev: p,
        diff: d,
        label: `${d > 0 ? '+' : ''}${d}%`,
        cls: d >= 0 ? 'delta-up' : 'delta-down',
      }
    })()
    const dA = (() => {
      const c = pct(totalA, grandTotal),
        p = pct(prevA, prevTotal || 1)
      const d = c - p
      return {
        cur: c,
        prev: p,
        diff: d,
        label: `${d > 0 ? '+' : ''}${d}%`,
        cls: d < 0 ? 'delta-up' : 'delta-down',
      }
    })()

    const prevContentCount = prevSesiones.length * 2 // approximate
    const curContentCount = allContentItems.length

    const comparativa = `
      <div style="display:grid;grid-template-columns:60% 40%;gap:6mm">
        <div>
          <p class="rpt-section-title">Comparativa estadística</p>
          ${compBar('Presentes', dP, 'bar-ok')}
          ${compBar('Ausentes', dA, 'bar-bad')}
          <div style="margin-top:4px">
            <table class="rpt-table" style="font-size:7pt">
              <thead><tr>
                <th>Indicador</th>
                <th>${monthName(prevMonth)} ${prevYear}</th>
                <th>${monthName(month)} ${year}</th>
                <th>Δ</th>
              </tr></thead>
              <tbody>
                <tr><td>Contenidos cubiertos</td><td>${prevContentCount}</td><td>${curContentCount}</td>
                    <td class="${curContentCount >= prevContentCount ? 'delta-up' : 'delta-down'}" style="font-weight:700">
                      ${curContentCount >= prevContentCount ? '+' : ''}${curContentCount - prevContentCount}
                    </td></tr>
                <tr><td>Logros individuales</td>
                    <td>${prevSesiones.length > 0 ? '—' : '0'}</td>
                    <td>${progresos.filter((p) => p.tipo === 'LOGRADO').length}</td>
                    <td class="delta-up" style="font-weight:700">${progresos.filter((p) => p.tipo === 'LOGRADO').length}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <p class="rpt-section-title">Patrones detectados</p>
          ${
            groqData.patrones.positivos.length > 0
              ? `
            <div style="margin-bottom:4px">
              <div style="font-size:6.5pt;font-weight:700;color:var(--ok);margin-bottom:2px">✅ Positivos</div>
              ${groqData.patrones.positivos.map((p) => `<div style="font-size:7pt;margin-bottom:2px">• ${esc(p)}</div>`).join('')}
            </div>
          `
              : ''
          }
          ${
            groqData.patrones.atencion.length > 0
              ? `
            <div>
              <div style="font-size:6.5pt;font-weight:700;color:var(--warn);margin-bottom:2px">⚠️ Atención requerida</div>
              ${groqData.patrones.atencion.map((p) => `<div style="font-size:7pt;margin-bottom:2px">• ${esc(p)}</div>`).join('')}
            </div>
          `
              : ''
          }
          ${
            !groqData.patrones.positivos.length && !groqData.patrones.atencion.length
              ? `<div style="font-size:7pt;color:var(--ink3)">(Análisis no disponible)</div>`
              : ''
          }
        </div>
      </div>
    `

    const recos = groqData.recomendaciones
    const recosHtml = `
      <p class="rpt-section-title" style="margin-top:4mm">Recomendaciones institucionales</p>
      <div class="reco-grid">
        <div class="reco-card">
          <div class="reco-title">📚 Académico</div>
          <div>${esc(recos.academico || '(Sin datos suficientes)')}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">📋 Logística</div>
          <div>${esc(recos.logistica || '(Sin datos suficientes)')}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">⭐ Talentos</div>
          <div>${esc(recos.talentos || '(Sin datos suficientes)')}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">🎯 Refuerzo</div>
          <div>${esc(recos.refuerzo || '(Sin datos suficientes)')}</div>
        </div>
      </div>
    `

    const notaDir = groqData.notaDireccion
      ? `
      <div class="nota-dir">
        <div class="nota-title">📝 Nota para Dirección Ejecutiva</div>
        <div>${esc(groqData.notaDireccion)}</div>
      </div>
    `
      : ''

    const p3 = `
      <div class="page land">
        ${header(headerData)}
        ${comparativa}
        ${recosHtml}
        ${notaDir}
        ${footer(3, 3, `${monthName(month)} ${year}`)}
      </div>
    `

    const html = wrapDocument(p1 + p2 + p3, true)
    const opened = openReport(html, `informe-pedagogico-${year}-${padMM(month)}`)
    if (!opened) {
      AppToast.info('El reporte se descargó como archivo. Abrilo en el navegador y usá Imprimir → Guardar como PDF.')
    }
  } catch (err) {
    console.error('[reportService] generateMonthlyPedagogical:', err)
    AppToast.error('Error al generar el informe pedagógico: ' + err.message)
  }
}

/**
 * Generate and print an institutional academic closure report from a precomputed snapshot.
 * @param {Object} payload
 * @param {Object} payload.periodo
 * @param {Object} payload.resumen
 * @param {Array} payload.clases
 * @param {Array} payload.alumnos
 */
export async function generateAcademicClosureReport(payload = {}) {
  try {
    const periodo = payload.periodo || {}
    const resumen = payload.resumen || {}
    const clases = Array.isArray(payload.clases) ? payload.clases : []
    const alumnos = Array.isArray(payload.alumnos) ? payload.alumnos : []
    const totalAsistencias = (resumen.totalPresentes || 0) + (resumen.totalAusentes || 0) + (resumen.totalJustificados || 0)
    const tasaGlobal = totalAsistencias > 0 ? (((resumen.totalPresentes || 0) + (resumen.totalJustificados || 0)) / totalAsistencias) * 100 : null
    const alumnosEnRiesgo = alumnos.filter((a) => (a.tasaAsistencia != null ? a.tasaAsistencia : 100) < 70)
    const alumnosDestacados = alumnos.filter((a) => (a.tasaAsistencia != null ? a.tasaAsistencia : 0) >= 90)
    const justificacionesFrecuentes = alumnos
      .flatMap((a) => Array.isArray(a.justificaciones) ? a.justificaciones : [])
      .reduce((acc, texto) => {
        const key = String(texto || '').trim().toLowerCase()
        if (!key) return acc
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})
    const topJustificaciones = Object.entries(justificacionesFrecuentes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    const headerHtml = header({
      docTag: 'CIERRE ACADÉMICO',
      clase: periodo.nombre || 'Período institucional',
      docente: 'Coordinación / Dirección',
      periodo: `${formatDate(periodo.fecha_inicio || periodo.fechaInicio)} a ${formatDate(periodo.fecha_fin || periodo.fechaFin)}`.trim(),
      extraItems: [
        { label: 'Estado', value: periodo.cerrado ? 'Cerrado' : 'Activo' },
        { label: 'Período ID', value: periodo.id || periodo.periodo_id || 'N/D' },
      ],
    })

    const resumenHtml = metricChips([
      { label: 'Clases', value: resumen.totalClases || 0, type: 'navy' },
      { label: 'Contenido', value: resumen.totalContenido || 0, type: 'info' },
      { label: 'Presentes', value: resumen.totalPresentes || 0, type: 'ok' },
      { label: 'Ausentes', value: resumen.totalAusentes || 0, type: 'bad' },
      { label: 'Justificados', value: resumen.totalJustificados || 0, type: 'warn' },
      { label: 'Alumnos', value: resumen.totalAlumnos || alumnos.length || 0, type: 'navy' },
    ])

    const clasesHtml = clases.length
      ? `
        <p class="rpt-section-title">Detalle por clase</p>
        <table class="rpt-table">
          <thead>
            <tr>
              <th>Clase</th>
              <th>Docente</th>
              <th>Sesiones</th>
              <th>Contenido</th>
              <th>P</th>
              <th>A</th>
              <th>J</th>
            </tr>
          </thead>
          <tbody>
            ${clases
              .map(
                (c) => `
                <tr>
                  <td>${esc(c.claseNombre || c.nombre || '—')}</td>
                  <td>${esc(c.maestroNombre || '—')}</td>
                  <td>${esc(c.sesiones ?? 0)}</td>
                  <td>${esc(c.contenidosTrabajados ?? 0)}</td>
                  <td>${esc(c.presentes ?? 0)}</td>
                  <td>${esc(c.ausentes ?? 0)}</td>
                  <td>${esc(c.justificados ?? 0)}</td>
                </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      `
      : `<div class="nota-dir">No hay clases consolidadas para este período.</div>`

    const alumnosHtml = alumnos.length
      ? `
        <p class="rpt-section-title">Detalle por alumno</p>
        <table class="rpt-table">
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Presentes</th>
              <th>Ausentes</th>
              <th>Justificados</th>
              <th>Asistencia</th>
              <th>Progreso</th>
            </tr>
          </thead>
          <tbody>
            ${alumnos
              .slice(0, 30)
              .map(
                (a) => `
                <tr>
                  <td>${esc(a.alumnoNombre || a.nombre_completo || '—')}</td>
                  <td>${esc(a.presentes ?? 0)}</td>
                  <td>${esc(a.ausentes ?? 0)}</td>
                  <td>${esc(a.justificados ?? 0)}</td>
                  <td>${esc(a.tasaAsistencia != null ? `${a.tasaAsistencia.toFixed(1)}%` : 'N/D')}</td>
                  <td>${esc(a.totalRegistrosProgreso ?? 0)}</td>
                </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      `
      : `<div class="nota-dir">No hay alumnos consolidados para este período.</div>`

    const indicadoresHtml = `
      <p class="rpt-section-title">Indicadores institucionales</p>
      <div class="reco-grid" style="grid-template-columns:repeat(4,1fr)">
        <div class="reco-card"><div class="reco-title">Cumplimiento de clases</div><div>${esc(resumen.totalClases || 0)}</div></div>
        <div class="reco-card"><div class="reco-title">Asistencia global</div><div>${esc(`${resumen.totalPresentes || 0} / ${resumen.totalAusentes || 0} / ${resumen.totalJustificados || 0}`)}</div></div>
        <div class="reco-card"><div class="reco-title">Cobertura de alumnos</div><div>${esc(resumen.totalAlumnos || alumnos.length || 0)}</div></div>
        <div class="reco-card"><div class="reco-title">Tasa global</div><div>${esc(tasaGlobal != null ? `${tasaGlobal.toFixed(1)}%` : 'N/D')}</div></div>
      </div>
    `

    const alumnosHtmlExtra = `
      <p class="rpt-section-title">Lectura ejecutiva</p>
      <div class="reco-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="reco-card">
          <div class="reco-title">Alumnos en riesgo</div>
          <div>${esc(alumnosEnRiesgo.length)}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">Alumnos destacados</div>
          <div>${esc(alumnosDestacados.length)}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">Justificaciones frecuentes</div>
          <div>${esc(topJustificaciones.length)}</div>
        </div>
      </div>
    `

    const justificacionesHtml = topJustificaciones.length
      ? `
        <p class="rpt-section-title">Razones de justificación más frecuentes</p>
        <table class="rpt-table">
          <thead><tr><th>Razón</th><th>Cantidad</th></tr></thead>
          <tbody>
            ${topJustificaciones
              .map(([razon, cantidad]) => `<tr><td>${esc(razon)}</td><td>${esc(cantidad)}</td></tr>`)
              .join('')}
          </tbody>
        </table>
      `
      : ''

    const note = `
      <div class="nota-dir">
        <div class="nota-title">Cierre institucional</div>
        <div>Este informe consolida el período académico cerrado y debe archivarse como evidencia oficial de semestre/año escolar.</div>
      </div>
    `

    const p1 = `
      <div class="page">
        ${headerHtml}
        ${resumenHtml}
        ${indicadoresHtml}
        ${alumnosHtmlExtra}
        ${justificacionesHtml}
        ${note}
        ${footer(1, 2, `${formatDate(periodo.fecha_inicio || periodo.fechaInicio)} - ${formatDate(periodo.fecha_fin || periodo.fechaFin)}`)}
      </div>
    `

    const p2 = `
      <div class="page land">
        ${headerHtml}
        ${clasesHtml}
        ${alumnosHtml}
        ${footer(2, 2, `${formatDate(periodo.fecha_inicio || periodo.fechaInicio)} - ${formatDate(periodo.fecha_fin || periodo.fechaFin)}`)}
      </div>
    `

    const html = wrapDocument(p1 + p2, true)
    const opened = openReport(html, `cierre-academico-${periodo.id || 'periodo'}`)
    if (!opened) {
      AppToast.info('El reporte se descargó como archivo HTML. Abrilo en el navegador e imprimilo como PDF.')
    }
  } catch (err) {
    console.error('[reportService] generateAcademicClosureReport:', err)
    AppToast.error('Error al generar el cierre académico: ' + err.message)
  }
}
