import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { escHTML } from '../utils/portalUtils.js'
import { getMisClases, getSesiones } from '../services/maestroDataService.js'

// ── Enhanced SVG chart helpers ───────────────────────────────────

function donutSVG(pct, color = 'var(--pm-primary)', size = 80) {
  const r = (size / 2) - 8
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  const cx = size / 2, cy = size / 2
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="donutGrad${pct}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.6" />
        </linearGradient>
      </defs>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--pm-border)" stroke-width="8"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#donutGrad${pct})" stroke-width="8"
        stroke-dasharray="${dash} ${circ}"
        stroke-linecap="round"
        transform="rotate(-90 ${cx} ${cy})"/>
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central"
        font-size="18" font-weight="700" fill="var(--pm-text)">${pct}%</text>
    </svg>`
}

function miniSparkline(data, width = 120, height = 32) {
  if (!data || data.length === 0) return ''
  const max = Math.max(...data, 1)
  const step = width / (data.length - 1)
  const points = data.map((v, i) => {
    const x = i * step
    const y = height - (v / max) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <polyline fill="none" stroke="var(--pm-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${points}"/>
      <circle cx="${points.split(' ')[0].split(',')[0]}" cy="${points.split(' ')[0].split(',')[1]}" r="3" fill="var(--pm-primary)"/>
      <circle cx="${points.split(' ').pop().split(',')[0]}" cy="${points.split(' ').pop().split(',')[1]}" r="3" fill="var(--pm-primary)"/>
    </svg>`
}

function barChartSVG(data, maxVal, width = 200, height = 60) {
  if (!data || data.length === 0) return `<text x="${width/2}" y="${height/2}" text-anchor="middle" font-size="11" fill="var(--pm-text-muted)">Sin datos</text>`
  const barW = Math.max(12, Math.min(28, (width - (data.length - 1) * 6) / data.length))
  const gap = (width - barW * data.length) / (data.length + 1)
  const max = Math.max(...data, 1)
  return data.map((v, i) => {
    const barH = Math.max(4, (v / max) * (height - 12))
    const x = gap + i * (barW + gap)
    const y = height - barH - 8
    const color = v >= 70 ? 'var(--pm-success)' : v >= 50 ? 'var(--pm-warning)' : 'var(--pm-danger)'
    return `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="4" fill="${color}"/>
      <text x="${x + barW/2}" y="${y - 4}" text-anchor="middle" font-size="8" fill="var(--pm-text-muted)">${v}%</text>`
  }).join('')
}

function trendArrow(current, previous) {
  if (!previous || previous === 0) return ''
  const diff = current - previous
  const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '→'
  const color = diff > 0 ? 'var(--pm-success)' : diff < 0 ? 'var(--pm-danger)' : 'var(--pm-text-muted)'
  return `<span style="color:${color};font-size:0.75rem;margin-left:4px;">${arrow} ${Math.abs(Math.round(diff))}%</span>`
}

// ── Render helper ────────────────────────────────────────────

export async function renderMetricasView(container) {
  container.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`

  const maestro = getMaestroLocal()
  if (!maestro) {
    container.innerHTML = `<p class="pm-empty">No hay sesión activa.</p>`
    return
  }

  try {
    const clases = await getMisClases()
    clases.sort((a, b) => a.nombre.localeCompare(b.nombre))

    const hace4Semanas = new Date()
    hace4Semanas.setDate(hace4Semanas.getDate() - 28)
    const fecha4SemanasAtras = hace4Semanas.toISOString().split('T')[0]
    const hoy = new Date().toISOString().split('T')[0]
    const todasSesiones = await getSesiones(maestro.id, fecha4SemanasAtras, hoy)
    const sesiones = todasSesiones || []

    // ── Global KPIs ────────────────────────────────────────────────
    const totalClases = clases?.length || 0
    const sesionesCompletadas = sesiones.filter(s => s.estado === 'registrada').length
    const sesionesPendientes = sesiones.filter(s => s.estado === 'pendiente').length
    const sesionesBorrador = sesiones.filter(s => s.borrador === true).length

    let totalPresentes = 0, totalAusentes = 0, totalJustificados = 0, totalRegistros = 0
    ;(sesiones || []).forEach(s => {
      ;(s.asistencia || []).forEach(a => {
        totalRegistros++
        if (a.estado === 'P') totalPresentes++
        else if (a.estado === 'A') totalAusentes++
        else if (a.estado === 'J') totalJustificados++
      })
    })
    const asistenciaPromedio = totalRegistros > 0
      ? Math.round((totalPresentes / totalRegistros) * 100) : 0

    // ── Per-clase data ─────────────────────────────────────────────
    const claseIds = (clases || []).map(c => c.id)

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

    // Build enriched class data
    const clasesData = (clases || []).map(clase => {
      const sesionesClase = sesiones.filter(s => s.clase_id === clase.id)
      const completadas = sesionesClase.filter(s => s.estado === 'registrada').length
      const pending = sesionesClase.filter(s => s.estado === 'pendiente').length
      const alumnos = inscripcionesPorClase[clase.id] || []
      const totalAlumnos = alumnos.length

      // Attendance per session (last 8 for bar chart)
      const sessionAttendance = sesionesClase
        .filter(s => s.estado === 'registrada')
        .slice(-8)
        .map(s => {
          const pres = (s.asistencia || []).filter(a => a.estado === 'P').length
          const tot = (s.asistencia || []).length
          return tot > 0 ? Math.round((pres / tot) * 100) : 0
        })

      // Average attendance
      let pres = 0, tot = 0
      sesionesClase.forEach(s => {
        ;(s.asistencia || []).forEach(a => {
          tot++
          if (a.estado === 'P') pres++
        })
      })
      const avgAttendance = tot > 0 ? Math.round((pres / tot) * 100) : 0

      // Progress (simulated from sesiones with contenido_dsl)
      const conContenido = sesionesClase.filter(s => s.contenido_dsl?.trim()).length
      const progress = sesionesClase.length > 0
        ? Math.min(100, Math.round((conContenido / Math.max(completadas, 1)) * 100))
        : 0

      // Risk: low attendance students
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
        riskStudents
      }
    })

    // ── Top-level risk alerts ──────────────────────────────────────
    const alertasRiesgo = []
    for (const clase of clasesData) {
      for (const alum of clase.riskStudents) {
        alertasRiesgo.push({
          tipo: 'baja_asistencia',
          alumnoId: alum.id,
          nombre: alum.nombre,
          clase: clase.nombre,
          valor: alum.pct,
          mensaje: `${alum.pct}%`
        })
      }
    }

    // ── Render ────────────────────────────────────────────────────
    const pctPresentes = totalRegistros > 0 ? Math.round((totalPresentes/totalRegistros)*100) : 0
    const pctAusentes = totalRegistros > 0 ? Math.round((totalAusentes/totalRegistros)*100) : 0
    const pctJustificados = totalRegistros > 0 ? Math.round((totalJustificados/totalRegistros)*100) : 0
    
    container.innerHTML = `
      <div class="pm-dashboard">
        <!-- Header -->
        <header class="pm-dashboard-header">
          <div class="pm-dashboard-header-content">
            <h1 class="pm-dashboard-title">Dashboard</h1>
            <p class="pm-dashboard-subtitle">Resumen académico</p>
          </div>
          <div class="pm-dashboard-period">
            <select id="pm-filter-periodo" class="pm-dashboard-select">
              <option value="4">4 semanas</option>
              <option value="8">8 semanas</option>
              <option value="12">12 semanas</option>
            </select>
          </div>
        </header>

        <!-- Stats Overview -->
        <section class="pm-dashboard-overview">
          <div class="pm-overview-card primary">
            <div class="pm-overview-ring">
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
          
          <div class="pm-overview-stat">
            <span class="pm-overview-number">${totalClases}</span>
            <span class="pm-overview-text">Clases</span>
          </div>
          
          <div class="pm-overview-stat">
            <span class="pm-overview-number">${sesionesCompletadas}</span>
            <span class="pm-overview-text">Registradas</span>
          </div>
          
          <div class="pm-overview-stat warning">
            <span class="pm-overview-number">${sesionesPendientes + sesionesBorrador}</span>
            <span class="pm-overview-text">Pendientes</span>
          </div>
        </section>

        <!-- Attendance Bars -->
        <section class="pm-dashboard-section">
          <h2 class="pm-section-title">Asistencia</h2>
          <div class="pm-attendance-bars">
            <div class="pm-attendance-bar-item">
              <div class="pm-attendance-bar-label">
                <span>Presentes</span>
                <span class="pm-attendance-bar-value">${totalPresentes} (${pctPresentes}%)</span>
              </div>
              <div class="pm-attendance-bar-track">
                <div class="pm-attendance-bar-fill success" style="width: ${pctPresentes}%"></div>
              </div>
            </div>
            <div class="pm-attendance-bar-item">
              <div class="pm-attendance-bar-label">
                <span>Ausentes</span>
                <span class="pm-attendance-bar-value">${totalAusentes} (${pctAusentes}%)</span>
              </div>
              <div class="pm-attendance-bar-track">
                <div class="pm-attendance-bar-fill danger" style="width: ${pctAusentes}%"></div>
              </div>
            </div>
            <div class="pm-attendance-bar-item">
              <div class="pm-attendance-bar-label">
                <span>Justificados</span>
                <span class="pm-attendance-bar-value">${totalJustificados} (${pctJustificados}%)</span>
              </div>
              <div class="pm-attendance-bar-track">
                <div class="pm-attendance-bar-fill warning" style="width: ${pctJustificados}%"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- Risk Students -->
        ${alertasRiesgo.length > 0 ? `
        <section class="pm-dashboard-section">
          <h2 class="pm-section-title">
            Alumnos en Riesgo
            <span class="pm-section-badge">${alertasRiesgo.length}</span>
          </h2>
          <div class="pm-risk-list">
            ${alertasRiesgo.slice(0, 5).map(a => `
              <div class="pm-risk-item" data-alumno="${a.alumnoId}">
                <div class="pm-risk-avatar">${(a.nombre || 'A')[0].toUpperCase()}</div>
                <div class="pm-risk-info">
                  <span class="pm-risk-name">${escHTML(a.nombre)}</span>
                  <span class="pm-risk-class">${escHTML(a.clase)}</span>
                </div>
                <span class="pm-risk-pct">${a.mensaje}</span>
              </div>
            `).join('')}
          </div>
        </section>
        ` : ''}

        <!-- Classes -->
        <section class="pm-dashboard-section">
          <h2 class="pm-section-title">Clases</h2>
          <div class="pm-classes-list" id="pm-clases-grid">
            ${clasesData.map(clase => `
            <div class="pm-class-card" data-clase-id="${clase.id}">
              <div class="pm-class-header">
                <div class="pm-class-info">
                  <span class="pm-class-name">${escHTML(clase.nombre)}</span>
                  <span class="pm-class-inst">${escHTML(clase.instrumento || '')}</span>
                </div>
                <span class="pm-class-badge ${clase.avgAttendance < 70 ? 'danger' : clase.avgAttendance < 85 ? 'warning' : 'success'}">
                  ${clase.avgAttendance}%
                </span>
              </div>
              
              <div class="pm-class-chart">
                <svg viewBox="0 0 160 36" width="100%" height="28">
                  ${clase.sessionAttendance.length > 0 
                    ? barChartSVG(clase.sessionAttendance, 100, 160, 36)
                    : '<text x="80" y="22" text-anchor="middle" font-size="9" fill="var(--pm-text-muted)">Sin datos</text>'}
                </svg>
              </div>
              
              <div class="pm-class-stats">
                <div class="pm-class-stat"><span>${clase.sesionesCompletadas}</span><small>Reg.</small></div>
                <div class="pm-class-stat"><span>${clase.sesionesPendientes}</span><small>Pen.</small></div>
                <div class="pm-class-stat"><span>${clase.totalAlumnos}</span><small>Alum.</small></div>
                <div class="pm-class-stat"><span>${clase.progress}%</span><small>Cont.</small></div>
              </div>
              
              ${clase.riskStudents.length > 0 ? `
              <div class="pm-class-risk">
                <i class="bi bi-exclamation-circle"></i>
                <span>${clase.riskStudents.length} con &lt;70%</span>
              </div>
              ` : ''}
              
              <button class="pm-class-btn" data-clase-id="${clase.id}">
                <i class="bi bi-three-dots"></i>
              </button>
            </div>
            `).join('')}
          </div>
        </section>

        <!-- Search -->
        <section class="pm-dashboard-section">
          <h2 class="pm-section-title">Buscar Alumno</h2>
          <div class="pm-search-wrapper">
            <i class="bi bi-search"></i>
            <input id="pm-alumno-search" type="text" placeholder="Nombre del alumno...">
          </div>
          <div id="pm-alumno-search-results" class="pm-search-results"></div>
        </section>
      </div>

      <style>
        .pm-dashboard {
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        /* Header */
        .pm-dashboard-header {
          background: linear-gradient(135deg, var(--pm-primary) 0%, #5856d6 100%);
          padding: 1.25rem 1rem;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .pm-dashboard-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .pm-dashboard-subtitle {
          margin: 0.125rem 0 0;
          font-size: 0.8125rem;
          opacity: 0.75;
        }
        .pm-dashboard-select {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8125rem;
          cursor: pointer;
        }
        .pm-dashboard-select option { color: #000; }

        /* Overview Stats */
        .pm-dashboard-overview {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 0.5rem;
          padding: 0.75rem;
          background: var(--pm-surface);
          margin: -0.5rem 0.75rem 0.75rem;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .pm-overview-card {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.75rem;
          border-radius: 10px;
          background: var(--pm-surface-2);
        }
        .pm-overview-card.primary {
          background: linear-gradient(135deg, rgba(52,199,89,0.1) 0%, rgba(52,199,89,0.05) 100%);
          border: 1px solid rgba(52,199,89,0.2);
        }
        .pm-overview-ring {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
        }
        .pm-circular-chart {
          display: block;
          width: 100%;
          height: 100%;
        }
        .pm-circle-bg {
          fill: none;
          stroke: var(--pm-border);
          stroke-width: 3;
        }
        .pm-circle {
          fill: none;
          stroke: var(--pm-success);
          stroke-width: 3;
          stroke-linecap: round;
          transform: rotate(-90deg);
          transform-origin: 50% 50%;
          transition: stroke-dasharray 0.5s ease;
        }
        .pm-percentage {
          fill: var(--pm-text);
          font-size: 0.5em;
          text-anchor: middle;
          font-weight: 600;
        }
        .pm-overview-info { display: flex; flex-direction: column; }
        .pm-overview-label { font-size: 0.75rem; font-weight: 600; color: var(--pm-text); }
        .pm-overview-detail { font-size: 0.6875rem; color: var(--pm-text-muted); }
        
        .pm-overview-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          border-radius: 10px;
          background: var(--pm-surface-2);
        }
        .pm-overview-number {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--pm-text);
          line-height: 1;
        }
        .pm-overview-text {
          font-size: 0.625rem;
          color: var(--pm-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.03em;
          margin-top: 0.125rem;
        }
        .pm-overview-stat.warning .pm-overview-number { color: var(--pm-warning); }

        /* Sections */
        .pm-dashboard-section {
          padding: 0.75rem 1rem;
        }
        .pm-section-title {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--pm-text);
          margin: 0 0 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .pm-section-badge {
          background: var(--pm-danger);
          color: white;
          font-size: 0.6875rem;
          font-weight: 600;
          padding: 0.125rem 0.5rem;
          border-radius: 6px;
          margin-left: auto;
        }

        /* Attendance Bars */
        .pm-attendance-bars { display: flex; flex-direction: column; gap: 0.625rem; }
        .pm-attendance-bar-item { display: flex; flex-direction: column; gap: 0.25rem; }
        .pm-attendance-bar-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.8125rem;
        }
        .pm-attendance-bar-label span:first-child { color: var(--pm-text); }
        .pm-attendance-bar-value { color: var(--pm-text-muted); font-size: 0.75rem; }
        .pm-attendance-bar-track {
          height: 6px;
          background: var(--pm-border);
          border-radius: 3px;
          overflow: hidden;
        }
        .pm-attendance-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.4s ease;
        }
        .pm-attendance-bar-fill.success { background: var(--pm-success); }
        .pm-attendance-bar-fill.danger { background: var(--pm-danger); }
        .pm-attendance-bar-fill.warning { background: var(--pm-warning); }

        /* Risk List */
        .pm-risk-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .pm-risk-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0.75rem;
          background: var(--pm-surface);
          border-radius: 10px;
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .pm-risk-item:active { transform: scale(0.99); }
        .pm-risk-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--pm-danger) 0%, #ff6b6b 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
        }
        .pm-risk-info { flex: 1; min-width: 0; }
        .pm-risk-name {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--pm-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pm-risk-class {
          font-size: 0.6875rem;
          color: var(--pm-text-muted);
        }
        .pm-risk-pct {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--pm-danger);
          background: var(--pm-danger-bg);
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
        }

        /* Classes */
        .pm-classes-list { display: flex; flex-direction: column; gap: 0.625rem; }
        .pm-class-card {
          background: var(--pm-surface);
          border-radius: 12px;
          padding: 0.875rem;
          position: relative;
        }
        .pm-class-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }
        .pm-class-name {
          display: block;
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--pm-text);
        }
        .pm-class-inst {
          font-size: 0.6875rem;
          color: var(--pm-text-muted);
        }
        .pm-class-badge {
          font-size: 0.875rem;
          font-weight: 700;
          padding: 0.25rem 0.625rem;
          border-radius: 8px;
        }
        .pm-class-badge.success { background: var(--pm-success-bg); color: var(--pm-success); }
        .pm-class-badge.warning { background: var(--pm-warning-bg); color: var(--pm-warning); }
        .pm-class-badge.danger { background: var(--pm-danger-bg); color: var(--pm-danger); }
        
        .pm-class-chart {
          margin: 0.375rem 0;
          height: 28px;
        }
        
        .pm-class-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.25rem;
          padding-top: 0.625rem;
          border-top: 1px solid var(--pm-border);
        }
        .pm-class-stat {
          text-align: center;
          padding: 0.25rem;
        }
        .pm-class-stat span {
          display: block;
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--pm-text);
        }
        .pm-class-stat small {
          font-size: 0.5625rem;
          color: var(--pm-text-muted);
          text-transform: uppercase;
        }
        
        .pm-class-risk {
          margin-top: 0.5rem;
          padding: 0.375rem 0.625rem;
          background: var(--pm-danger-bg);
          border-radius: 6px;
          font-size: 0.6875rem;
          color: var(--pm-danger);
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }
        
        .pm-class-btn {
          position: absolute;
          top: 0.625rem;
          right: 0.625rem;
          background: none;
          border: none;
          padding: 0.25rem;
          color: var(--pm-text-muted);
          cursor: pointer;
        }

        /* Search */
        .pm-search-wrapper {
          position: relative;
          margin-bottom: 0.5rem;
        }
        .pm-search-wrapper i {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--pm-text-muted);
          font-size: 0.875rem;
        }
        .pm-search-wrapper input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.25rem;
          border: 1px solid var(--pm-border);
          border-radius: 10px;
          font-size: 0.875rem;
          background: var(--pm-surface);
          color: var(--pm-text);
          outline: none;
          transition: border-color 0.2s;
        }
        .pm-search-wrapper input:focus {
          border-color: var(--pm-primary);
        }
        .pm-search-wrapper input::placeholder {
          color: var(--pm-text-muted);
        }
        .pm-search-results {
          display: none;
          background: var(--pm-surface);
          border-radius: 10px;
          overflow: hidden;
        }
        .pm-search-results.show { display: block; }
        
        /* Responsive */
        @media (max-width: 600px) {
          .pm-dashboard-overview {
            grid-template-columns: 1fr 1fr;
          }
          .pm-overview-card.primary {
            grid-column: span 2;
          }
        }
      </style>
    `

// ── Event: Risk alerts → go to student profile ─────────────
    container.querySelectorAll('.pm-risk-item').forEach(item => {
      item.addEventListener('click', () => {
        window.location.hash = `#/alumno?id=${item.dataset.alumno}`
      })
    })

    // ── Event: Class card → expand with student list ────────────
    container.querySelectorAll('.pm-class-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation()
        const card = btn.closest('.pm-class-card')
        const existing = card.querySelector('.pm-clase-students-panel')
        if (existing) { existing.remove(); return }

        const claseId = btn.dataset.claseId
        const claseData = clasesData.find(c => c.id === claseId)
        const alumnos = inscripcionesPorClase[claseId] || []
        const sesionesClase = sesiones.filter(s => s.clase_id === claseId)

        // Enrich with attendance data
        const alumnosConDatos = await Promise.all(alumnos.map(async alum => {
          const alumSes = sesionesClase
            .filter(s => s.asistencia?.some(a => a.alumno_id === alum.id))
            .map(s => s.asistencia.find(a => a.alumno_id === alum.id))
          const pres = alumSes.filter(a => a?.estado === 'P').length
          const tot = alumSes.length
          const pct = tot > 0 ? Math.round((pres / tot) * 100) : 0
          const lastSession = sesionesClase
            .filter(s => s.asistencia?.some(a => a.alumno_id === alum.id))
            .sort((a, b) => b.fecha.localeCompare(a.fecha))[0]
          return { ...alum, pct, total: tot, lastFecha: lastSession?.fecha }
        }))

        alumnosConDatos.sort((a, b) => a.pct - b.pct)

        const panel = document.createElement('div')
        panel.className = 'pm-clase-students-panel'
        panel.innerHTML = `
          <div class="pm-clase-students-header">
            <span>Alumnos (${alumnosConDatos.length})</span>
            <button class="pm-clase-students-close"><i class="bi bi-x"></i></button>
          </div>
          <div class="pm-clase-students-list">
            ${alumnosConDatos.map(alum => `
              <div class="pm-clase-student-row" data-alumno="${alum.id}">
                <div class="pm-student-info">
                  <span class="pm-student-nombre">${escHTML(alum.nombre_completo)}</span>
                  <span class="pm-student-meta">
                    ${alum.total} sesiones · última: ${alum.lastFecha ? new Date(alum.lastFecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : '—'}
                  </span>
                </div>
                <div class="pm-student-attendance
                  ${alum.pct < 70 ? 'danger' : alum.pct < 85 ? 'warning' : 'success'}">
                  <span>${alum.pct}%</span>
                  <div class="pm-student-att-bar"><div class="pm-student-att-fill" style="width:${alum.pct}%"></div></div>
                </div>
              </div>
            `).join('')}
          </div>
        `
        card.appendChild(panel)

        panel.querySelector('.pm-clase-students-close').addEventListener('click', () => panel.remove())
        panel.querySelectorAll('.pm-clase-student-row').forEach(row => {
          row.addEventListener('click', () => {
            window.location.hash = `#/alumno?id=${row.dataset.alumno}`
          })
        })
      })
    })

    // ── Event: Student search ────────────────────────────────────
    const searchInput = container.querySelector('#pm-alumno-search')
    const searchResults = container.querySelector('#pm-alumno-search-results')
    let searchTimer = null

    searchInput?.addEventListener('input', () => {
      clearTimeout(searchTimer)
      const q = searchInput.value.trim()
      if (!q) { searchResults.style.display = 'none'; return }
      searchTimer = setTimeout(async () => {
        try {
          // Search only in teacher's classes
          const { data: alumnos } = await supabase
            .from('alumnos')
            .select('id, nombre_completo, instrumento_principal')
            .ilike('nombre_completo', `%${q}%`)
            .limit(10)

          if (!alumnos?.length) {
            searchResults.innerHTML = `<p class="pm-empty" style="padding:0.75rem 1rem;">Sin resultados.</p>`
            searchResults.style.display = 'block'
            return
          }

          searchResults.innerHTML = alumnos.map(a => `
            <div class="pm-search-result-item" data-id="${a.id}">
              <div class="pm-search-result-avatar">
                <i class="bi bi-person-fill"></i>
              </div>
              <div class="pm-search-result-info">
                <span class="pm-search-result-name">${escHTML(a.nombre_completo)}</span>
                <span class="pm-search-result-meta">${escHTML(a.instrumento_principal || '—')}</span>
              </div>
              <i class="bi bi-chevron-right pm-search-result-arrow"></i>
            </div>
          `).join('')
          searchResults.style.display = 'block'

          searchResults.querySelectorAll('.pm-search-result-item').forEach(row => {
            row.addEventListener('click', () => {
              window.location.hash = `#/alumno?id=${row.dataset.id}`
            })
          })
        } catch {
          searchResults.innerHTML = `<p class="pm-empty" style="color:var(--pm-danger);padding:0.75rem 1rem;">Error.</p>`
          searchResults.style.display = 'block'
        }
      }, 300)
    })

    document.addEventListener('click', (e) => {
      if (!searchInput?.contains(e.target) && !searchResults?.contains(e.target)) {
        searchResults.style.display = 'none'
      }
    })

  } catch (err) {
    container.innerHTML = `
      <div class="pm-empty" style="padding:3rem 1rem;text-align:center;">
        <p style="color:var(--pm-danger);">Error al cargar métricas</p>
        <p style="font-size:0.85rem;color:var(--pm-text-muted);">${escHTML(err.message)}</p>
      </div>
    `
  }
}
