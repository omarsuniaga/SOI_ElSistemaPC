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
    const rangeEnd   = `${year}-${mm}-${lastDay}`

    // Previous month
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear  = month === 1 ? year - 1 : year
    const prevMM    = padMM(prevMonth)
    const prevLastDay = lastDayOfMonth(prevYear, prevMonth)
    const prevStart = `${prevYear}-${prevMM}-01`
    const prevEnd   = `${prevYear}-${prevMM}-${prevLastDay}`

    // Parallel fetch
    const [sesionesRes, justRes, prevSesRes, claseRes, alumnosRes] = await Promise.all([
      supabase.from('sesiones_clase')
        .select('id, fecha, numero_sesion, asistencia')
        .eq('clase_id', claseId)
        .gte('fecha', rangeStart).lte('fecha', rangeEnd)
        .order('fecha'),
      supabase.from('justificaciones')
        .select('alumno_id, fecha, tipo, motivo, alumnos(nombre_completo)')
        .eq('clase_id', claseId)
        .gte('fecha', rangeStart).lte('fecha', rangeEnd),
      supabase.from('sesiones_clase')
        .select('id, asistencia')
        .eq('clase_id', claseId)
        .gte('fecha', prevStart).lte('fecha', prevEnd),
      supabase.from('clases')
        .select('nombre, instrumento, maestros(nombre_completo)')
        .eq('id', claseId)
        .single(),
      supabase.from('alumnos')
        .select('id, nombre_completo, nombre_corto')
        .eq('clase_id', claseId)
        .order('nombre_completo')
    ])

    for (const res of [sesionesRes, claseRes, alumnosRes]) {
      if (res.error) throw res.error
    }

    const sesiones = sesionesRes.data || []
    const justificaciones = justRes.data || []
    const prevSesiones = prevSesRes.data || []
    const clase = claseRes.data
    const alumnos = alumnosRes.data || []

    if (sesiones.length === 0) {
      AppToast.error('No hay sesiones registradas para este período.')
      return
    }

    const landscape = alumnos.length > 18 || sesiones.length > 16

    // Aggregate totals
    let totalP = 0, totalA = 0, totalJ = 0
    sesiones.forEach(s => {
      const st = calcAttendanceStats(s.asistencia)
      totalP += st.P; totalA += st.A; totalJ += st.J
    })
    const grandTotal = totalP + totalA + totalJ

    // Previous month totals
    let prevP = 0, prevA = 0, prevJ = 0
    prevSesiones.forEach(s => {
      const st = calcAttendanceStats(s.asistencia)
      prevP += st.P; prevA += st.A; prevJ += st.J
    })
    const prevTotal = prevP + prevA + prevJ

    const pct = (n, tot) => tot > 0 ? Math.round((n / tot) * 100) : 0
    const delta = (cur, prev, tot, ptot) => {
      const c = pct(cur, tot), p = pct(prev, ptot)
      const d = c - p
      const sign = d > 0 ? '+' : ''
      return { cur: c, prev: p, diff: d, label: `${sign}${d}%`, cls: d >= 0 ? 'delta-up' : 'delta-down' }
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
      clase: clase.nombre,
      docente: clase.maestros?.nombre_completo ?? 'Docente',
      periodo: `${monthName(month)} ${year}`,
      extraItems: [{ label: 'Sesiones', value: sesiones.length }, { label: 'Alumnos', value: alumnos.length }]
    }

    const chips = metricChips([
      { label: 'Presentes',    value: `${totalP} (${pct(totalP, grandTotal)}%)`, type: 'ok' },
      { label: 'Ausentes',     value: `${totalA} (${pct(totalA, grandTotal)}%)`, type: 'bad' },
      { label: 'Justificados', value: `${totalJ} (${pct(totalJ, grandTotal)}%)`, type: 'warn' },
      { label: 'Sesiones',     value: sesiones.length, type: 'navy' },
    ])

    // Table header: #, Alumno, S1..SN, P, A, J
    const thSessions = sesiones.map((s, i) =>
      `<th style="text-align:center;font-size:6pt">S${s.numero_sesion}</th>`
    ).join('')

    const tableRows = alumnos.map((al, i) => {
      const alumAtt = attMap[al.id] || {}
      let aP = 0, aA = 0, aJ = 0
      const cells = sesiones.map(s => {
        const est = alumAtt[s.id] ?? '—'
        if (est === 'P') aP++; if (est === 'A') aA++; if (est === 'J') aJ++
        return `<td style="text-align:center">${['P','A','J'].includes(est) ? attendanceCell(est) : esc(est)}</td>`
      }).join('')

      return `<tr>
        <td>${i + 1}</td>
        <td>${esc(al.nombre_corto || al.nombre_completo)}</td>
        ${cells}
        <td style="text-align:center;font-weight:700;color:var(--ok)">${aP}</td>
        <td style="text-align:center;font-weight:700;color:var(--bad)">${aA}</td>
        <td style="text-align:center;font-weight:700;color:var(--warn)">${aJ}</td>
      </tr>`
    }).join('')

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
        ${footer(1, justificaciones.length > 0 ? 2 : 1, `${monthName(month)} ${year}`)}
      </div>
    `

    // Page 2 (only if there are justifications)
    let page2 = ''
    if (justificaciones.length > 0 || prevTotal > 0) {
      const justRows = justificaciones.map((j, i) => `<tr>
        <td>${i + 1}</td>
        <td>${esc(j.alumnos?.nombre_completo ?? '')}</td>
        <td>${esc(formatDate(j.fecha))}</td>
        <td>${esc(j.tipo ?? 'Justificado')}</td>
        <td>${esc(j.motivo ?? '')}</td>
      </tr>`).join('')

      const justTable = justRows ? `
        <p class="rpt-section-title">Justificaciones detalladas</p>
        <table class="rpt-table">
          <thead><tr><th>#</th><th>Alumno</th><th>Fecha</th><th>Tipo</th><th>Motivo</th></tr></thead>
          <tbody>${justRows}</tbody>
        </table>
      ` : ''

      const compSection = prevTotal > 0 ? `
        <p class="rpt-section-title" style="margin-top:4mm">Comparativa vs ${monthName(prevMonth)} ${prevYear}</p>
        <div style="max-width:260mm">
          ${compBar('Presentes', dP, 'bar-ok')}
          ${compBar('Ausentes',  dA, 'bar-bad')}
          ${compBar('Justif.',   dJ, 'bar-warn')}
        </div>
      ` : ''

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
    const opened = openReport(html)
    if (!opened) {
      AppToast.warn('El navegador bloqueó la ventana emergente. Permite las ventanas emergentes e intenta de nuevo.')
    }

  } catch (err) {
    console.error('[reportService] generateMonthlyAttendance:', err)
    AppToast.error('Error al generar el resumen: ' + err.message)
  }
}

/** Internal helper — comparative bar row HTML */
function compBar(label, d, barClass) {
  return `
    <div class="comp-row">
      <span class="comp-label">${esc(label)}</span>
      <div style="flex:1;display:flex;gap:4px;align-items:center">
        <div class="comp-bar-wrap" style="max-width:100px">
          <div class="comp-bar ${esc(barClass)}" style="width:${d.prev}%"></div>
        </div>
        <span style="font-size:6.5pt;color:var(--ink3);width:28px">${d.prev}%</span>
        <span style="font-size:7pt;color:var(--ink3)">→</span>
        <div class="comp-bar-wrap" style="max-width:100px">
          <div class="comp-bar ${esc(barClass)}" style="width:${d.cur}%"></div>
        </div>
        <span style="font-size:6.5pt;color:var(--ink3);width:28px">${d.cur}%</span>
      </div>
      <span class="comp-delta ${esc(d.cls)}">${esc(d.label)}</span>
    </div>
  `
}

export async function generateMonthlyPedagogical(claseId, year, month) {
  AppToast.info('Función no implementada aún.')
}

