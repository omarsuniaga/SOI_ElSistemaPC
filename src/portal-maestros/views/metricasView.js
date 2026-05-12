import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { escHTML } from '../utils/portalUtils.js'
import { getMisClases, getSesiones } from '../services/maestroDataService.js'

// ── Mini SVG chart helpers ───────────────────────────────────

function donutSVG(pct, color = 'var(--pm-primary)', size = 72) {
  const r = (size / 2) - 6
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  const cx = size / 2, cy = size / 2
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--pm-border)" stroke-width="5"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="5"
        stroke-dasharray="${dash} ${circ}"
        stroke-linecap="round"
        transform="rotate(-90 ${cx} ${cy})"/>
    </svg>`
}

function barChartSVG(data, maxVal, width = 200, height = 60) {
  const barW = Math.max(8, Math.min(24, (width - (data.length - 1) * 4) / data.length))
  const gap = (width - barW * data.length) / (data.length + 1)
  return data.map((v, i) => {
    const barH = maxVal > 0 ? Math.max(4, (v / maxVal) * (height - 8)) : 4
    const x = gap + i * (barW + gap)
    const y = height - barH - 4
    return `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="3"
      fill="var(--pm-primary)" opacity="${0.4 + (v / maxVal) * 0.6}"/>`
  }).join('') + `<text x="${width / 2}" y="${height}" text-anchor="middle"
    font-size="9" fill="var(--pm-text-muted)">Últimas ${data.length} sesiones</text>`
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
    container.innerHTML = `
      <div class="pm-metricas-root" style="padding: 1rem 1rem 2rem;">

        <!-- ── Filter bar ──────────────────────────────────────── -->
        <div class="pm-metricas-filters">
          <div class="pm-metricas-filter-group">
            <label class="pm-metricas-filter-label">Clase</label>
            <select id="pm-filter-clase" class="pm-metricas-select">
              <option value="">Todas las clases</option>
              ${clases.map(c => `<option value="${c.id}">${escHTML(c.nombre)}</option>`).join('')}
            </select>
          </div>
          <div class="pm-metricas-filter-group">
            <label class="pm-metricas-filter-label">Período</label>
            <select id="pm-filter-periodo" class="pm-metricas-select">
              <option value="4">Últimas 4 semanas</option>
              <option value="8">Últimas 8 semanas</option>
              <option value="12">Últimas 12 semanas</option>
            </select>
          </div>
          <button id="pm-filter-refresh" class="pm-metricas-refresh-btn" title="Actualizar">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
        </div>

        <!-- ── Global KPI Cards ─────────────────────────────────── -->
        <div class="pm-metricas-kpis">
          <div class="pm-metricas-kpi">
            <div class="pm-kpi-chart">${donutSVG(asistenciaPromedio, 'var(--pm-success)')}</div>
            <span class="pm-kpi-value">${asistenciaPromedio}%</span>
            <span class="pm-kpi-label">Asistencia global</span>
          </div>
          <div class="pm-metricas-kpi">
            <span class="pm-kpi-value">${totalClases}</span>
            <span class="pm-kpi-label">Clases asignadas</span>
          </div>
          <div class="pm-metricas-kpi">
            <span class="pm-kpi-value">${sesionesCompletadas}</span>
            <span class="pm-kpi-label">Sesiones registradas</span>
          </div>
          <div class="pm-metricas-kpi">
            <span class="pm-kpi-value">${sesionesPendientes + sesionesBorrador}</span>
            <span class="pm-kpi-label">Pendientes / Borrador</span>
          </div>
          <div class="pm-metricas-kpi">
            <span class="pm-kpi-value">${totalPresentes}</span>
            <span class="pm-kpi-label">Presentes</span>
          </div>
          <div class="pm-metricas-kpi pm-kpi-warning">
            <span class="pm-kpi-value">${totalAusentes}</span>
            <span class="pm-kpi-label">Ausentes</span>
          </div>
        </div>

        <!-- ── Risk Alerts ──────────────────────────────────────── -->
        ${alertasRiesgo.length > 0 ? `
          <div class="pm-alertas-riesgo">
            <div class="pm-alertas-header">
              <i class="bi bi-exclamation-triangle-fill"></i>
              <span>Alertas (${alertasRiesgo.length})</span>
            </div>
            <div class="pm-alertas-list pm-alertas-scroll">
              ${alertasRiesgo.slice(0, 10).map(a => `
                <div class="pm-alerta-item" data-alumno="${a.alumnoId}" data-clase="${escHTML(a.clase)}">
                  <div class="pm-alerta-icon warning">
                    <i class="bi bi-graph-down"></i>
                  </div>
                  <div class="pm-alerta-content">
                    <span class="pm-alerta-nombre">${escHTML(a.nombre)}</span>
                    <span class="pm-alerta-clase">${escHTML(a.clase)}</span>
                  </div>
                  <span class="pm-alerta-badge warning">${a.mensaje}</span>
                </div>
              `).join('')}
              ${alertasRiesgo.length > 10 ? `<p class="pm-alerta-more">+${alertasRiesgo.length - 10} más alertas</p>` : ''}
            </div>
          </div>
        ` : ''}

        <!-- ── Attendance Donut Breakdown ──────────────────────── -->
        <div class="pm-metricas-attendance-breakdown">
          <h3 class="pm-metricas-section-title">Asistencia — Últimas 4 Semanas</h3>
          <div class="pm-metricas-breakdown-cards">
            <div class="pm-breakdown-card pm-breakdown-present">
              <div class="pm-breakdown-icon"><i class="bi bi-check-circle-fill"></i></div>
              <div class="pm-breakdown-info">
                <span class="pm-breakdown-value">${totalPresentes}</span>
                <span class="pm-breakdown-label">Presentes</span>
                <div class="pm-breakdown-bar"><div class="pm-breakdown-fill" style="width:${totalRegistros > 0 ? Math.round((totalPresentes/totalRegistros)*100) : 0}%"></div></div>
              </div>
            </div>
            <div class="pm-breakdown-card pm-breakdown-absent">
              <div class="pm-breakdown-icon"><i class="bi bi-x-circle-fill"></i></div>
              <div class="pm-breakdown-info">
                <span class="pm-breakdown-value">${totalAusentes}</span>
                <span class="pm-breakdown-label">Ausentes</span>
                <div class="pm-breakdown-bar"><div class="pm-breakdown-fill" style="width:${totalRegistros > 0 ? Math.round((totalAusentes/totalRegistros)*100) : 0}%"></div></div>
              </div>
            </div>
            <div class="pm-breakdown-card pm-breakdown-justified">
              <div class="pm-breakdown-icon"><i class="bi bi-patch-check-fill"></i></div>
              <div class="pm-breakdown-info">
                <span class="pm-breakdown-value">${totalJustificados}</span>
                <span class="pm-breakdown-label">Justificados</span>
                <div class="pm-breakdown-bar"><div class="pm-breakdown-fill" style="width:${totalRegistros > 0 ? Math.round((totalJustificados/totalRegistros)*100) : 0}%"></div></div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Per-Class Cards ────────────────────────────────────── -->
        <h3 class="pm-metricas-section-title">Rendimiento por Clase</h3>
        <div class="pm-metricas-clases" id="pm-clases-grid">
          ${clasesData.map(clase => `
            <div class="pm-metricas-clase-card" data-clase-id="${clase.id}">
              <div class="pm-clase-header">
                <div class="pm-clase-title-group">
                  <span class="pm-clase-nombre">${escHTML(clase.nombre)}</span>
                  <span class="pm-clase-instrumento">${escHTML(clase.instrumento || '—')}</span>
                </div>
                <div class="pm-clase-attendance-badge
                  ${clase.avgAttendance < 70 ? 'danger' : clase.avgAttendance < 85 ? 'warning' : 'success'}">
                  ${clase.avgAttendance}%
                </div>
              </div>

              <!-- Mini bar chart -->
              <div class="pm-clase-chart">
                <svg viewBox="0 0 200 70" width="100%" height="60">
                  ${clase.sessionAttendance.length > 0
                    ? barChartSVG(clase.sessionAttendance, 100, 200, 60)
                    : '<text x="100" y="40" text-anchor="middle" font-size="11" fill="var(--pm-text-muted)">Sin datos</text>'}
                </svg>
              </div>

              <!-- Stats row -->
              <div class="pm-clase-stats-row">
                <div class="pm-clase-stat">
                  <span class="pm-clase-stat-value">${clase.sesionesCompletadas}</span>
                  <span class="pm-clase-stat-label">Registradas</span>
                </div>
                <div class="pm-clase-stat">
                  <span class="pm-clase-stat-value">${clase.sesionesPendientes}</span>
                  <span class="pm-clase-stat-label">Pendientes</span>
                </div>
                <div class="pm-clase-stat">
                  <span class="pm-clase-stat-value">${clase.totalAlumnos}</span>
                  <span class="pm-clase-stat-label">Alumnos</span>
                </div>
                <div class="pm-clase-stat">
                  <span class="pm-clase-stat-value">${clase.progress}%</span>
                  <span class="pm-clase-stat-label">Contenido</span>
                </div>
              </div>

              <!-- Progress bar -->
              <div class="pm-clase-progress">
                <div class="pm-clase-progress-track">
                  <div class="pm-clase-progress-fill" style="width:${clase.progress}%"></div>
                </div>
              </div>

              <!-- Risk students -->
              ${clase.riskStudents.length > 0 ? `
                <div class="pm-clase-risk-section">
                  <i class="bi bi-exclamation-triangle"></i>
                  <span>${clase.riskStudents.length} alumno${clase.riskStudents.length > 1 ? 's' : ''} con asistencia baja</span>
                  <div class="pm-clase-risk-list">
                    ${clase.riskStudents.slice(0, 3).map(a => `
                      <div class="pm-clase-risk-item" data-alumno="${a.id}">
                        <span>${escHTML(a.nombre.split(' ')[0])}</span>
                        <span class="pm-clase-risk-pct">${a.pct}%</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Actions -->
              <div class="pm-clase-actions">
                <button class="pm-clase-btn-dots" data-clase-id="${clase.id}" title="Ver más">
                  <i class="bi bi-three-dots"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- ── Student quick search ────────────────────────────────── -->
        <h3 class="pm-metricas-section-title">Buscar Alumno</h3>
        <div class="pm-metricas-search-section">
          <div class="pm-search-wrapper">
            <i class="bi bi-search pm-search-icon"></i>
            <input
              id="pm-alumno-search"
              type="search"
              class="pm-input pm-search-input"
              placeholder="Buscar alumno por nombre..."
              autocomplete="off"
            />
          </div>
          <div id="pm-alumno-search-results" class="pm-search-results" style="display:none;"></div>
        </div>

      </div>
    `

    // ── Event: Risk alerts → go to student profile ─────────────
    container.querySelectorAll('.pm-alerta-item').forEach(item => {
      item.addEventListener('click', () => {
        window.location.hash = `#/alumno?id=${item.dataset.alumno}`
      })
    })

    // ── Event: Class risk students → go to profile ─────────────
    container.querySelectorAll('.pm-clase-risk-item').forEach(item => {
      item.addEventListener('click', () => {
        window.location.hash = `#/alumno?id=${item.dataset.alumno}`
      })
    })

    // ── Event: Class card → expand with student list ────────────
    container.querySelectorAll('.pm-clase-btn-dots').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation()
        const card = btn.closest('.pm-metricas-clase-card')
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
