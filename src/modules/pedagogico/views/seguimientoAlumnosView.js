import { supabase } from '../../../lib/supabaseClient.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { HelpPanel } from '../../../shared/components/HelpPanel.js'
import { fetchSeguimientoAlumnos } from '../services/seguimientoAlumnosService.js'

const state = {
  alumnos: [],
  busqueda: '',
  container: null,
  totalCount: 0,
  riskCount: 0,
  limit: 50,
  offset: 0,
  desde: null,
  hasta: null,
  loading: false,
}

export async function renderSeguimientoAlumnosView(container) {
  if (!container) return
  state.container = container
  container.innerHTML = _renderLoading()

  try {
    await _loadData()
    _render()
  } catch (err) {
    console.error('[SeguimientoAlumnos]', err)
    container.innerHTML = `<div class="page-container"><div class="alert alert-warning">${err.message}</div></div>`
  }
}

async function _loadData() {
  state.loading = true
  const result = await fetchSeguimientoAlumnos({
    desde: state.desde,
    hasta: state.hasta,
    limit: state.limit,
    offset: state.offset,
    busqueda: state.busqueda,
  })

  state.alumnos = result.alumnos
  state.totalCount = result.totalCount
  state.riskCount = result.riskCount
  state.desde = result.desde
  state.hasta = result.hasta
  state.loading = false
}

function _getAlumnoRisk(alumnoId) {
  const alumno = state.alumnos.find(a => a.id === alumnoId)
  return alumno?.risk_reasons || []
}

function _render() {
  const ordenados = state.alumnos
  const currentPage = Math.floor(state.offset / state.limit) + 1
  const totalPages = Math.max(1, Math.ceil(state.totalCount / state.limit))

  state.container.innerHTML = `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-success bg-opacity-10 text-success rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-person-lines-fill fs-4"></i>
        </div>
        <div class="flex-grow-1">
          <h1 class="page-title mb-0">Seguimiento de Alumnos</h1>
          <p class="text-muted small mb-0">${state.totalCount} alumnos activos - ${state.riskCount} en riesgo - Pagina ${currentPage}/${totalPages}</p>
        </div>
        <button class="btn-help-trigger" id="btn-help-seguimiento" title="¿Cómo funciona esta pantalla?" aria-label="Ayuda">
          <i class="bi bi-question"></i>
        </button>
      </div>

      <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
        <div class="input-group" style="max-width:360px;">
          <span class="input-group-text bg-transparent border-end-0"><i class="bi bi-search text-muted"></i></span>
          <input type="text" class="form-control border-start-0" id="busqueda-alumno"
                 placeholder="Buscar alumno o instrumento..." value="${state.busqueda}">
        </div>
        <span class="badge bg-body-secondary text-body-secondary">Periodo: ${state.desde} - ${state.hasta}</span>
      </div>

      ${state.riskCount ? `
        <div class="alert alert-warning border-0 d-flex align-items-center gap-2 mb-3 py-2">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span style="font-size:0.85rem;"><strong>${state.riskCount}</strong> alumno${state.riskCount !== 1 ? 's' : ''} requiere${state.riskCount === 1 ? '' : 'n'} atencion</span>
        </div>` : ''}

      <div class="d-flex flex-column gap-2" id="lista-alumnos">
        ${ordenados.map(a => _renderAlumnoRow(a)).join('') ||
          '<div class="text-center text-muted py-5">Sin resultados</div>'}
      </div>

      <div class="d-flex justify-content-between align-items-center mt-3">
        <button class="btn btn-sm btn-outline-secondary" id="btn-prev-page" ${state.offset <= 0 ? 'disabled' : ''}>
          <i class="bi bi-chevron-left me-1"></i>Anterior
        </button>
        <span class="text-muted small">Mostrando ${state.offset + 1}-${Math.min(state.offset + state.alumnos.length, state.totalCount)} de ${state.totalCount}</span>
        <button class="btn btn-sm btn-outline-secondary" id="btn-next-page" ${state.offset + state.limit >= state.totalCount ? 'disabled' : ''}>
          Siguiente<i class="bi bi-chevron-right ms-1"></i>
        </button>
      </div>
    </div>`

  _attachEvents()
}

function _renderAlumnoRow(alumno) {
  const risks = _getAlumnoRisk(alumno.id)
  const asist = alumno.asistencia
  const prog  = alumno.progreso
  const obsCount = alumno.observacionesCount || 0

  const asistPct   = asist?.rate != null ? Math.round(asist.rate * 100) : null
  const asistColor = asistPct === null ? 'secondary' : asistPct >= 80 ? 'success' : asistPct >= 60 ? 'warning' : 'danger'
  const notaColor  = !prog ? 'secondary' : prog.promedio >= 7 ? 'success' : prog.promedio >= 5 ? 'warning' : 'danger'

  return `
    <div class="alumno-row card border-0 shadow-sm" data-id="${alumno.id}"
         style="cursor:pointer;${risks.length ? 'border-left:3px solid #f59e0b !important;' : ''}transition:box-shadow 0.15s;">
      <div class="card-body py-2 px-3 d-flex align-items-center gap-3">
        <div class="rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center fw-bold"
             style="width:38px;height:38px;font-size:0.85rem;background:${risks.length ? '#fef3c7' : 'var(--bs-primary-bg-subtle)'};color:${risks.length ? '#92400e' : 'var(--bs-primary)'};">
          ${alumno.nombre_completo.charAt(0)}
        </div>
        <div class="flex-grow-1 overflow-hidden">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <span class="fw-semibold text-truncate" style="font-size:0.87rem;">${alumno.nombre_completo}</span>
            ${risks.includes('asistencia') ? '<span class="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill" style="font-size:0.6rem;">Asistencia baja</span>' : ''}
            ${risks.includes('calificacion') ? '<span class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill" style="font-size:0.6rem;">Nota baja</span>' : ''}
            ${risks.includes('disciplina') ? '<span class="badge rounded-pill" style="font-size:0.6rem;background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;">Observación</span>' : ''}
          </div>
          <div class="d-flex gap-3 mt-1" style="font-size:0.73rem;color:var(--bs-secondary-color);">
            ${alumno.instrumento_principal ? `<span><i class="bi bi-music-note me-1"></i>${alumno.instrumento_principal}</span>` : ''}
            <span title="Asistencia últimas 4 semanas">
              <i class="bi bi-calendar-check me-1 text-${asistColor}"></i>
              ${asistPct !== null ? `${asistPct}%` : 'Sin datos'}
            </span>
            <span title="Promedio últimas calificaciones">
              <i class="bi bi-star me-1 text-${notaColor}"></i>
              ${prog ? prog.promedio.toFixed(1) : 'Sin notas'}
            </span>
            ${obsCount ? `<span><i class="bi bi-chat-quote me-1 text-muted"></i>${obsCount} obs.</span>` : ''}
          </div>
        </div>
        <i class="bi bi-chevron-right text-muted flex-shrink-0"></i>
      </div>
    </div>`
}

function _attachEvents() {
  state.container.querySelector('#btn-help-seguimiento')?.addEventListener('click', () => {
    HelpPanel.open({
      title: 'Seguimiento de Alumnos',
      intro: 'Vista unificada del estado académico de cada alumno. Los alumnos con riesgo aparecen primero, destacados con una barra lateral amarilla.',
      sections: [
        { icon: 'bi-search',                  title: 'Buscador',          description: 'Filtrá por nombre del alumno o por instrumento en tiempo real.',                                                                                                color: '#6b7280' },
        { icon: 'bi-exclamation-triangle-fill', title: 'Alerta de riesgo', description: 'Aparece cuando hay alumnos que requieren atención. Muestra el total con algún indicador activo.',                                                              color: '#f59e0b' },
        { icon: 'bi-person-fill',             title: 'Fila del alumno',   description: 'Nombre, instrumento, % de asistencia (últimas 4 semanas) y promedio de las últimas 3 calificaciones. Barra amarilla izquierda = en riesgo.',                   color: '#3b82f6' },
        { icon: 'bi-tags-fill',               title: 'Badges de riesgo',  description: '"Asistencia baja" < 70% en 4 semanas. "Nota baja" promedio < 6.0. "Observación" cuando hay observaciones de disciplina activas.',                            color: '#ef4444' },
        { icon: 'bi-window-sidebar',          title: 'Panel de detalle',  description: 'Clic en cualquier alumno → panel con asistencia reciente (20 clases), últimas calificaciones por clase y observaciones activas.',                              color: '#10b981' },
      ],
    })
  })

  let searchTimer
  state.container.querySelector('#busqueda-alumno')?.addEventListener('input', e => {
    state.busqueda = e.target.value
    state.offset = 0
    clearTimeout(searchTimer)
    searchTimer = setTimeout(async () => {
      state.container.innerHTML = _renderLoading()
      await _loadData()
      _render()
    }, 300)
  })

  state.container.querySelector('#btn-prev-page')?.addEventListener('click', async () => {
    state.offset = Math.max(0, state.offset - state.limit)
    state.container.innerHTML = _renderLoading()
    await _loadData()
    _render()
  })

  state.container.querySelector('#btn-next-page')?.addEventListener('click', async () => {
    state.offset += state.limit
    state.container.innerHTML = _renderLoading()
    await _loadData()
    _render()
  })

  state.container.querySelectorAll('.alumno-row').forEach(row => {
    row.addEventListener('click', () => _openAlumnoDetail(row.dataset.id))
    row.addEventListener('mouseenter', () => { row.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)' })
    row.addEventListener('mouseleave', () => { row.style.boxShadow = '' })
  })
}

function _renderLoading() {
  return `<div class="page-container d-flex align-items-center justify-content-center" style="min-height:400px;">
    <div class="spinner-border text-primary"></div>
  </div>`
}

async function _openAlumnoDetail(alumnoId) {
  const alumno = state.alumnos.find(a => a.id === alumnoId)
  if (!alumno) return

  const [asistencias, progresos, observaciones, inscripciones] = await Promise.all([
    supabase.from('asistencias').select('fecha, estado, clase_id').eq('alumno_id', alumnoId)
      .order('fecha', { ascending: false }).limit(20),
    supabase.from('progresos').select('*, clase:clases(nombre)').eq('alumno_id', alumnoId)
      .order('fecha_evaluacion', { ascending: false }).limit(10),
    supabase.from('observaciones_alumnos').select('*').eq('alumno_id', alumnoId)
      .order('created_at', { ascending: false }).limit(5),
    supabase.from('alumnos_clases').select('clase:clases(id, nombre, instrumento)').eq('alumno_id', alumnoId),
  ])

  const clases = (inscripciones.data || []).map(i => i.clase).filter(Boolean)
  const risks  = _getAlumnoRisk(alumnoId)

  AppModal.open({
    title: alumno.nombre_completo,
    size: 'lg',
    hideSave: true,
    cancelText: 'Cerrar',
    body: `
      <div class="d-flex gap-2 flex-wrap mb-3">
        ${alumno.instrumento_principal ? `<span class="badge bg-primary-subtle text-primary">${alumno.instrumento_principal}</span>` : ''}
        ${risks.map(r => `<span class="badge bg-warning-subtle text-warning">${r === 'asistencia' ? 'Asistencia baja' : r === 'calificacion' ? 'Nota baja' : 'Con observación'}</span>`).join('')}
        ${clases.map(c => `<span class="badge bg-body-secondary text-body-secondary">${c.nombre}</span>`).join('')}
      </div>

      <div class="row g-3">
        <div class="col-md-6">
          <div class="card border-0 bg-body-tertiary h-100">
            <div class="card-body">
              <div class="fw-semibold mb-2" style="font-size:0.85rem;"><i class="bi bi-calendar-check me-1 text-success"></i>Asistencia reciente</div>
              <div style="max-height:160px;overflow-y:auto;">
                ${(asistencias.data || []).length ? asistencias.data.map(a => `
                  <div class="d-flex justify-content-between align-items-center py-1 border-bottom" style="font-size:0.78rem;">
                    <span class="text-muted">${a.fecha}</span>
                    <span class="badge rounded-pill ${a.estado === 'P' ? 'bg-success-subtle text-success' : a.estado === 'J' ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger'}">
                      ${a.estado === 'P' ? 'Presente' : a.estado === 'J' ? 'Justificado' : 'Ausente'}
                    </span>
                  </div>`).join('') : '<p class="text-muted small mb-0">Sin registros</p>'}
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card border-0 bg-body-tertiary h-100">
            <div class="card-body">
              <div class="fw-semibold mb-2" style="font-size:0.85rem;"><i class="bi bi-star me-1 text-warning"></i>Últimas calificaciones</div>
              <div style="max-height:160px;overflow-y:auto;">
                ${(progresos.data || []).length ? progresos.data.map(p => `
                  <div class="d-flex justify-content-between align-items-center py-1 border-bottom" style="font-size:0.78rem;">
                    <span class="text-truncate me-2" style="max-width:140px;">${p.clase?.nombre || 'Sin clase'}</span>
                    <span class="fw-semibold ${p.calificacion >= 7 ? 'text-success' : p.calificacion >= 5 ? 'text-warning' : 'text-danger'}">${p.calificacion?.toFixed(1) ?? '–'}</span>
                  </div>`).join('') : '<p class="text-muted small mb-0">Sin calificaciones</p>'}
              </div>
            </div>
          </div>
        </div>

        ${(observaciones.data || []).length ? `
        <div class="col-12">
          <div class="card border-0 bg-body-tertiary">
            <div class="card-body">
              <div class="fw-semibold mb-2" style="font-size:0.85rem;"><i class="bi bi-chat-quote me-1 text-info"></i>Observaciones activas</div>
              ${observaciones.data.map(o => `
                <div class="border rounded-2 p-2 mb-2" style="font-size:0.8rem;">
                  <div class="d-flex justify-content-between mb-1">
                    <span class="badge bg-secondary-subtle text-secondary">${o.tipo || 'General'}</span>
                    <span class="text-muted">${(o.created_at || '').slice(0, 10)}</span>
                  </div>
                  <p class="mb-0">${o.descripcion || ''}</p>
                </div>`).join('')}
            </div>
          </div>
        </div>` : ''}
      </div>`
  })
}
