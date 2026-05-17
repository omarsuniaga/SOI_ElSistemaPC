import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { escHTML } from '../utils/portalUtils.js'
import { getMisClases, getSesiones } from '../services/maestroDataService.js'
import { announce } from '../utils/a11yUtils.js'

// ── Mini gráfico de barras (SVG interno con labels) ──────────────
function barChartContent(data, maxVal, width = 160, height = 36) {
  if (!data || data.length === 0) {
    return `<text x="${width / 2}" y="${height / 2 + 4}" text-anchor="middle" font-size="9" fill="var(--pm-text-muted)">Sin datos</text>`
  }
  const barW = Math.max(10, Math.min(24, (width - (data.length - 1) * 4) / data.length))
  const gap = (width - barW * data.length) / (data.length + 1)
  const max = Math.max(...data, 1)
  return data.map((v, i) => {
    const barH = Math.max(4, (v / max) * (height - 10))
    const x = gap + i * (barW + gap)
    const y = height - barH - 6
    const color = v >= 70 ? 'var(--pm-success)' : v >= 50 ? 'var(--pm-warning)' : 'var(--pm-danger)'
    return `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="3" fill="${color}" aria-label="${v}%"/>
      <text x="${x + barW / 2}" y="${y - 3}" text-anchor="middle" font-size="7" fill="var(--pm-text-muted)">${v}%</text>`
  }).join('')
}

// ── Estado de la vista (para persistencia entre eventos) ───────
let estadoActual = {
  periodo: 4,
  maestroId: null,
  clasesData: [],
  todasSesiones: [],
  inscripcionesPorClase: {},
  alertasRiesgo: []
}

// ── Carga datos según período ───────────────────────────────────
async function cargarDatos(semanas, maestroId) {
  const clases = await getMisClases()
  clases.sort((a, b) => a.nombre.localeCompare(b.nombre))

  const fechaInicio = new Date()
  fechaInicio.setDate(fechaInicio.getDate() - semanas * 7)
  const fechaStr = fechaInicio.toISOString().split('T')[0]
  const hoyStr = new Date().toISOString().split('T')[0]

  const sesiones = await getSesiones(maestroId, fechaStr, hoyStr)
  const sesionesValidas = sesiones || []

  const claseIds = clases.map(c => c.id)
  if (claseIds.length === 0) {
    return { clases, sesiones: sesionesValidas, inscripcionesPorClase: {} }
  }

  const { data: todasInscripciones } = await supabase
    .from('alumnos_clases')
    .select('clase_id, alumno:alumnos(id, nombre_completo)')
    .in('clase_id', claseIds)
    .eq('activo', true)

  const inscripcionesPorClase = {}
  for (const ins of todasInscripciones || []) {
    if (!ins.clase_id || !ins.alumno) continue
    if (!inscripcionesPorClase[ins.clase_id]) {
      inscripcionesPorClase[ins.clase_id] = []
    }
    inscripcionesPorClase[ins.clase_id].push(ins.alumno)
  }

  return { clases, sesiones: sesionesValidas, inscripcionesPorClase }
}

// ── Procesa datos y construye modelo para la vista ──────────────
function procesarDatos({ clases, sesiones, inscripcionesPorClase }) {
  const sesionesCompletadas = sesiones.filter(s => s.estado === 'registrada').length
  const sesionesPendientes = sesiones.filter(s => s.estado === 'pendiente').length
  const sesionesBorrador = sesiones.filter(s => s.borrador === true).length

  let totalPresentes = 0, totalAusentes = 0, totalJustificados = 0, totalRegistros = 0
  sesiones.forEach(s => {
    (s.asistencia || []).forEach(a => {
      totalRegistros++
      if (a.estado === 'P') totalPresentes++
      else if (a.estado === 'A') totalAusentes++
      else if (a.estado === 'J') totalJustificados++
    })
  })
  const asistenciaPromedio = totalRegistros > 0 ? Math.round((totalPresentes / totalRegistros) * 100) : 0

  const clasesDataMap = clases.map(clase => {
    const sesionesClase = sesiones.filter(s => s.clase_id === clase.id)
    const completadas = sesionesClase.filter(s => s.estado === 'registrada').length
    const pending = sesionesClase.filter(s => s.estado === 'pendiente').length
    const alumnos = inscripcionesPorClase[clase.id] || []
    const totalAlumnos = alumnos.length

    const sessionAttendance = sesionesClase
      .filter(s => s.estado === 'registrada')
      .slice(-8)
      .map(s => {
        const pres = (s.asistencia || []).filter(a => a.estado === 'P').length
        const tot = (s.asistencia || []).length
        return tot > 0 ? Math.round((pres / tot) * 100) : 0
      })

    let presTotal = 0, totAsist = 0
    sesionesClase.forEach(s => {
      (s.asistencia || []).forEach(a => {
        totAsist++
        if (a.estado === 'P') presTotal++
      })
    })
    const avgAttendance = totAsist > 0 ? Math.round((presTotal / totAsist) * 100) : 0

    const conContenido = sesionesClase.filter(s => s.contenido_dsl?.trim()).length
    const progress = sesionesClase.length > 0
      ? Math.min(100, Math.round((conContenido / Math.max(completadas, 1)) * 100))
      : 0

    const riskStudents = []
    for (const alum of alumnos) {
      const alumSes = sesionesClase
        .filter(s => s.asistencia?.some(a => a.alumno_id === alum.id))
        .map(s => s.asistencia.find(a => a.alumno_id === alum.id))
      const alumPres = alumSes.filter(a => a?.estado === 'P').length
      const pct = alumSes.length > 0 ? Math.round((alumPres / alumSes.length) * 100) : 0
      if (pct > 0 && pct < 70) {
        riskStudents.push({ id: alum.id, nombre: alum.nombre_completo, pct })
      }
    }

    return {
      ...clase,
      totalAlumnos,
      sesionesCompletadas: completadas,
      sesionesPendientes: pending,
      sessionAttendance,
      avgAttendance,
      progress,
      riskStudents,
      alumnos
    }
  })

  const alertas = []
  for (const clase of clasesDataMap) {
    for (const alum of clase.riskStudents) {
      alertas.push({
        tipo: 'baja_asistencia',
        alumnoId: alum.id,
        nombre: alum.nombre,
        clase: clase.nombre,
        valor: alum.pct,
        mensaje: `${alum.pct}%`
      })
    }
  }

  return {
    totalClases: clases.length,
    sesionesCompletadas,
    sesionesPendientes: sesionesPendientes + sesionesBorrador,
    totalPresentes,
    totalAusentes,
    totalJustificados,
    totalRegistros,
    asistenciaPromedio,
    clasesData: clasesDataMap,
    alertasRiesgo: alertas,
    inscripcionesPorClase
  }
}

// ── Genera el HTML del dashboard ────────────────────────────────
function generarHTML(datos) {
  const {
    totalClases, sesionesCompletadas, sesionesPendientes,
    totalPresentes, totalAusentes, totalJustificados, totalRegistros,
    asistenciaPromedio, clasesData, alertasRiesgo
  } = datos

  const pctPresentes = totalRegistros > 0 ? Math.round((totalPresentes / totalRegistros) * 100) : 0
  const pctAusentes = totalRegistros > 0 ? Math.round((totalAusentes / totalRegistros) * 100) : 0
  const pctJustificados = totalRegistros > 0 ? Math.round((totalJustificados / totalRegistros) * 100) : 0

  // Build announcement text for screen readers
  const announceText = `Dashboard: ${asistenciaPromedio}% asistencia general, ${totalClases} clases, ${sesionesCompletadas} sesiones registradas, ${sesionesPendientes} pendientes.`

  return `
    <div class="pm-dashboard" role="main" aria-label="Panel de métricas">
      <div role="status" aria-live="polite" aria-atomic="true" class="pm-visually-hidden">${escHTML(announceText)}</div>
      <header class="pm-dashboard-header">
        <div>
          <h1 class="pm-dashboard-title">Dashboard</h1>
          <p class="pm-dashboard-subtitle">Resumen académico</p>
        </div>
        <select id="pm-filter-periodo" class="pm-dashboard-select" aria-label="Período de análisis">
          <option value="4" ${estadoActual.periodo === 4 ? 'selected' : ''}>4 semanas</option>
          <option value="8" ${estadoActual.periodo === 8 ? 'selected' : ''}>8 semanas</option>
          <option value="12" ${estadoActual.periodo === 12 ? 'selected' : ''}>12 semanas</option>
        </select>
      </header>

      <section class="pm-dashboard-overview" aria-label="Indicadores generales">
        <div class="pm-overview-card primary">
          <div class="pm-overview-ring" aria-label="Asistencia general ${asistenciaPromedio}%">
            <svg viewBox="0 0 36 36" class="pm-circular-chart">
              <path class="pm-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path class="pm-circle" stroke-dasharray="${asistenciaPromedio}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <text x="18" y="20.35" class="pm-percentage">${asistenciaPromedio}%</text>
            </svg>
          </div>
          <div class="pm-overview-info">
            <span class="pm-overview-label">Asistencia</span>
            <span class="pm-overview-detail">${totalPresentes} de ${totalRegistros} registros</span>
          </div>
        </div>
        <div class="pm-overview-stat"><span class="pm-overview-number">${totalClases}</span><span class="pm-overview-text">Clases</span></div>
        <div class="pm-overview-stat"><span class="pm-overview-number">${sesionesCompletadas}</span><span class="pm-overview-text">Registradas</span></div>
        <div class="pm-overview-stat warning"><span class="pm-overview-number">${sesionesPendientes}</span><span class="pm-overview-text">Pendientes</span></div>
      </section>

      <section class="pm-dashboard-section" aria-label="Desglose de asistencia">
        <h2 class="pm-section-title">Asistencia</h2>
        <div class="pm-attendance-bars">
          <div class="pm-attendance-bar-item">
            <div class="pm-attendance-bar-label"><span>Presentes</span><span>${totalPresentes} (${pctPresentes}%)</span></div>
            <div class="pm-attendance-bar-track"><div class="pm-attendance-bar-fill success" style="width:${pctPresentes}%"></div></div>
          </div>
          <div class="pm-attendance-bar-item">
            <div class="pm-attendance-bar-label"><span>Ausentes</span><span>${totalAusentes} (${pctAusentes}%)</span></div>
            <div class="pm-attendance-bar-track"><div class="pm-attendance-bar-fill danger" style="width:${pctAusentes}%"></div></div>
          </div>
          <div class="pm-attendance-bar-item">
            <div class="pm-attendance-bar-label"><span>Justificados</span><span>${totalJustificados} (${pctJustificados}%)</span></div>
            <div class="pm-attendance-bar-track"><div class="pm-attendance-bar-fill warning" style="width:${pctJustificados}%"></div></div>
          </div>
        </div>
      </section>

      ${alertasRiesgo.length > 0 ? `
      <section class="pm-dashboard-section" aria-label="Alumnos en riesgo">
        <h2 class="pm-section-title">Alumnos en Riesgo <span class="pm-section-badge">${alertasRiesgo.length}</span></h2>
        <div class="pm-risk-list" role="list">
          ${alertasRiesgo.slice(0, 5).map(a => `
            <div class="pm-risk-item" role="listitem" tabindex="0" data-alumno="${a.alumnoId}" aria-label="Ver perfil de ${escHTML(a.nombre)}">
              <div class="pm-risk-avatar" aria-hidden="true">${(a.nombre || 'A')[0].toUpperCase()}</div>
              <div class="pm-risk-info">
                <span class="pm-risk-name">${escHTML(a.nombre)}</span>
                <span class="pm-risk-class">${escHTML(a.clase)}</span>
              </div>
              <span class="pm-risk-pct">${a.mensaje}</span>
            </div>
          `).join('')}
        </div>
      </section>` : ''}

      <section class="pm-dashboard-section" aria-label="Resumen por clase">
        <h2 class="pm-section-title">Clases</h2>
        <div class="pm-classes-list" id="pm-clases-grid">
          ${clasesData.map(clase => `
          <div class="pm-class-card" data-clase-id="${clase.id}" role="article" aria-label="Clase ${escHTML(clase.nombre)}">
            <div class="pm-class-header">
              <div>
                <span class="pm-class-name">${escHTML(clase.nombre)}</span>
                <span class="pm-class-inst">${escHTML(clase.instrumento || '')}</span>
              </div>
              <span class="pm-class-badge ${clase.avgAttendance < 70 ? 'danger' : clase.avgAttendance < 85 ? 'warning' : 'success'}" aria-label="Asistencia media ${clase.avgAttendance}%">
                ${clase.avgAttendance}%
              </span>
            </div>
            <div class="pm-class-chart" aria-label="Evolución de asistencia">
              <svg viewBox="0 0 160 36" width="100%" height="28">
                ${barChartContent(clase.sessionAttendance, 100, 160, 36)}
              </svg>
            </div>
            <div class="pm-class-stats">
              <div class="pm-class-stat"><span>${clase.sesionesCompletadas}</span><small>Reg.</small></div>
              <div class="pm-class-stat"><span>${clase.sesionesPendientes}</span><small>Pen.</small></div>
              <div class="pm-class-stat"><span>${clase.totalAlumnos}</span><small>Alum.</small></div>
              <div class="pm-class-stat"><span>${clase.progress}%</span><small>Cont.</small></div>
            </div>
            ${clase.riskStudents.length > 0 ? `
            <div class="pm-class-risk"><i class="bi bi-exclamation-circle"></i> ${clase.riskStudents.length} con &lt;70%</div>` : ''}
            <button class="pm-class-btn" data-clase-id="${clase.id}" aria-label="Ver alumnos de la clase" title="Ver alumnos">⋮</button>
          </div>`).join('')}
        </div>
      </section>

      <section class="pm-dashboard-section" aria-label="Buscar alumno">
        <h2 class="pm-section-title">Buscar Alumno</h2>
        <div class="pm-search-wrapper">
          <i class="bi bi-search" aria-hidden="true"></i>
          <input id="pm-alumno-search" type="text" placeholder="Nombre del alumno..." aria-label="Buscar alumno por nombre">
        </div>
        <div id="pm-alumno-search-results" class="pm-search-results" role="listbox"></div>
      </section>
    </div>

    <style>
      .pm-dashboard { padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .pm-dashboard-header { background: linear-gradient(135deg, var(--pm-primary) 0%, #5856d6 100%); padding: 1.25rem 1rem; color: white; display: flex; justify-content: space-between; align-items: center; }
      .pm-dashboard-title { margin: 0; font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; }
      .pm-dashboard-subtitle { margin: 0.125rem 0 0; font-size: 0.8125rem; opacity: 0.75; }
      .pm-dashboard-select { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 0.375rem 0.75rem; border-radius: 6px; font-size: 0.8125rem; cursor: pointer; }
      .pm-dashboard-select option { color: #000; }

      .pm-dashboard-overview { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 0.5rem; padding: 0.75rem; background: var(--pm-surface); margin: -0.5rem 0.75rem 0.75rem; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
      .pm-overview-card { display: flex; align-items: center; gap: 0.625rem; padding: 0.75rem; border-radius: 10px; background: var(--pm-surface-2); }
      .pm-overview-card.primary { background: linear-gradient(135deg, rgba(52,199,89,0.1) 0%, rgba(52,199,89,0.05) 100%); border: 1px solid rgba(52,199,89,0.2); }
      .pm-overview-ring { width: 48px; height: 48px; flex-shrink: 0; }
      .pm-circular-chart { display: block; width: 100%; height: 100%; }
      .pm-circle-bg { fill: none; stroke: var(--pm-border); stroke-width: 3; }
      .pm-circle { fill: none; stroke: var(--pm-success); stroke-width: 3; stroke-linecap: round; transform: rotate(-90deg); transform-origin: 50% 50%; transition: stroke-dasharray 0.5s ease; }
      .pm-percentage { fill: var(--pm-text); font-size: 0.5em; text-anchor: middle; font-weight: 600; }
      .pm-overview-info { display: flex; flex-direction: column; }
      .pm-overview-label { font-size: 0.75rem; font-weight: 600; color: var(--pm-text); }
      .pm-overview-detail { font-size: 0.6875rem; color: var(--pm-text-muted); }
      .pm-overview-stat { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0.5rem; border-radius: 10px; background: var(--pm-surface-2); }
      .pm-overview-number { font-size: 1.25rem; font-weight: 700; color: var(--pm-text); line-height: 1; }
      .pm-overview-text { font-size: 0.625rem; color: var(--pm-text-muted); text-transform: uppercase; letter-spacing: 0.03em; margin-top: 0.125rem; }
      .pm-overview-stat.warning .pm-overview-number { color: var(--pm-warning); }

      .pm-dashboard-section { padding: 0.75rem 1rem; }
      .pm-section-title { font-size: 0.9375rem; font-weight: 600; color: var(--pm-text); margin: 0 0 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
      .pm-section-badge { background: var(--pm-danger); color: white; font-size: 0.6875rem; font-weight: 600; padding: 0.125rem 0.5rem; border-radius: 6px; margin-left: auto; }

      .pm-attendance-bars { display: flex; flex-direction: column; gap: 0.625rem; }
      .pm-attendance-bar-item { display: flex; flex-direction: column; gap: 0.25rem; }
      .pm-attendance-bar-label { display: flex; justify-content: space-between; font-size: 0.8125rem; }
      .pm-attendance-bar-label span:first-child { color: var(--pm-text); }
      .pm-attendance-bar-value { color: var(--pm-text-muted); font-size: 0.75rem; }
      .pm-attendance-bar-track { height: 6px; background: var(--pm-border); border-radius: 3px; overflow: hidden; }
      .pm-attendance-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
      .pm-attendance-bar-fill.success { background: var(--pm-success); }
      .pm-attendance-bar-fill.danger { background: var(--pm-danger); }
      .pm-attendance-bar-fill.warning { background: var(--pm-warning); }

      .pm-risk-list { display: flex; flex-direction: column; gap: 0.5rem; }
      .pm-risk-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem 0.75rem; background: var(--pm-surface); border-radius: 10px; cursor: pointer; transition: transform 0.15s ease; }
      .pm-risk-item:active { transform: scale(0.99); }
      .pm-risk-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--pm-danger) 0%, #ff6b6b 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; }
      .pm-risk-info { flex: 1; min-width: 0; }
      .pm-risk-name { display: block; font-size: 0.875rem; font-weight: 600; color: var(--pm-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .pm-risk-class { font-size: 0.6875rem; color: var(--pm-text-muted); }
      .pm-risk-pct { font-size: 0.8125rem; font-weight: 700; color: var(--pm-danger); background: var(--pm-danger-bg); padding: 0.25rem 0.5rem; border-radius: 6px; }

      .pm-classes-list { display: flex; flex-direction: column; gap: 0.625rem; }
      .pm-class-card { background: var(--pm-surface); border-radius: 12px; padding: 0.875rem; position: relative; }
      .pm-class-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
      .pm-class-name { display: block; font-size: 0.9375rem; font-weight: 600; color: var(--pm-text); }
      .pm-class-inst { font-size: 0.6875rem; color: var(--pm-text-muted); }
      .pm-class-badge { font-size: 0.875rem; font-weight: 700; padding: 0.25rem 0.625rem; border-radius: 8px; }
      .pm-class-badge.success { background: var(--pm-success-bg); color: var(--pm-success); }
      .pm-class-badge.warning { background: var(--pm-warning-bg); color: var(--pm-warning); }
      .pm-class-badge.danger { background: var(--pm-danger-bg); color: var(--pm-danger); }
      .pm-class-chart { margin: 0.375rem 0; height: 28px; }
      .pm-class-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.25rem; padding-top: 0.625rem; border-top: 1px solid var(--pm-border); }
      .pm-class-stat { text-align: center; padding: 0.25rem; }
      .pm-class-stat span { display: block; font-size: 0.9375rem; font-weight: 700; color: var(--pm-text); }
      .pm-class-stat small { font-size: 0.5625rem; color: var(--pm-text-muted); text-transform: uppercase; }
      .pm-class-risk { margin-top: 0.5rem; padding: 0.375rem 0.625rem; background: var(--pm-danger-bg); border-radius: 6px; font-size: 0.6875rem; color: var(--pm-danger); display: flex; align-items: center; gap: 0.375rem; }
      .pm-class-btn { position: absolute; top: 0.625rem; right: 0.625rem; background: none; border: none; padding: 0.25rem; color: var(--pm-text-muted); cursor: pointer; font-size: 1.25rem; }

      .pm-search-wrapper { position: relative; margin-bottom: 0.5rem; }
      .pm-search-wrapper i { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); color: var(--pm-text-muted); font-size: 0.875rem; }
      .pm-search-wrapper input { width: 100%; padding: 0.75rem 0.75rem 0.75rem 2.25rem; border: 1px solid var(--pm-border); border-radius: 10px; font-size: 0.875rem; background: var(--pm-surface); color: var(--pm-text); outline: none; transition: border-color 0.2s; }
      .pm-search-wrapper input:focus { border-color: var(--pm-primary); }
      .pm-search-wrapper input::placeholder { color: var(--pm-text-muted); }
      .pm-search-results { display: none; background: var(--pm-surface); border-radius: 10px; overflow: hidden; }
      .pm-search-results.show { display: block; }
      
      /* Panel de estudiantes por clase */
      .pm-clase-students-panel { margin-top: 0.75rem; border-top: 1px solid var(--pm-border); padding-top: 0.75rem; }
      .pm-clase-students-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; font-size: 0.8125rem; font-weight: 600; }
      .pm-clase-students-close { background: none; border: none; font-size: 1.25rem; cursor: pointer; color: var(--pm-text-muted); }
      .pm-clase-students-list { display: flex; flex-direction: column; gap: 0.375rem; max-height: 200px; overflow-y: auto; }
      .pm-clase-student-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: var(--pm-surface-2); border-radius: 6px; cursor: pointer; }
      .pm-clase-student-row:hover { background: var(--pm-border); }
      .pm-student-info { flex: 1; min-width: 0; }
      .pm-student-nombre { display: block; font-size: 0.8125rem; font-weight: 500; color: var(--pm-text); }
      .pm-student-meta { font-size: 0.6875rem; color: var(--pm-text-muted); }
      .pm-student-attendance { text-align: right; }
      .pm-student-attendance span { font-size: 0.8125rem; font-weight: 600; }
      .pm-student-attendance.danger span { color: var(--pm-danger); }
      .pm-student-attendance.warning span { color: var(--pm-warning); }
      .pm-student-attendance.success span { color: var(--pm-success); }
      .pm-student-att-bar { width: 50px; height: 4px; background: var(--pm-border); border-radius: 2px; margin-top: 2px; }
      .pm-student-att-fill { height: 100%; border-radius: 2px; }
      .pm-student-attendance.danger .pm-student-att-fill { background: var(--pm-danger); }
      .pm-student-attendance.warning .pm-student-att-fill { background: var(--pm-warning); }
      .pm-student-attendance.success .pm-student-att-fill { background: var(--pm-success); }

      /* Search results */
      .pm-search-result-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; cursor: pointer; border-bottom: 1px solid var(--pm-border); }
      .pm-search-result-item:last-child { border-bottom: none; }
      .pm-search-result-item:hover { background: var(--pm-surface-2); }
      .pm-search-result-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--pm-primary); color: white; display: flex; align-items: center; justify-content: center; }
      .pm-search-result-info { flex: 1; }
      .pm-search-result-name { display: block; font-size: 0.875rem; font-weight: 500; color: var(--pm-text); }
      .pm-search-result-meta { font-size: 0.6875rem; color: var(--pm-text-muted); }
      .pm-search-result-arrow { color: var(--pm-text-muted); }

      @media (max-width: 600px) {
        .pm-dashboard-overview { grid-template-columns: 1fr 1fr; }
        .pm-overview-card.primary { grid-column: span 2; }
      }
    </style>
  `
}

// ── Asocia eventos ──────────────────────────────────────────────
function bindEvents(container) {
  // Filtro de período SIN reload
  const selectPeriodo = container.querySelector('#pm-filter-periodo')
  selectPeriodo?.addEventListener('change', async (e) => {
    const nuevoPeriodo = parseInt(e.target.value, 10)
    estadoActual.periodo = nuevoPeriodo

    container.innerHTML = `<div class="pm-loading" style="padding:2rem;"><div class="pm-spinner"></div></div>`

    try {
      const nuevosDatos = await cargarDatos(nuevoPeriodo, estadoActual.maestroId)
      const procesados = procesarDatos(nuevosDatos)

      estadoActual.clasesData = procesados.clasesData
      estadoActual.todasSesiones = nuevosDatos.sesiones
      estadoActual.inscripcionesPorClase = nuevosDatos.inscripcionesPorClase
      estadoActual.alertasRiesgo = procesados.alertasRiesgo

      container.innerHTML = generarHTML(procesados)
      bindEvents(container)
      announce(`Período actualizado a ${nuevoPeriodo} semanas. ${procesados.asistenciaPromedio}% de asistencia general.`)
    } catch (err) {
      container.innerHTML = `<p class="pm-empty">Error al cargar datos: ${escHTML(err.message)}</p>`
    }
  })

  // Alumnos en riesgo
  container.querySelectorAll('.pm-risk-item').forEach(item => {
    const id = item.dataset.alumno
    const handler = () => { window.location.hash = `#/alumno?id=${id}` }
    item.addEventListener('click', handler)
    item.addEventListener('keypress', (e) => { if (e.key === 'Enter') handler() })
  })

  // Botón expandir alumnos por clase
  container.querySelectorAll('.pm-class-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const card = btn.closest('.pm-class-card')
      const existente = card.querySelector('.pm-clase-students-panel')
      if (existente) { existente.remove(); return }

      const claseId = btn.dataset.claseId
      const clase = estadoActual.clasesData.find(c => c.id === claseId)
      const alumnos = clase?.alumnos || []
      const sesionesClase = estadoActual.todasSesiones.filter(s => s.clase_id === claseId)

      const alumnosConDatos = alumnos.map(alum => {
        const alumSes = sesionesClase
          .filter(s => s.asistencia?.some(a => a.alumno_id === alum.id))
          .map(s => s.asistencia.find(a => a.alumno_id === alum.id))
        const pres = alumSes.filter(a => a?.estado === 'P').length
        const tot = alumSes.length
        const pct = tot > 0 ? Math.round((pres / tot) * 100) : 0
        const last = sesionesClase
          .filter(s => s.asistencia?.some(a => a.alumno_id === alum.id))
          .sort((a, b) => b.fecha.localeCompare(a.fecha))[0]
        return { ...alum, pct, total: tot, lastFecha: last?.fecha }
      })
      alumnosConDatos.sort((a, b) => a.pct - b.pct)

      const panel = document.createElement('div')
      panel.className = 'pm-clase-students-panel'
      panel.innerHTML = `
        <div class="pm-clase-students-header">
          <span>Alumnos (${alumnosConDatos.length})</span>
          <button class="pm-clase-students-close" aria-label="Cerrar panel">×</button>
        </div>
        <div class="pm-clase-students-list" role="list">
          ${alumnosConDatos.map(alum => `
            <div class="pm-clase-student-row" role="listitem" tabindex="0" data-alumno="${alum.id}">
              <div class="pm-student-info">
                <span class="pm-student-nombre">${escHTML(alum.nombre_completo)}</span>
                <span class="pm-student-meta">${alum.total} sesiones · Última: ${alum.lastFecha ? new Date(alum.lastFecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : '—'}</span>
              </div>
              <div class="pm-student-attendance ${alum.pct < 70 ? 'danger' : alum.pct < 85 ? 'warning' : 'success'}">
                <span>${alum.pct}%</span>
                <div class="pm-student-att-bar"><div class="pm-student-att-fill" style="width:${alum.pct}%"></div></div>
              </div>
            </div>
          `).join('')}
        </div>`
      card.appendChild(panel)

      panel.querySelector('.pm-clase-students-close').addEventListener('click', () => panel.remove())

      const clickOutside = (ev) => {
        if (!panel.contains(ev.target) && ev.target !== btn) {
          panel.remove()
          document.removeEventListener('click', clickOutside)
        }
      }
      setTimeout(() => document.addEventListener('click', clickOutside), 10)

      panel.querySelectorAll('.pm-clase-student-row').forEach(row => {
        const handler = () => window.location.hash = `#/alumno?id=${row.dataset.alumno}`
        row.addEventListener('click', handler)
        row.addEventListener('keypress', (e) => { if (e.key === 'Enter') handler() })
      })
    })
  })

  // Búsqueda de alumnos (solo de las clases del maestro)
  const searchInput = container.querySelector('#pm-alumno-search')
  const searchResults = container.querySelector('#pm-alumno-search-results')
  let searchTimer

  searchInput?.addEventListener('input', () => {
    clearTimeout(searchTimer)
    const q = searchInput.value.trim()
    if (!q) { searchResults.style.display = 'none'; return }
    searchTimer = setTimeout(async () => {
      try {
        const todosLosAlumnos = Object.values(estadoActual.inscripcionesPorClase).flat()
        const idsUnicos = [...new Set(todosLosAlumnos.map(a => a.id))]
        if (idsUnicos.length === 0) {
          searchResults.innerHTML = '<p class="pm-empty" style="padding:0.75rem;">No se encontraron alumnos.</p>'
          searchResults.style.display = 'block'
          return
        }

        const { data: alumnos } = await supabase
          .from('alumnos')
          .select('id, nombre_completo, instrumento_principal')
          .in('id', idsUnicos)
          .ilike('nombre_completo', `%${q}%`)
          .limit(10)

        if (!alumnos?.length) {
          searchResults.innerHTML = '<p class="pm-empty" style="padding:0.75rem;">Sin resultados.</p>'
          searchResults.style.display = 'block'
          return
        }

        searchResults.innerHTML = alumnos.map(a => `
          <div class="pm-search-result-item" role="option" data-id="${a.id}" tabindex="0">
            <div class="pm-search-result-avatar"><i class="bi bi-person-fill"></i></div>
            <div class="pm-search-result-info">
              <span class="pm-search-result-name">${escHTML(a.nombre_completo)}</span>
              <span class="pm-search-result-meta">${escHTML(a.instrumento_principal || '—')}</span>
            </div>
            <i class="bi bi-chevron-right pm-search-result-arrow"></i>
          </div>`).join('')
        searchResults.style.display = 'block'

        searchResults.querySelectorAll('.pm-search-result-item').forEach(row => {
          const handler = () => window.location.hash = `#/alumno?id=${row.dataset.id}`
          row.addEventListener('click', handler)
          row.addEventListener('keypress', (e) => { if (e.key === 'Enter') handler() })
        })
      } catch {
        searchResults.innerHTML = '<p class="pm-empty" style="color:var(--pm-danger);padding:0.75rem;">Error al buscar.</p>'
        searchResults.style.display = 'block'
      }
    }, 300)
  })

  document.addEventListener('click', (e) => {
    if (!searchInput?.contains(e.target) && !searchResults?.contains(e.target)) {
      searchResults.style.display = 'none'
    }
  })
}

// ── Render principal ───────────────────────────────────────────
export async function renderMetricasView(container) {
  container.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`

  const maestro = getMaestroLocal()
  if (!maestro) {
    container.innerHTML = `<p class="pm-empty">No hay sesión activa.</p>`
    return
  }

  // Guardar maestroId en estado
  estadoActual.maestroId = maestro.id

  try {
    const datosIniciales = await cargarDatos(estadoActual.periodo, maestro.id)
    const procesados = procesarDatos(datosIniciales)

    estadoActual.clasesData = procesados.clasesData
    estadoActual.todasSesiones = datosIniciales.sesiones
    estadoActual.inscripcionesPorClase = datosIniciales.inscripcionesPorClase
    estadoActual.alertasRiesgo = procesados.alertasRiesgo

    container.innerHTML = generarHTML(procesados)
    bindEvents(container)
    announce(`Métricas actualizadas. ${procesados.asistenciaPromedio}% de asistencia general.`)
  } catch (err) {
    container.innerHTML = `
      <div class="pm-empty" style="padding:3rem 1rem;text-align:center;" role="alert">
        <p style="color:var(--pm-danger);">Error al cargar métricas</p>
        <p style="font-size:0.85rem;color:var(--pm-text-muted);">${escHTML(err.message)}</p>
      </div>`
  }
}