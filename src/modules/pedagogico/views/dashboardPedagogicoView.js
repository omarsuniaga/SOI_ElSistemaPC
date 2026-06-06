import { supabase } from '../../../lib/supabaseClient.js'
import { router } from '../../../core/router/router.js'
import { THRESHOLDS } from '../../progresos/services/riskRules.js'
import { HelpPanel } from '../../../shared/components/HelpPanel.js'
import { AppModal } from '../../../shared/components/AppModal.js'

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
        ${_quickCard('bi-envelope-paper', 'Solicitudes', 'Necesidades enviadas por maestros', 'pedagogico-solicitudes', 'secondary')}
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
    // Las clases emergentes se guardan en sesiones_clase con clase_id = NULL
    const { data: emergentes, error } = await supabase
      .from('sesiones_clase')
      .select('id, fecha, hora_inicio, hora_fin, tema_principal, actividad, motivo, observaciones_generales, estado, maestro_id, salon_id, asistencia, contenidos_trabajados')
      .is('clase_id', null)
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

    // Resolver nombres de maestros
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
      // tema_principal es el título, actividad es el tipo, motivo es la justificación
      const titulo  = e.tema_principal || e.actividad || 'Clase emergente'
      const motivo  = e.motivo || null

      return `
        <div class="d-flex align-items-start gap-3 px-3 py-3 border-bottom emergente-row"
             data-id="${e.id}" style="cursor:pointer;">
          <div class="flex-shrink-0 text-warning mt-1">
            <i class="bi bi-lightning-charge-fill"></i>
          </div>
          <div class="flex-grow-1 overflow-hidden">
            <div class="fw-semibold text-truncate" style="font-size:0.875rem;">${titulo}</div>
            <div class="small text-muted mt-1">
              <span class="me-3"><i class="bi bi-calendar3 me-1"></i>${fecha}</span>
              <span class="me-3"><i class="bi bi-clock me-1"></i>${horario}</span>
              <span><i class="bi bi-person-badge me-1"></i>${maestroNombre}</span>
              ${e.actividad ? `<span class="ms-2 badge bg-secondary-subtle text-secondary-emphasis">${e.actividad}</span>` : ''}
            </div>
            ${motivo ? `<div class="small text-muted fst-italic mt-1 text-truncate">${motivo}</div>` : ''}
          </div>
          <button class="btn btn-sm btn-outline-secondary flex-shrink-0" data-id="${e.id}" title="Ver detalle">
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

function _openEmergenteModal(id) {
  AppModal.open({
    title: 'Detalle de clase emergente',
    hideSave: true,
    cancelText: 'Cerrar',
    size: 'lg',
    body: `<div id="emergente-modal-body" class="text-center py-4">
      <span class="spinner-border spinner-border-sm me-2"></span>Cargando detalle...
    </div>`,
    onOpen: async (modalBody) => {
      try {
        // Las emergentes viven en sesiones_clase con clase_id = NULL
        const { data: e, error } = await supabase
          .from('sesiones_clase')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        // Fetch maestro y salón por separado para evitar ambigüedad de FK múltiple
        let maestroNombre = 'No asignado'
        let salonNombre   = null
        if (e.maestro_id) {
          const { data: m } = await supabase.from('maestros').select('nombre_completo, nombre').eq('id', e.maestro_id).single()
          maestroNombre = m?.nombre_completo || m?.nombre || 'No asignado'
        }
        if (e.salon_id) {
          const { data: s } = await supabase.from('salones').select('nombre').eq('id', e.salon_id).single()
          salonNombre = s?.nombre || null
        }
        const fecha = e.fecha
          ? new Date(e.fecha + 'T00:00:00').toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : 'Sin fecha'
        const hora    = e.hora_inicio ? e.hora_inicio.slice(0, 5) : '—'
        const horaFin = e.hora_fin    ? e.hora_fin.slice(0, 5)   : '—'
        const horario = `${hora} – ${horaFin}`

        // Mapeo de campos: tema_principal = título, actividad = tipo, motivo = justificación
        const titulo  = e.tema_principal || e.actividad || 'Clase emergente'
        const tipo    = e.actividad || null
        const estadoMap = { pendiente: 'bg-warning-subtle text-warning-emphasis', registrada: 'bg-success-subtle text-success-emphasis', cancelada: 'bg-danger-subtle text-danger-emphasis' }
        const estadoBadge = estadoMap[e.estado] || 'bg-secondary-subtle text-secondary-emphasis'

        // Contenidos trabajados (JSONB array)
        const contenidos = Array.isArray(e.contenidos_trabajados) && e.contenidos_trabajados.length > 0
          ? e.contenidos_trabajados.map(c => `<li class="small">${typeof c === 'string' ? c : JSON.stringify(c)}</li>`).join('')
          : null

        modalBody.querySelector('#emergente-modal-body').innerHTML = `
          <div class="d-flex align-items-start gap-3 mb-4 pb-3 border-bottom">
            <div class="rounded-3 bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center flex-shrink-0" style="width:44px;height:44px;">
              <i class="bi bi-lightning-charge-fill" style="font-size:1.2rem;"></i>
            </div>
            <div class="flex-grow-1">
              <h5 class="mb-1 fw-bold">${titulo}</h5>
              <span class="badge ${estadoBadge}">${e.estado || 'pendiente'}</span>
              ${tipo ? `<span class="badge bg-secondary-subtle text-secondary-emphasis ms-1">${tipo}</span>` : ''}
            </div>
          </div>

          <div class="row g-2 mb-4 small">
            <div class="col-6 col-md-4"><div class="text-muted fw-bold" style="font-size:0.7rem;text-transform:uppercase;">Fecha</div><div>${fecha}</div></div>
            <div class="col-6 col-md-4"><div class="text-muted fw-bold" style="font-size:0.7rem;text-transform:uppercase;">Horario</div><div>${horario}</div></div>
            <div class="col-6 col-md-4"><div class="text-muted fw-bold" style="font-size:0.7rem;text-transform:uppercase;">Salón</div><div>${salonNombre || '<em class="text-muted">No registrado</em>'}</div></div>
            <div class="col-6 col-md-4"><div class="text-muted fw-bold" style="font-size:0.7rem;text-transform:uppercase;">Maestro</div><div>${maestroNombre}</div></div>
          </div>

          <div class="mb-4">
            <h6 class="fw-bold border-bottom pb-2 mb-2" style="font-size:0.82rem;text-transform:uppercase;letter-spacing:0.05em;">
              <i class="bi bi-chat-left-text me-2 text-primary"></i>Justificación
            </h6>
            <p class="small mb-0" style="line-height:1.6;">${e.motivo || '<em class="text-muted">Sin justificación registrada.</em>'}</p>
          </div>

          <div class="mb-4">
            <h6 class="fw-bold border-bottom pb-2 mb-2" style="font-size:0.82rem;text-transform:uppercase;letter-spacing:0.05em;">
              <i class="bi bi-journal-text me-2 text-primary"></i>Contenido trabajado
            </h6>
            ${contenidos
              ? `<ul class="mb-0 ps-3">${contenidos}</ul>`
              : e.contenido
                ? `<p class="small mb-0" style="white-space:pre-line;">${e.contenido}</p>`
                : '<em class="text-muted small">Sin contenido registrado.</em>'}
            ${e.observaciones_generales
              ? `<div class="border-start border-2 border-secondary ps-3 mt-2">
                   <div class="text-muted small fw-semibold mb-1">Observaciones del maestro:</div>
                   <p class="small mb-0" style="white-space:pre-line;">${e.observaciones_generales}</p>
                 </div>`
              : ''}
          </div>

          <div>
            <h6 class="fw-bold border-bottom pb-2 mb-2" style="font-size:0.82rem;text-transform:uppercase;letter-spacing:0.05em;">
              <i class="bi bi-people me-2 text-primary"></i>Asistencia
            </h6>
            <div id="emergente-asistencia-section">
              <span class="spinner-border spinner-border-sm me-2"></span>Cargando asistencia...
            </div>
          </div>
        `

        // La asistencia está embebida como JSONB en la misma sesión
        await _loadEmergenteAsistencia(e.asistencia || [], modalBody)
      } catch (err) {
        console.error('[emergente modal]', err)
        const body = modalBody.querySelector('#emergente-modal-body')
        if (body) body.innerHTML = '<p class="text-danger small">Error al cargar el detalle.</p>'
      }
    }
  })
}

async function _loadEmergenteAsistencia(asistenciaJson, modalBody) {
  const section = modalBody.querySelector('#emergente-asistencia-section')
  if (!section) return

  if (!asistenciaJson || asistenciaJson.length === 0) {
    section.innerHTML = '<p class="text-muted small fst-italic mb-0">No hay alumnos asignados a esta clase emergente.</p>'
    return
  }

  try {
    // Resolver nombres de alumnos desde los IDs del JSONB
    const alumnoIds = [...new Set(asistenciaJson.map(a => a.alumno_id).filter(Boolean))]
    let alumnosMap = {}
    if (alumnoIds.length > 0) {
      const { data: alumnos } = await supabase
        .from('alumnos')
        .select('id, nombre_completo, name')
        .in('id', alumnoIds)
      ;(alumnos || []).forEach(a => { alumnosMap[a.id] = a })
    }

    // Mapeo de estados: "P" = presente, "A" = ausente, null = pendiente
    const estadoLabel = { P: 'presente', A: 'ausente', J: 'justificado', T: 'tarde' }
    const badgeMap    = { P: 'bg-success-subtle text-success-emphasis', A: 'bg-danger-subtle text-danger-emphasis', J: 'bg-info-subtle text-info-emphasis', T: 'bg-warning-subtle text-warning-emphasis' }

    const presentes = asistenciaJson.filter(a => a.estado === 'P').length
    const ausentes  = asistenciaJson.filter(a => a.estado === 'A').length
    const otros     = asistenciaJson.filter(a => a.estado && a.estado !== 'P' && a.estado !== 'A').length
    const sinEstado = asistenciaJson.filter(a => !a.estado).length
    const total     = asistenciaJson.length
    const pct       = total > 0 ? Math.round((presentes / total) * 100) : 0

    section.innerHTML = `
      <div class="row g-2 mb-3 small text-center">
        <div class="col"><div class="fw-bold">${total}</div><div class="text-muted" style="font-size:0.72rem;">Total</div></div>
        <div class="col"><div class="fw-bold text-success">${presentes}</div><div class="text-muted" style="font-size:0.72rem;">Presentes</div></div>
        <div class="col"><div class="fw-bold text-danger">${ausentes}</div><div class="text-muted" style="font-size:0.72rem;">Ausentes</div></div>
        <div class="col"><div class="fw-bold text-secondary">${sinEstado}</div><div class="text-muted" style="font-size:0.72rem;">Sin registrar</div></div>
        <div class="col"><div class="fw-bold">${pct}%</div><div class="text-muted" style="font-size:0.72rem;">Asistencia</div></div>
      </div>
      ${asistenciaJson.map(a => {
        const alumno = alumnosMap[a.alumno_id]
        const nombre = alumno?.nombre_completo || alumno?.name || a.alumno_id?.slice(0, 8) || '—'
        const est    = a.estado || null
        const badge  = est ? (badgeMap[est] || 'bg-secondary-subtle text-secondary-emphasis') : 'bg-secondary-subtle text-secondary-emphasis'
        const label  = est ? (estadoLabel[est] || est) : 'pendiente'
        return `
          <div class="d-flex align-items-center gap-2 py-2 border-bottom">
            <span class="badge flex-shrink-0 ${badge}">${label}</span>
            <div class="small fw-semibold">${nombre}</div>
          </div>`
      }).join('')}
    `
  } catch (err) {
    console.error('[asistencia emergente]', err)
    section.innerHTML = '<p class="text-danger small mb-0">Error al cargar la asistencia.</p>'
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

  // Delegación de clicks en filas de clases emergentes
  container.addEventListener('click', (e) => {
    const row = e.target.closest('.emergente-row[data-id]')
    if (row) _openEmergenteModal(row.dataset.id)
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
