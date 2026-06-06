import { supabase } from '../../../lib/supabaseClient.js'
import { router } from '../../../core/router/router.js'
import { THRESHOLDS } from '../../progresos/services/riskRules.js'
import { HelpPanel } from '../../../shared/components/HelpPanel.js'

export async function renderDashboardPedagogicoView(container) {
  if (!container) return
  container.innerHTML = _renderSkeleton()

  try {
    const [kpis, riesgo] = await Promise.all([
      _fetchKPIs(),
      _fetchAlumnosEnRiesgo(),
    ])
    container.innerHTML = _renderContent(kpis, riesgo)
    _attachEvents(container)
    _loadEmergentes(container)
  } catch (err) {
    console.error('[DashboardPedagogico]', err)
    container.innerHTML = `
      <div class="page-container">
        <div class="alert alert-warning">Error al cargar el dashboard: ${err.message}</div>
      </div>`
  }
}

async function _fetchKPIs() {
  const [alumnos, planes, clases, asistencias] = await Promise.all([
    supabase.from('alumnos').select('id', { count: 'exact' }).eq('activo', true),
    supabase.from('planificaciones').select('id, estado').gte(
      'fecha_inicio', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    ),
    supabase.from('clases').select('id', { count: 'exact' }).eq('estado', 'activa'),
    supabase.from('asistencias').select('estado').gte(
      'fecha', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    ),
  ])

  const totalAsistencias = asistencias.data?.length || 0
  const presentes = asistencias.data?.filter(a => a.estado === 'P').length || 0
  const tasaAsistencia = totalAsistencias > 0 ? Math.round((presentes / totalAsistencias) * 100) : null

  const planesEjecutados = planes.data?.filter(p => p.estado === 'ejecutado').length || 0
  const planesPlanificados = planes.data?.filter(p => p.estado === 'planificado').length || 0

  return {
    alumnosActivos: alumnos.count || 0,
    clasesActivas: clases.count || 0,
    planesEstaSemana: planes.data?.length || 0,
    planesEjecutados,
    planesPlanificados,
    tasaAsistencia,
  }
}

async function _fetchAlumnosEnRiesgo() {
  const desde = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const { data: asistencias } = await supabase
    .from('asistencias')
    .select('alumno_id, estado')
    .gte('fecha', desde)

  if (!asistencias?.length) return []

  const porAlumno = {}
  asistencias.forEach(a => {
    if (!porAlumno[a.alumno_id]) porAlumno[a.alumno_id] = { total: 0, presentes: 0 }
    porAlumno[a.alumno_id].total++
    if (a.estado === 'P') porAlumno[a.alumno_id].presentes++
  })

  const enRiesgo = Object.entries(porAlumno)
    .filter(([, v]) => v.total >= 4 && (v.presentes / v.total) < THRESHOLDS.attendance_min_rate)
    .map(([id]) => id)

  if (!enRiesgo.length) return []

  const { data: alumnos } = await supabase
    .from('alumnos')
    .select('id, nombre_completo')
    .in('id', enRiesgo.slice(0, 5))

  return alumnos || []
}

function _renderSkeleton() {
  return `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-grid-1x2 fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Dashboard Pedagógico</h1>
          <p class="text-muted small mb-0">Resumen del estado académico</p>
        </div>
        <button class="btn-help-trigger" id="btn-help-dashboard" title="¿Cómo funciona esta pantalla?" aria-label="Ayuda">
          <i class="bi bi-question"></i>
        </button>
      </div>
      <div class="row g-3">
        ${[1,2,3,4].map(() => `
          <div class="col-6 col-md-3">
            <div class="card border-0 shadow-sm" style="height:100px;">
              <div class="card-body d-flex align-items-center justify-content-center">
                <div class="spinner-border spinner-border-sm text-primary"></div>
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>`
}

function _renderContent(kpis, alumnosRiesgo) {
  const asistenciaColor = kpis.tasaAsistencia === null ? 'secondary'
    : kpis.tasaAsistencia >= 80 ? 'success'
    : kpis.tasaAsistencia >= 60 ? 'warning' : 'danger'

  return `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-grid-1x2 fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Dashboard Pedagógico</h1>
          <p class="text-muted small mb-0">Resumen del estado académico</p>
        </div>
        <button class="btn-help-trigger" id="btn-help-dashboard" title="¿Cómo funciona esta pantalla?" aria-label="Ayuda">
          <i class="bi bi-question"></i>
        </button>
      </div>

      <div class="row g-3 mb-4">
        ${_kpiCard('bi-people-fill', 'Alumnos activos', kpis.alumnosActivos, 'primary', null)}
        ${_kpiCard('bi-easel2', 'Clases activas', kpis.clasesActivas, 'indigo', null)}
        ${_kpiCard('bi-journal-text', 'Planes esta semana', kpis.planesEstaSemana,
          'success', `${kpis.planesEjecutados} ejecutados · ${kpis.planesPlanificados} pendientes`)}
        ${_kpiCard('bi-calendar-check', 'Asistencia (7 días)',
          kpis.tasaAsistencia !== null ? kpis.tasaAsistencia + '%' : '—',
          asistenciaColor, null)}
      </div>

      ${alumnosRiesgo.length ? `
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-danger-subtle border-0 d-flex align-items-center justify-content-between">
          <span class="fw-semibold text-danger" style="font-size:0.9rem;">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            Alumnos con asistencia baja (últimas 4 semanas)
          </span>
          <button class="btn btn-sm btn-outline-danger" data-nav="pedagogico-seguimiento">Ver todos</button>
        </div>
        <div class="card-body p-0">
          <ul class="list-group list-group-flush">
            ${alumnosRiesgo.map(a => `
              <li class="list-group-item d-flex align-items-center gap-3 py-2">
                <div class="rounded-circle bg-danger bg-opacity-10 text-danger d-flex align-items-center justify-content-center flex-shrink-0"
                     style="width:32px;height:32px;font-size:0.75rem;font-weight:700;">
                  ${a.nombre_completo.charAt(0)}
                </div>
                <span style="font-size:0.875rem;">${a.nombre_completo}</span>
                <span class="badge bg-danger-subtle text-danger ms-auto rounded-pill" style="font-size:0.65rem;">Riesgo</span>
              </li>`).join('')}
          </ul>
        </div>
      </div>` : ''}

      <div class="row g-3 mb-4">
        ${_quickCard('bi-journal-text', 'Planificación', 'Planes de clase, plantillas y revisión', 'planificacion', 'primary')}
        ${_quickCard('bi-person-lines-fill', 'Seguimiento', 'Progreso y asistencia por alumno', 'pedagogico-seguimiento', 'success')}
        ${_quickCard('bi-graph-up', 'Evaluaciones', 'Calificaciones y boletines', 'progresos', 'warning')}
        ${_quickCard('bi-file-earmark-bar-graph', 'Reportes', 'Rendimiento por clase y riesgo', 'pedagogico-reportes', 'info')}
      </div>

      <!-- Clases emergentes -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header border-0 d-flex align-items-center gap-2">
          <i class="bi bi-lightning-charge-fill text-warning"></i>
          <span class="fw-semibold" style="font-size:0.9rem;">Clases emergentes registradas</span>
        </div>
        <div class="card-body p-0" id="emergentes-section">
          <div class="text-center text-muted py-3">
            <span class="spinner-border spinner-border-sm me-2"></span>Cargando...
          </div>
        </div>
      </div>
    </div>`
}

async function _loadEmergentes(container) {
  const section = container.querySelector('#emergentes-section')
  if (!section) return

  try {
    // Fetch emergentes and maestros in parallel
    const { data: emergentes, error } = await supabase
      .from('clases_emergentes')
      .select('*')
      .order('fecha', { ascending: false })
      .limit(20)

    if (error) throw error

    if (!emergentes || emergentes.length === 0) {
      section.innerHTML = `
        <div class="text-center text-muted py-4 px-3">
          <i class="bi bi-lightning-charge fs-3 d-block mb-2 opacity-40"></i>
          <p class="mb-1" style="font-size:0.9rem;">No hay clases emergentes registradas.</p>
          <small>Las clases emergentes aparecerán aquí cuando sean registradas por coordinación o por un maestro autorizado.</small>
        </div>`
      return
    }

    // Resolve maestro names
    const maestroIds = [...new Set(emergentes.map(e => e.maestro_id).filter(Boolean))]
    let maestrosMap = {}
    if (maestroIds.length > 0) {
      const { data: maestros } = await supabase
        .from('maestros')
        .select('id, nombre_completo, nombre')
        .in('id', maestroIds)
      ;(maestros || []).forEach(m => { maestrosMap[m.id] = m })
    }

    const rows = emergentes.map(e => {
      const maestroNombre = maestrosMap[e.maestro_id]?.nombre_completo
        || maestrosMap[e.maestro_id]?.nombre
        || 'No asignado'
      const fecha = e.fecha
        ? new Date(e.fecha + 'T00:00:00').toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : 'Sin fecha'
      const hora    = e.hora_inicio ? e.hora_inicio.slice(0, 5) : '—'
      const horaFin = e.hora_fin    ? e.hora_fin.slice(0, 5)   : ''
      const horario = horaFin ? `${hora} – ${horaFin}` : hora
      const motivo  = e.motivo || e.observaciones || null

      return `
        <div class="d-flex align-items-start gap-3 px-3 py-3 border-bottom">
          <div class="flex-shrink-0 text-warning mt-1">
            <i class="bi bi-lightning-charge-fill"></i>
          </div>
          <div class="flex-grow-1 overflow-hidden">
            <div class="fw-semibold text-truncate" style="font-size:0.875rem;">${e.nombre_clase || 'Clase emergente'}</div>
            <div class="small text-muted mt-1">
              <span class="me-3"><i class="bi bi-calendar3 me-1"></i>${fecha}</span>
              <span class="me-3"><i class="bi bi-clock me-1"></i>${horario}</span>
              <span><i class="bi bi-person-badge me-1"></i>${maestroNombre}</span>
            </div>
            ${motivo ? `<div class="small text-muted fst-italic mt-1 text-truncate">${motivo}</div>` : ''}
          </div>
          <button class="btn btn-sm btn-outline-secondary flex-shrink-0" disabled title="Detalle disponible próximamente">
            <i class="bi bi-eye"></i>
          </button>
        </div>`
    }).join('')

    section.innerHTML = rows
  } catch (err) {
    console.error('[DashboardPedagogico] _loadEmergentes error:', err)
    if (section) section.innerHTML = '<p class="text-danger small px-3 py-2 mb-0">Error al cargar las clases emergentes.</p>'
  }
}

function _kpiCard(icon, label, value, color, sub) {
  return `
    <div class="col-6 col-md-3">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body">
          <div class="d-flex align-items-center gap-2 mb-2">
            <i class="bi ${icon} text-${color}" style="font-size:1.1rem;"></i>
            <span class="text-muted" style="font-size:0.75rem;">${label}</span>
          </div>
          <div class="fw-bold" style="font-size:1.6rem;line-height:1;">${value}</div>
          ${sub ? `<div class="text-muted mt-1" style="font-size:0.7rem;">${sub}</div>` : ''}
        </div>
      </div>
    </div>`
}

function _quickCard(icon, title, desc, route, color) {
  return `
    <div class="col-12 col-sm-6 col-md-3">
      <div class="card border-0 shadow-sm h-100 quick-nav-card" data-nav="${route}"
           style="cursor:pointer;transition:transform 0.15s,box-shadow 0.15s;">
        <div class="card-body d-flex flex-column gap-2">
          <div class="rounded-3 bg-${color} bg-opacity-10 text-${color} d-flex align-items-center justify-content-center"
               style="width:40px;height:40px;">
            <i class="bi ${icon}" style="font-size:1.1rem;"></i>
          </div>
          <div class="fw-semibold" style="font-size:0.9rem;">${title}</div>
          <div class="text-muted" style="font-size:0.78rem;">${desc}</div>
          <div class="mt-auto text-${color}" style="font-size:0.75rem;">
            Ir a ${title} <i class="bi bi-arrow-right"></i>
          </div>
        </div>
      </div>
    </div>`
}

function _attachEvents(container) {
  container.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => router.navigate(el.dataset.nav))
    if (el.classList.contains('quick-nav-card')) {
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'translateY(-2px)'
        el.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)'
      })
      el.addEventListener('mouseleave', () => {
        el.style.transform = ''
        el.style.boxShadow = ''
      })
    }
  })

  container.querySelector('#btn-help-dashboard')?.addEventListener('click', () => {
    HelpPanel.open({
      title: 'Dashboard Pedagógico',
      intro: 'Resumen general del estado académico de la institución. Te permite ver de un vistazo cómo están los alumnos, clases y planificaciones.',
      sections: [
        { icon: 'bi-people-fill',            title: 'Alumnos activos',             description: 'Cantidad total de alumnos con estado activo en el sistema.',                                                                                            color: '#3b82f6' },
        { icon: 'bi-easel2',                 title: 'Clases activas',              description: 'Número de clases con estado "activa". Las clases inactivas o suspendidas no se cuentan.',                                                              color: '#6366f1' },
        { icon: 'bi-journal-text',           title: 'Planes esta semana',          description: 'Planificaciones con fecha de inicio en los últimos 7 días. Muestra cuántas fueron ejecutadas y cuántas siguen pendientes.',                            color: '#10b981' },
        { icon: 'bi-calendar-check',         title: 'Asistencia (7 días)',         description: 'Porcentaje de asistencia del total de la institución en los últimos 7 días. Verde ≥ 80%, amarillo ≥ 60%, rojo < 60%.',                                 color: '#f59e0b' },
        { icon: 'bi-exclamation-triangle-fill', title: 'Alumnos con asistencia baja', description: 'Alumnos que en las últimas 4 semanas tuvieron menos del 70% de asistencia (mínimo 4 clases). Requieren atención prioritaria.',                     color: '#ef4444' },
        { icon: 'bi-grid-1x2',              title: 'Acceso rápido',               description: 'Los 4 cards al pie llevan directamente a Planificación, Seguimiento de alumnos, Evaluaciones y Reportes. Hacé clic para navegar.',                    color: '#3b82f6' },
      ],
    })
  })
}
