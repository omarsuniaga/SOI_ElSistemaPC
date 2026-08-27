import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { escHTML } from '../utils/portalUtils.js'
import { getMisClases, getSesiones } from '../services/maestroDataService.js'
import { announce } from '../utils/a11yUtils.js'
import { openClaseAnalysisModal } from '../components/claseAnalysisModal.js'
import { getPeriodoActivo } from '../../modules/periodos/api/periodosApi.js'

// ── Estado de la vista (para persistencia entre eventos) ───────
const estadoActual = {
  periodo: 'periodo',
  periodoNombre: 'Período actual',
  maestroId: null,
  clasesData: [],
  todasSesiones: [],
  inscripcionesPorClase: {},
  alertasRiesgo: []
}

// ── Carga datos según período ───────────────────────────────────
async function cargarDatos(rango, maestroId) {
  const clases = await getMisClases()
  clases.sort((a, b) => a.nombre.localeCompare(b.nombre))

  const hoy = new Date()
  const hoyStr = hoy.toISOString().split('T')[0]
  const periodoActivo = await getPeriodoActivo().catch(() => null)
  let fechaInicioStr
  let fechaFinStr = hoyStr

  if (rango === 'periodo' || rango === undefined || rango === null) {
    fechaInicioStr = periodoActivo?.fecha_inicio || new Date(hoy.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    if (periodoActivo?.fecha_fin && periodoActivo.fecha_fin < hoyStr) {
      fechaFinStr = periodoActivo.fecha_fin
    }
  } else if (rango === 'todo') {
    fechaInicioStr = '2020-01-01'
    fechaFinStr = hoyStr
  } else {
    const semanas = parseInt(rango, 10) || 4
    const fechaInicio = new Date()
    fechaInicio.setDate(fechaInicio.getDate() - semanas * 7)
    fechaInicioStr = fechaInicio.toISOString().split('T')[0]

    // Acotar siempre para no cruzar el inicio del período activo a menos que se pida todo
    if (periodoActivo?.fecha_inicio && periodoActivo.fecha_inicio > fechaInicioStr) {
      fechaInicioStr = periodoActivo.fecha_inicio
    }
  }

  const sesiones = await getSesiones(maestroId, fechaInicioStr, fechaFinStr)
  // Filtrar estrictamente por el rango de fechas pedido para evitar fugas de cache
  const sesionesValidas = (sesiones || []).filter(s => s.fecha >= fechaInicioStr && s.fecha <= fechaFinStr)

  const claseIds = clases.map(c => c.id)
  if (claseIds.length === 0) {
    return { clases, sesiones: sesionesValidas, inscripcionesPorClase: {}, periodoNombre: periodoActivo?.nombre || 'Período actual' }
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

  return { clases, sesiones: sesionesValidas, inscripcionesPorClase, periodoNombre: periodoActivo?.nombre || 'Período actual' }
}

// ── Procesa datos y construye modelo para la vista ──────────────
function procesarDatos({ clases, sesiones, inscripcionesPorClase, periodoNombre }) {
  const sesionesCompletadas = sesiones.filter(s => s.estado === 'registrada').length
  const sesionesPendientes = sesiones.filter(s => s.estado === 'pendiente').length
  const sesionesBorrador = sesiones.filter(s => s.borrador === true).length

  // Granularidad por Días / Jornadas
  const diasMapGlobal = new Map()
  sesiones.forEach(s => {
    const fecha = s.fecha ? String(s.fecha).slice(0, 10) : 'sin-fecha'
    if (!diasMapGlobal.has(fecha)) {
      diasMapGlobal.set(fecha, { presentes: 0, ausentes: 0, justificados: 0, total: 0 })
    }
    const diaStat = diasMapGlobal.get(fecha)
    ;(s.asistencia || []).forEach(a => {
      diaStat.total++
      if (a.estado === 'P' || a.estado === 'presente' || a.estado === 'T' || a.estado === 'tarde') diaStat.presentes++
      else if (a.estado === 'A' || a.estado === 'ausente') diaStat.ausentes++
      else if (a.estado === 'J' || a.estado === 'justificado') diaStat.justificados++
    })
  })

  let totalPresentes = 0, totalAusentes = 0, totalJustificados = 0, totalRegistros = 0
  const totalDiasConvocados = diasMapGlobal.size
  let totalDiasAsistidos = 0

  diasMapGlobal.forEach(d => {
    totalRegistros += d.total
    totalPresentes += d.presentes
    totalAusentes += d.ausentes
    totalJustificados += d.justificados
    if (d.presentes > 0) totalDiasAsistidos++
  })

  const asistenciaPromedio = totalRegistros > 0 ? Math.round((totalPresentes / totalRegistros) * 100) : 0
  const asistenciaDiasPct = totalDiasConvocados > 0 ? Math.round((totalDiasAsistidos / totalDiasConvocados) * 100) : 0

  // Indexar por clase y alumno agrupando por DÍA calendario
  const sesionesPorClase = new Map()
  const asistenciaDiasPorClaseAlumno = new Map()

  for (const sesion of sesiones) {
    const sesionesClase = sesionesPorClase.get(sesion.clase_id) || []
    sesionesClase.push(sesion)
    sesionesPorClase.set(sesion.clase_id, sesionesClase)

    if (!Array.isArray(sesion.asistencia)) continue
    const fecha = sesion.fecha ? String(sesion.fecha).slice(0, 10) : 'sin-fecha'
    const asistenciaAlumnos = asistenciaDiasPorClaseAlumno.get(sesion.clase_id) || new Map()

    for (const asistencia of sesion.asistencia) {
      if (!asistencia?.alumno_id) continue
      const alumnoDias = asistenciaAlumnos.get(asistencia.alumno_id) || new Map()
      const diaAlumno = alumnoDias.get(fecha) || { presentes: 0, ausentes: 0, total: 0 }
      diaAlumno.total++
      if (asistencia.estado === 'P' || asistencia.estado === 'presente' || asistencia.estado === 'T' || asistencia.estado === 'tarde') {
        diaAlumno.presentes++
      } else if (asistencia.estado === 'A' || asistencia.estado === 'ausente') {
        diaAlumno.ausentes++
      }
      alumnoDias.set(fecha, diaAlumno)
      asistenciaAlumnos.set(asistencia.alumno_id, alumnoDias)
    }
    asistenciaDiasPorClaseAlumno.set(sesion.clase_id, asistenciaAlumnos)
  }

  const clasesDataMap = clases.map(clase => {
    const sesionesClase = sesionesPorClase.get(clase.id) || []
    const completadas = sesionesClase.filter(s => s.estado === 'registrada').length
    const pending = sesionesClase.filter(s => s.estado === 'pendiente').length
    const alumnos = inscripcionesPorClase[clase.id] || []
    const totalAlumnos = alumnos.length

    const sessionAttendance = sesionesClase
      .filter(s => s.estado === 'registrada')
      .slice(-8)
      .map(s => {
        const pres = (s.asistencia || []).filter(a => a.estado === 'P' || a.estado === 'presente' || a.estado === 'T' || a.estado === 'tarde').length
        const tot = (s.asistencia || []).length
        return tot > 0 ? Math.round((pres / tot) * 100) : 0
      })

    let presTotal = 0, totAsist = 0
    sesionesClase.forEach(s => {
      (s.asistencia || []).forEach(a => {
        totAsist++
        if (a.estado === 'P' || a.estado === 'presente' || a.estado === 'T' || a.estado === 'tarde') presTotal++
      })
    })
    const avgAttendance = totAsist > 0 ? Math.round((presTotal / totAsist) * 100) : 0

    const conContenido = sesionesClase.filter(s => s.contenido_dsl?.trim()).length
    const progress = sesionesClase.length > 0
      ? Math.min(100, Math.round((conContenido / Math.max(completadas, 1)) * 100))
      : 0

    const riskStudents = []
    const asistenciaAlumnos = asistenciaDiasPorClaseAlumno.get(clase.id) || new Map()

    for (const alum of alumnos) {
      const alumnoDias = asistenciaAlumnos.get(alum.id) || new Map()
      const totalDiasAlumno = alumnoDias.size
      let diasConPresencia = 0
      let diasConFalta = 0

      alumnoDias.forEach(d => {
        if (d.presentes > 0) diasConPresencia++
        if (d.ausentes > 0 && d.presentes === 0) diasConFalta++
      })

      const pctDias = totalDiasAlumno > 0
        ? Math.round((diasConPresencia / totalDiasAlumno) * 100)
        : 0

      if (totalDiasAlumno > 0 && (pctDias < 70 || diasConPresencia === 0)) {
        riskStudents.push({
          id: alum.id,
          nombre: alum.nombre_completo,
          pct: pctDias,
          diasConPresencia,
          diasConFalta,
          totalDias: totalDiasAlumno,
        })
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

  // Consolidar riesgo a nivel global del docente para no emitir falsos "0%" cuando asisten a otras de sus cátedras
  const alumnoRiesgoGlobalMap = new Map()

  for (const clase of clasesDataMap) {
    const asistenciaAlumnos = asistenciaDiasPorClaseAlumno.get(clase.id) || new Map()
    for (const alum of clase.alumnos) {
      const alumnoDias = asistenciaAlumnos.get(alum.id) || new Map()
      if (!alumnoRiesgoGlobalMap.has(alum.id)) {
        alumnoRiesgoGlobalMap.set(alum.id, {
          id: alum.id,
          nombre: alum.nombre_completo,
          diasGlobales: new Map(),
          clasesDesglose: [],
        })
      }
      const alGlobal = alumnoRiesgoGlobalMap.get(alum.id)
      let diasPresClase = 0
      const diasTotClase = alumnoDias.size

      alumnoDias.forEach((d, fecha) => {
        if (!alGlobal.diasGlobales.has(fecha)) {
          alGlobal.diasGlobales.set(fecha, { presentes: 0, ausentes: 0 })
        }
        const gDia = alGlobal.diasGlobales.get(fecha)
        if (d.presentes > 0) {
          gDia.presentes += d.presentes
          diasPresClase++
        }
        if (d.ausentes > 0) gDia.ausentes += d.ausentes
      })

      if (diasTotClase > 0) {
        alGlobal.clasesDesglose.push({
          claseNombre: clase.nombre,
          diasPresClase,
          diasTotClase,
          pct: Math.round((diasPresClase / diasTotClase) * 100),
        })
      }
    }
  }

  const alertas = []
  alumnoRiesgoGlobalMap.forEach(alum => {
    const totalDiasDocente = alum.diasGlobales.size
    if (totalDiasDocente === 0) return

    let diasAsistidosDocente = 0
    let diasAusenteDocente = 0
    alum.diasGlobales.forEach(d => {
      if (d.presentes > 0) diasAsistidosDocente++
      else if (d.ausentes > 0) diasAusenteDocente++
    })

    const pctGlobalDocente = Math.round((diasAsistidosDocente / totalDiasDocente) * 100)

    if (pctGlobalDocente < 70 || diasAsistidosDocente === 0) {
      const claseCritica = alum.clasesDesglose.sort((a, b) => a.pct - b.pct)[0]?.claseNombre || 'Clases'
      alertas.push({
        tipo: 'baja_asistencia',
        alumnoId: alum.id,
        nombre: alum.nombre,
        clase: alum.clasesDesglose.length > 1 ? `${claseCritica} (+${alum.clasesDesglose.length - 1} cátedras)` : claseCritica,
        valor: pctGlobalDocente,
        diasConPresencia: diasAsistidosDocente,
        diasConFalta: diasAusenteDocente,
        totalDias: totalDiasDocente,
        mensaje: diasAsistidosDocente === 0
          ? `0% (${diasAusenteDocente}/${totalDiasDocente} días ausente)`
          : `${pctGlobalDocente}% (${diasAsistidosDocente}/${totalDiasDocente} días)`
      })
    }
  })

  alertas.sort((a, b) => a.valor - b.valor || b.diasConFalta - a.diasConFalta)

  return {
    totalClases: clases.length,
    totalDiasConvocados,
    totalDiasAsistidos,
    sesionesCompletadas,
    sesionesPendientes: sesionesPendientes + sesionesBorrador,
    totalPresentes,
    totalAusentes,
    totalJustificados,
    totalRegistros,
    asistenciaPromedio,
    asistenciaDiasPct,
    clasesData: clasesDataMap,
    alertasRiesgo: alertas,
    inscripcionesPorClase,
    periodoNombre
  }
}

// ── Genera el HTML del dashboard ────────────────────────────────
function generarHTML(datos) {
  const {
    totalClases, totalDiasConvocados, totalDiasAsistidos, sesionesCompletadas, sesionesPendientes,
    totalPresentes, totalAusentes, totalJustificados, totalRegistros,
    asistenciaPromedio, asistenciaDiasPct, clasesData, alertasRiesgo, periodoNombre
  } = datos

  const pctPresentes = totalRegistros > 0 ? Math.round((totalPresentes / totalRegistros) * 100) : 0
  const pctAusentes = totalRegistros > 0 ? Math.round((totalAusentes / totalRegistros) * 100) : 0
  const pctJustificados = totalRegistros > 0 ? Math.round((totalJustificados / totalRegistros) * 100) : 0

  const announceText = `Dashboard: ${asistenciaPromedio}% asistencia general, ${totalClases} clases, ${sesionesCompletadas} sesiones registradas, ${totalDiasConvocados || 0} días lectivos evaluados.`

  return `
    <div class="pm-dashboard" role="main" aria-label="Panel de métricas">
      <div role="status" aria-live="polite" aria-atomic="true" class="pm-visually-hidden">${escHTML(announceText)}</div>
      <header class="pm-dashboard-header">
        <div>
          <h1 class="pm-dashboard-title">Dashboard</h1>
          <p class="pm-dashboard-subtitle">Resumen académico · ${escHTML(periodoNombre || 'Período actual')}</p>
        </div>
        <select id="pm-filter-periodo" class="pm-dashboard-select" aria-label="Período de análisis">
          <option value="periodo" ${String(estadoActual.periodo) === 'periodo' ? 'selected' : ''}>Período actual (${escHTML(periodoNombre || 'Activo')})</option>
          <option value="4" ${String(estadoActual.periodo) === '4' ? 'selected' : ''}>Últimas 4 semanas</option>
          <option value="8" ${String(estadoActual.periodo) === '8' ? 'selected' : ''}>Últimas 8 semanas</option>
          <option value="12" ${String(estadoActual.periodo) === '12' ? 'selected' : ''}>Últimas 12 semanas</option>
          <option value="todo" ${String(estadoActual.periodo) === 'todo' ? 'selected' : ''}>Todo el historial</option>
        </select>
      </header>

      <button type="button" id="pm-btn-ver-misclases" class="pm-btn pm-btn-muted pm-btn-sm" style="width:auto;margin-bottom:1rem;">
        <i class="bi bi-journal-text"></i> Ver mis clases dadas
      </button>

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
            <span class="pm-overview-detail">${totalPresentes} asistencias · ${totalDiasConvocados || 0} días lectivos</span>
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
            <div class="pm-attendance-bar-label">
              <span><i class="bi bi-check-circle-fill" style="color:#30d158"></i> Presentes</span>
              <span>${totalPresentes} &nbsp;·&nbsp; ${pctPresentes}%</span>
            </div>
            <div class="pm-attendance-bar-track"><div class="pm-attendance-bar-fill success" style="width:${pctPresentes}%"></div></div>
          </div>
          <div class="pm-attendance-bar-item">
            <div class="pm-attendance-bar-label">
              <span><i class="bi bi-x-circle-fill" style="color:#ff3b30"></i> Ausentes</span>
              <span>${totalAusentes} &nbsp;·&nbsp; ${pctAusentes}%</span>
            </div>
            <div class="pm-attendance-bar-track"><div class="pm-attendance-bar-fill danger" style="width:${pctAusentes}%"></div></div>
          </div>
          <div class="pm-attendance-bar-item">
            <div class="pm-attendance-bar-label">
              <span><i class="bi bi-exclamation-circle-fill" style="color:#ff9500"></i> Justificados</span>
              <span>${totalJustificados} &nbsp;·&nbsp; ${pctJustificados}%</span>
            </div>
            <div class="pm-attendance-bar-track"><div class="pm-attendance-bar-fill warning" style="width:${pctJustificados}%"></div></div>
          </div>
        </div>
      </section>

      ${alertasRiesgo.length > 0 ? `
      <section class="pm-dashboard-section" aria-label="Alumnos en riesgo">
        <h2 class="pm-section-title">Alumnos en Riesgo por Ausentismo <span class="pm-section-badge">${alertasRiesgo.length}</span></h2>
        <div class="pm-risk-list" role="list">
          ${alertasRiesgo.slice(0, 8).map(a => `
            <div class="pm-risk-item" role="listitem" tabindex="0" data-alumno="${a.alumnoId}" aria-label="Ver perfil de ${escHTML(a.nombre)}">
              <div class="pm-risk-avatar" aria-hidden="true">${(a.nombre || 'A')[0].toUpperCase()}</div>
              <div class="pm-risk-info">
                <span class="pm-risk-name">${escHTML(a.nombre)}</span>
                <span class="pm-risk-class">${escHTML(a.clase)}</span>
              </div>
              <span class="pm-risk-pct ${a.valor === 0 || a.diasConPresencia === 0 ? 'bg-danger text-white px-2 py-1 rounded' : ''}">${escHTML(a.mensaje)}</span>
            </div>
          `).join('')}
        </div>
      </section>
      ` : ''}

      <section class="pm-dashboard-section" aria-label="Rendimiento por clase">
        <h2 class="pm-section-title">Mis Clases</h2>
        <div class="pm-search-wrapper">
          <i class="bi bi-search" aria-hidden="true"></i>
          <input type="search" id="pm-search-input" placeholder="Buscar alumno..." aria-label="Buscar alumno">
        </div>
        <div id="pm-search-results" class="pm-search-results"></div>

        <div class="pm-classes-list">
          ${clasesData.map(c => {
            const avgColor = c.avgAttendance >= 70 ? 'success' : c.avgAttendance >= 50 ? 'warning' : 'danger'
            const sparkData = c.sessionAttendance || []
            return `
              <div class="pm-class-card2" data-clase-id="${c.id}">
                <div class="pm-class-card2__header">
                  <div class="pm-class-card2__title-group">
                    <span class="pm-class-card2__name">${escHTML(c.nombre)}</span>
                    <span class="pm-class-card2__inst">${escHTML(c.instrumento || 'Sin instrumento')}</span>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <span class="pm-class-card2__pct ${avgColor}">${c.avgAttendance}%</span>
                    <button class="pm-analisis-btn-metrics" data-clase-id="${c.id}" title="Análisis de IA de la clase">
                      <i class="bi bi-robot"></i>
                    </button>
                    <button class="pm-class-btn2" data-clase-id="${c.id}" aria-label="Ver alumnos de ${escHTML(c.nombre)}">
                      <i class="bi bi-people-fill"></i>
                    </button>
                  </div>
                </div>

                <div class="pm-class-card2__spark" aria-hidden="true">
                  ${sparkData.length > 0
                    ? sparkData.map((v, idx) => {
                        const h = Math.max(4, Math.round((v / 100) * 28))
                        const col = v >= 70 ? 'var(--pm-success)' : v >= 50 ? 'var(--pm-warning)' : 'var(--pm-danger)'
                        const isLast = idx === sparkData.length - 1
                        return `<div class="pm-spark-bar ${isLast ? 'pm-spark-last' : ''}" style="height:${h}px;background:${col}" title="${v}%"></div>`
                      }).join('')
                    : `<span class="pm-spark-empty">Sin sesiones</span>`
                  }
                </div>

                <div class="pm-class-card2__stats">
                  <div class="pm-cs2">
                    <i class="bi bi-people"></i>
                    <span class="pm-cs2__val">${c.totalAlumnos}</span>
                    <span class="pm-cs2__lbl">Alumnos</span>
                  </div>
                  <div class="pm-cs2 pm-cs2--success">
                    <i class="bi bi-check2-circle"></i>
                    <span class="pm-cs2__val">${c.sesionesCompletadas}</span>
                    <span class="pm-cs2__lbl">Registradas</span>
                  </div>
                  <div class="pm-cs2 pm-cs2--warning">
                    <i class="bi bi-clock-history"></i>
                    <span class="pm-cs2__val">${c.sesionesPendientes}</span>
                    <span class="pm-cs2__lbl">Pendientes</span>
                  </div>
                  <div class="pm-cs2 pm-cs2--blue">
                    <i class="bi bi-book"></i>
                    <span class="pm-cs2__val">${c.progress}%</span>
                    <span class="pm-cs2__lbl">Contenido</span>
                  </div>
                </div>

                ${c.riskStudents.length > 0 ? `
                  <div class="pm-class-card2__risk">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    <span>${c.riskStudents.length} alumno(s) con asistencia &lt;70%</span>
                  </div>
                ` : ''}
              </div>
            `
          }).join('')}
        </div>
      </section>
    </div>

    <style>
      .pm-dashboard { padding: 1rem; max-width: 900px; margin: 0 auto; }
      .pm-dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
      .pm-dashboard-title { font-size: 1.5rem; font-weight: 700; margin: 0; }
      .pm-dashboard-subtitle { font-size: 0.875rem; color: var(--pm-text-muted); margin: 0; }
      .pm-dashboard-select { padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid var(--pm-border); background: var(--pm-surface); color: var(--pm-text); font-size: 0.875rem; }

      .pm-dashboard-overview { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem; }
      .pm-overview-card { background: var(--pm-surface); border-radius: 12px; padding: 1rem; display: flex; align-items: center; gap: 1rem; }
      .pm-overview-card.primary { background: var(--pm-surface); border: 1px solid var(--pm-border); }
      .pm-overview-ring { width: 56px; height: 56px; flex-shrink: 0; }
      .pm-circular-chart { width: 100%; height: 100%; }
      .pm-circle-bg { fill: none; stroke: var(--pm-border); stroke-width: 3; }
      .pm-circle { fill: none; stroke: var(--pm-primary); stroke-width: 3; stroke-linecap: round; }
      .pm-percentage { fill: var(--pm-text); font-size: 0.6rem; font-weight: 700; text-anchor: middle; }
      .pm-overview-info { display: flex; flex-direction: column; }
      .pm-overview-label { font-size: 0.75rem; color: var(--pm-text-muted); text-transform: uppercase; font-weight: 600; }
      .pm-overview-detail { font-size: 0.875rem; font-weight: 600; }
      .pm-overview-stat { background: var(--pm-surface); border: 1px solid var(--pm-border); border-radius: 12px; padding: 0.75rem; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
      .pm-overview-stat.warning { border-color: var(--pm-warning); }
      .pm-overview-stat.warning .pm-overview-number { color: var(--pm-warning); }
      .pm-overview-number { font-size: 1.5rem; font-weight: 700; }
      .pm-overview-text { font-size: 0.6875rem; color: var(--pm-text-muted); text-transform: uppercase; font-weight: 600; }

      .pm-dashboard-section { margin-bottom: 1.5rem; }
      .pm-section-title { font-size: 1.125rem; font-weight: 600; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
      .pm-section-badge { font-size: 0.75rem; background: var(--pm-danger); color: white; padding: 2px 6px; border-radius: 10px; }

      .pm-attendance-bars { background: var(--pm-surface); border: 1px solid var(--pm-border); border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
      .pm-attendance-bar-item { display: flex; flex-direction: column; gap: 0.25rem; }
      .pm-attendance-bar-label { display: flex; justify-content: space-between; font-size: 0.8125rem; font-weight: 500; }
      .pm-attendance-bar-track { height: 8px; background: var(--pm-border); border-radius: 4px; overflow: hidden; }
      .pm-attendance-bar-fill { height: 100%; border-radius: 4px; }
      .pm-attendance-bar-fill.success { background: #30d158; }
      .pm-attendance-bar-fill.danger { background: #ff3b30; }
      .pm-attendance-bar-fill.warning { background: #ff9500; }

      .pm-risk-list { display: flex; flex-direction: column; gap: 0.5rem; }
      .pm-risk-item { display: flex; align-items: center; gap: 0.75rem; background: var(--pm-surface); border: 1px solid var(--pm-border); border-radius: 10px; padding: 0.625rem 0.875rem; cursor: pointer; transition: transform 0.15s; }
      .pm-risk-item:hover { transform: translateX(4px); }
      .pm-risk-avatar { width: 32px; height: 32px; border-radius: 50%; background: #ff3b30; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; }
      .pm-risk-info { flex: 1; display: flex; flex-direction: column; }
      .pm-risk-name { font-size: 0.875rem; font-weight: 600; }
      .pm-risk-class { font-size: 0.75rem; color: var(--pm-text-muted); }
      .pm-risk-pct { font-size: 0.875rem; font-weight: 700; color: #ff3b30; }

      .pm-classes-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
      .pm-class-card2 { background: var(--pm-surface); border: 1px solid var(--pm-border); border-radius: 12px; padding: 1rem; }
      .pm-class-card2__header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
      .pm-class-card2__title-group { display: flex; flex-direction: column; }
      .pm-class-card2__name { font-size: 0.9375rem; font-weight: 600; }
      .pm-class-card2__inst { font-size: 0.75rem; color: var(--pm-text-muted); }
      .pm-class-card2__pct { font-size: 0.875rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; }
      .pm-class-card2__pct.success { background: rgba(48,209,88,0.15); color: #30d158; }
      .pm-class-card2__pct.warning { background: rgba(255,149,0,0.15); color: #ff9500; }
      .pm-class-card2__pct.danger  { background: rgba(255,59,48,0.15); color: #ff3b30; }

      .pm-class-card2__spark { display: flex; align-items: flex-end; gap: 3px; height: 32px; margin: 0 0 0.625rem; padding: 4px 0 0; }
      .pm-spark-bar { flex: 1; border-radius: 3px 3px 0 0; min-height: 4px; opacity: 0.75; transition: opacity 0.2s; }
      .pm-spark-bar.pm-spark-last { opacity: 1; }
      .pm-spark-empty { font-size: 0.75rem; color: var(--pm-text-muted); align-self: center; }

      .pm-class-card2__stats { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid var(--pm-border); padding-top: 0.5rem; gap: 0; }
      .pm-cs2 { display: flex; flex-direction: column; align-items: center; padding: 0.25rem 0.125rem; gap: 0.0625rem; }
      .pm-cs2 i { font-size: 0.6875rem; margin-bottom: 0.125rem; opacity: 0.7; }
      .pm-cs2__val { font-size: 1rem; font-weight: 800; color: var(--pm-text); line-height: 1; }
      .pm-cs2__lbl { font-size: 0.5rem; color: var(--pm-text-muted); text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; }
      .pm-cs2--success { color: #30d158; }
      .pm-cs2--success .pm-cs2__val { color: #30d158; }
      .pm-cs2--warning { color: #ff9500; }
      .pm-cs2--warning .pm-cs2__val { color: #ff9500; }
      .pm-cs2--blue { color: #0a84ff; }
      .pm-cs2--blue .pm-cs2__val { color: var(--pm-text); }

      .pm-class-card2__risk { margin-top: 0.5rem; display: flex; align-items: center; gap: 0.375rem; padding: 0.375rem 0.625rem; background: rgba(255,59,48,0.1); border-radius: 8px; font-size: 0.6875rem; color: #ff3b30; font-weight: 500; }
      .pm-analisis-btn-metrics { background: transparent; border: 1px solid var(--pm-border); padding: 0.375rem 0.5rem; border-radius: 8px; color: var(--pm-text-muted); cursor: pointer; font-size: 0.9rem; transition: all 0.2s; display: flex; align-items: center; justify-content: center; min-width: 32px; height: 32px; }
      .pm-analisis-btn-metrics:hover { background: var(--pm-primary); color: white; border-color: var(--pm-primary); }
      .pm-class-btn2 { background: var(--pm-surface-2); border: none; padding: 0.375rem 0.5rem; border-radius: 8px; color: var(--pm-text-muted); cursor: pointer; font-size: 0.75rem; transition: background 0.15s, color 0.15s; }
      .pm-class-btn2:hover { background: var(--pm-border); color: var(--pm-text); }

      .pm-search-wrapper { position: relative; margin-bottom: 0.5rem; }
      .pm-search-wrapper i { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); color: var(--pm-text-muted); font-size: 0.875rem; }
      .pm-search-wrapper input { width: 100%; padding: 0.75rem 0.75rem 0.75rem 2.25rem; border: 1px solid var(--pm-border); border-radius: 10px; font-size: 0.875rem; background: var(--pm-surface); color: var(--pm-text); outline: none; transition: border-color 0.2s; }
      .pm-search-wrapper input:focus { border-color: var(--pm-primary); }
      .pm-search-wrapper input::placeholder { color: var(--pm-text-muted); }
      .pm-search-results { display: none; background: var(--pm-surface); border-radius: 10px; overflow: hidden; }
      .pm-search-results.show { display: block; }

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

      @media (max-width: 600px) {
        .pm-dashboard-overview { grid-template-columns: 1fr 1fr; }
        .pm-overview-card.primary { grid-column: span 2; }
      }
    </style>
  `
}

// ── Asocia eventos ──────────────────────────────────────────────
function bindEvents(container) {
  container.querySelector('#pm-btn-ver-misclases')?.addEventListener('click', () => {
    window.router?.navigate('mis-clases')
  })

  // Filtro de período SIN reload
  const selectPeriodo = container.querySelector('#pm-filter-periodo')
  selectPeriodo?.addEventListener('change', async (e) => {
    const nuevoPeriodo = e.target.value
    estadoActual.periodo = nuevoPeriodo

    container.innerHTML = `<div class="pm-loading" style="padding:2rem;"><div class="pm-spinner"></div></div>`

    try {
      const nuevosDatos = await cargarDatos(nuevoPeriodo, estadoActual.maestroId)
      const procesados = procesarDatos(nuevosDatos)

      estadoActual.clasesData = procesados.clasesData
      estadoActual.todasSesiones = nuevosDatos.sesiones
      estadoActual.inscripcionesPorClase = nuevosDatos.inscripcionesPorClase
      estadoActual.alertasRiesgo = procesados.alertasRiesgo
      estadoActual.periodoNombre = nuevosDatos.periodoNombre

      container.innerHTML = generarHTML(procesados)
      bindEvents(container)
      announce(`Período actualizado. ${procesados.asistenciaPromedio}% de asistencia general.`)
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

  // Botón de análisis de clase
  const hoy = new Date()
  const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
  const periodo = estadoActual.periodo === 'periodo' ? 4 : (parseInt(estadoActual.periodo, 10) || 4)
  const botonesAnalisis = container.querySelectorAll('.pm-analisis-btn-metrics')
  botonesAnalisis.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      e.preventDefault()
      const claseId = btn.dataset.claseId
      openClaseAnalysisModal(claseId, fechaHoy, periodo)
    })
  })

  // Botón expandir alumnos por clase (soporta ambos selectores: legacy y v2)
  container.querySelectorAll('.pm-class-btn, .pm-class-btn2').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const card = btn.closest('.pm-class-card2, .pm-class-card')
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
}

// ── Render principal ───────────────────────────────────────────
export function getAlumnoIndexFromMetricas() {
  if (!estadoActual.clasesData.length && !Object.keys(estadoActual.inscripcionesPorClase).length) return null
  const map = new Map()
  for (const [claseId, alumnos] of Object.entries(estadoActual.inscripcionesPorClase)) {
    const clase = estadoActual.clasesData.find(c => c.id === claseId)
    for (const alum of alumnos) {
      if (!map.has(alum.id)) map.set(alum.id, { ...alum, clases: [] })
      if (clase) map.get(alum.id).clases.push(clase.nombre)
    }
  }
  return [...map.values()]
}

export async function renderMetricasView(container) {
  container.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`

  const maestro = getMaestroLocal()
  if (!maestro) {
    container.innerHTML = `<p class="pm-empty">No hay sesión activa.</p>`
    return
  }

  estadoActual.maestroId = maestro.id

  try {
    const datosIniciales = await cargarDatos(estadoActual.periodo, maestro.id)
    const procesados = procesarDatos(datosIniciales)

    estadoActual.clasesData = procesados.clasesData
    estadoActual.todasSesiones = datosIniciales.sesiones
    estadoActual.inscripcionesPorClase = datosIniciales.inscripcionesPorClase
    estadoActual.alertasRiesgo = procesados.alertasRiesgo
    estadoActual.periodoNombre = datosIniciales.periodoNombre

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
