import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { escHTML } from '../utils/portalUtils.js'
import { getMisClases, getSesiones } from '../services/maestroDataService.js'

export async function renderMetricasView(container) {
  container.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`

  const maestro = getMaestroLocal()
  if (!maestro) {
    container.innerHTML = `<p class="pm-empty">No hay sesión activa.</p>`
    return
  }

  try {
    // Obtener clases del maestro (con cache)
    const clases = await getMisClases()
    clases.sort((a, b) => a.nombre.localeCompare(b.nombre))

    // Obtener sesiones de las últimas 4 semanas (con cache)
    const hace4Semanas = new Date()
    hace4Semanas.setDate(hace4Semanas.getDate() - 28)
    const fecha4SemanasAtras = hace4Semanas.toISOString().split('T')[0]
    const hoy = new Date().toISOString().split('T')[0]

    const todasSesiones = await getSesiones(maestro.id, fecha4SemanasAtras, hoy)

    // Filtrar en JS para evitar 400
    const sesiones = todasSesiones.filter(s => s.estado === 'registrada' || s.estado === 'pendiente' || s.borrador === false || s.borrador === true)

    // Calcular métricas
    const totalClases = clases?.length || 0
    const sesionesCompletadas = sesiones?.filter(s => s.estado === 'registrada').length || 0
    const sesionesPendientes = sesiones?.filter(s => s.estado === 'pendiente').length || 0

    // Calcular asistencia promedio real
    let totalPresentes = 0
    let totalRegistros = 0
    ;(sesiones || []).forEach(s => {
      if (s.asistencia?.length) {
        s.asistencia.forEach(a => {
          totalRegistros++
          if (a.estado === 'P') totalPresentes++
        })
      }
    })
    const asistenciaPromedio = totalRegistros > 0 ? Math.round((totalPresentes / totalRegistros) * 100) : 0

    // === ALERTAS DE RIESGO ===
    const alertasRiesgo = []

    // OPTIMIZACIÓN: Una sola consulta para todas las inscripciones
    const claseIds = (clases || []).map(c => c.id)
    const { data: todasInscripciones } = await supabase
      .from('alumnos_clases')
      .select('clase_id, alumno:alumnos(id, nombre_completo)')
      .in('clase_id', claseIds)
      .eq('activo', true)

    // Agrupar inscripciones por clase
    const inscripcionesPorClase = {}
    for (const ins of todasInscripciones || []) {
      if (!ins.clase_id || !ins.alumno) continue
      if (!inscripcionesPorClase[ins.clase_id]) {
        inscripcionesPorClase[ins.clase_id] = []
      }
      inscripcionesPorClase[ins.clase_id].push(ins.alumno)
    }

    // Por cada clase, calcular asistencia por alumno (todo en memoria ahora)
    for (const clase of clases || []) {
      const sesionesClase = sesiones?.filter(s => s.clase_id === clase.id) || []
      const alumnosClase = inscripcionesPorClase[clase.id] || []

      for (const alum of alumnosClase) {
        // Obtener historial de asistencia del alumno en esta clase
        const asistenciaAlum = sesionesClase
          .filter(s => s.asistencia?.some(a => a.alumno_id === alum.id))
          .map(s => {
            const reg = s.asistencia.find(a => a.alumno_id === alum.id)
            return { fecha: s.fecha, estado: reg?.estado }
          })
          .sort((a, b) => a.fecha.localeCompare(b.fecha))

        if (asistenciaAlum.length < 2) continue

        const presentes = asistenciaAlum.filter(a => a.estado === 'P').length
        const pctAsistencia = Math.round((presentes / asistenciaAlum.length) * 100)

        // Check: <70% asistencia
        if (pctAsistencia < 70) {
          alertasRiesgo.push({
            tipo: 'baja_asistencia',
            alumnoId: alum.id,
            nombre: alum.nombre_completo,
            clase: clase.nombre,
            valor: pctAsistencia,
            mensaje: `${pctAsistencia}% de asistencia`
          })
        }

        // Check: 3+ ausencias consecutivas
        let ausenciasConsecutivas = 0
        let maxAusenciasConsecutivas = 0
        for (let i = asistenciaAlum.length - 1; i >= 0; i--) {
          if (asistenciaAlum[i].estado === 'A') {
            ausenciasConsecutivas++
            maxAusenciasConsecutivas = Math.max(maxAusenciasConsecutivas, ausenciasConsecutivas)
          } else {
            ausenciasConsecutivas = 0
          }
        }
        if (maxAusenciasConsecutivas >= 3) {
          alertasRiesgo.push({
            tipo: 'ausencias_consecutivas',
            alumnoId: alum.id,
            nombre: alum.nombre_completo,
            clase: clase.nombre,
            valor: maxAusenciasConsecutivas,
            mensaje: `${maxAusenciasConsecutivas} ausencias seguidas`
          })
        }
      }
    }

    container.innerHTML = `
      <div class="pm-metricas-root">
        <h2 class="pm-metricas-title">
          <i class="bi bi-bar-chart-line"></i> Mis Métricas
        </h2>
        <p class="pm-metricas-subtitle">Resumen de las últimas 4 semanas</p>

        ${alertasRiesgo.length > 0 ? `
          <div class="pm-alertas-riesgo">
            <div class="pm-alertas-header">
              <i class="bi bi-exclamation-triangle-fill"></i>
              <span>Alertas de Riesgo (${alertasRiesgo.length})</span>
            </div>
            <div class="pm-alertas-list">
              ${alertasRiesgo.map(a => `
                <div class="pm-alerta-item" data-alumno="${a.alumnoId}" data-clase="${escHTML(a.clase)}">
                  <div class="pm-alerta-icon ${a.tipo === 'ausencias_consecutivas' ? 'danger' : 'warning'}">
                    <i class="bi ${a.tipo === 'ausencias_consecutivas' ? 'bi-person-x' : 'bi-graph-down'}"></i>
                  </div>
                  <div class="pm-alerta-content">
                    <span class="pm-alerta-nombre">${escHTML(a.nombre)}</span>
                    <span class="pm-alerta-clase">${escHTML(a.clase)}</span>
                  </div>
                  <span class="pm-alerta-badge ${a.tipo === 'ausencias_consecutivas' ? 'danger' : 'warning'}">${a.mensaje}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Buscar alumno -->
        <div class="pm-metricas-search-section" style="margin-bottom:1.5rem;">
          <label class="pm-label" for="pm-alumno-search">Buscar alumno</label>
          <input
            id="pm-alumno-search"
            type="search"
            class="pm-input"
            placeholder="Escribí el nombre del alumno…"
            autocomplete="off"
            style="width:100%;margin-top:0.3rem;"
          />
          <div id="pm-alumno-search-results" class="pm-search-results" style="display:none;"></div>
        </div>

        <!-- KPIs -->
        <div class="pm-metricas-kpis">
          <div class="pm-metricas-kpi">
            <span class="pm-kpi-value">${totalClases}</span>
            <span class="pm-kpi-label">Clases asignadas</span>
          </div>
          <div class="pm-metricas-kpi">
            <span class="pm-kpi-value">${sesionesCompletadas}</span>
            <span class="pm-kpi-label">Sesiones registradas</span>
          </div>
          <div class="pm-metricas-kpi">
            <span class="pm-kpi-value">${asistenciaPromedio}%</span>
            <span class="pm-kpi-label">Asistencia promedio</span>
          </div>
        </div>

        <!-- Por clase -->
        <h3 class="pm-metricas-section-title">Por Clase</h3>
        <div class="pm-metricas-clases">
          ${clases?.length ? clases.map(clase => {
            const sesionesClase = sesiones?.filter(s => s.clase_id === clase.id) || []
            const completadas = sesionesClase.filter(s => s.estado === 'registrada').length
            return `
              <div class="pm-metricas-clase-card">
                <div class="pm-clase-info">
                  <span class="pm-clase-nombre">${escHTML(clase.nombre)}</span>
                  <span class="pm-clase-instrumento">${escHTML(clase.instrumento || '—')}</span>
                </div>
                <div class="pm-clase-stats">
                  <span class="pm-stat">${completadas} sesiones</span>
                </div>
              </div>
            `
          }).join('') : '<p class="pm-empty">No tenés clases asignadas.</p>'}
        </div>

        <!-- Accesos rápidos -->
        <h3 class="pm-metricas-section-title">Accesos Rápidos</h3>
        <div class="pm-metricas-links">
          <a href="#/hoy" class="pm-metricas-link">
            <i class="bi bi-house-door"></i> Ver clases de hoy
          </a>
          <a href="#/calendario" class="pm-metricas-link">
            <i class="bi bi-calendar3"></i> Ver calendario
          </a>
          <a href="#/perfil" class="pm-metricas-link">
            <i class="bi bi-person"></i> Mi perfil
          </a>
          <a href="#/gamificacion" class="pm-metricas-link">
            <i class="bi bi-controller"></i> Progreso y logros
          </a>
        </div>
      </div>
    `

    // Agregar eventos a las alertas
    container.querySelectorAll('.pm-alerta-item').forEach(item => {
      item.onclick = () => {
        const alumId = item.dataset.alumno
        window.location.hash = `#/alumno?id=${alumId}`
      }
    })

    // Buscar alumno — debounced
    const searchInput = container.querySelector('#pm-alumno-search')
    const searchResults = container.querySelector('#pm-alumno-search-results')
    let searchTimer = null

    searchInput?.addEventListener('input', () => {
      clearTimeout(searchTimer)
      const q = searchInput.value.trim()
      if (!q) {
        searchResults.style.display = 'none'
        searchResults.innerHTML = ''
        return
      }
      searchTimer = setTimeout(async () => {
        try {
          const { data: alumnos } = await supabase
            .from('alumnos')
            .select('id, nombre_completo')
            .ilike('nombre_completo', `%${q}%`)
            .limit(10)

          if (!alumnos || alumnos.length === 0) {
            searchResults.innerHTML = `<p class="pm-empty" style="padding:0.5rem 1rem;margin:0;">Sin resultados.</p>`
            searchResults.style.display = 'block'
            return
          }

          searchResults.innerHTML = alumnos.map(a => `
            <div class="pm-search-result-item" data-id="${a.id}" style="padding:0.6rem 1rem;cursor:pointer;display:flex;align-items:center;gap:0.5rem;border-bottom:1px solid var(--pm-border,#eee);">
              👤 <span>${escHTML(a.nombre_completo)}</span>
            </div>
          `).join('')
          searchResults.style.display = 'block'

          searchResults.querySelectorAll('.pm-search-result-item').forEach(row => {
            row.addEventListener('click', () => {
              window.location.hash = `#/alumno?id=${row.dataset.id}`
            })
          })
        } catch (_err) {
          searchResults.innerHTML = `<p class="pm-empty" style="padding:0.5rem 1rem;margin:0;color:var(--pm-danger);">Error al buscar.</p>`
          searchResults.style.display = 'block'
        }
      }, 300)
    })

    // Cerrar resultados al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!searchInput?.contains(e.target) && !searchResults?.contains(e.target)) {
        searchResults.style.display = 'none'
      }
    }, { once: false })

  } catch (err) {
    container.innerHTML = `
      <div class="pm-empty" style="padding:3rem 1rem;text-align:center;">
        <p style="color:var(--pm-danger);">Error al cargar métricas</p>
        <p style="font-size:0.85rem;color:var(--pm-text-muted);">${escHTML(err.message)}</p>
      </div>
    `
  }
}