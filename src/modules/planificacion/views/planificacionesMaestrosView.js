import { AppModal } from '../../../shared/components/AppModal.js'
import { obtenerPlanificacionesConDetalles, marcarRevisada, marcarRevisadasMasivo } from '../api/planificacionApi.js'
import { formatDate, escapeHTML, getEstadoBadgeClass, getEstadoIcon, getInitials } from '../utils/planificacionUtils.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const state = {
  planificaciones: [],
  filtroEstado: 'todos',
  filtroMaestro: '',
  buscar: '',
  cargando: false
}

export async function renderPlanificacionesMaestrosView(container) {
  await _loadData()
  _render(container)
  _bindEvents(container)
}

async function _loadData() {
  try {
    state.cargando = true
    const data = await obtenerPlanificacionesConDetalles()
    state.planificaciones = data || []
    state.cargando = false
  } catch (e) {
    console.error('Error cargando planificaciones:', e.message)
    AppToast.error('No se pudieron cargar las planificaciones de la base de datos')
    state.cargando = false
  }
}

function _render(container) {
  let filtradas = [...state.planificaciones]

  if (state.filtroEstado !== 'todos') {
    filtradas = filtradas.filter(p => p.estado === state.filtroEstado)
  }

  if (state.filtroMaestro) {
    filtradas = filtradas.filter(p => p.maestro_nombre?.toLowerCase().includes(state.filtroMaestro.toLowerCase()))
  }

  if (state.buscar) {
    const term = state.buscar.toLowerCase()
    filtradas = filtradas.filter(p =>
      p.tema?.toLowerCase().includes(term) ||
      p.clase_nombre?.toLowerCase().includes(term) ||
      p.objetivos?.toLowerCase().includes(term)
    )
  }

  const porEstado = {
    planificado: filtradas.filter(p => p.estado === 'planificado').length,
    ejecutado: filtradas.filter(p => p.estado === 'ejecutado').length,
    revisado: filtradas.filter(p => p.estado === 'revisado').length,
  }

  container.innerHTML = `
    <div class="planificaciones-maestros-view px-3 px-md-4 py-3">
      <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 class="mb-0 fw-semibold"><i class="bi bi-journal-check me-2 text-primary"></i>Planificaciones de Maestros</h4>
          <p class="text-secondary small mb-0">Vista administrativa de todas las planificaciones</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary btn-sm" id="btnAprobarBulk">
            <i class="bi bi-check-all me-1"></i>Aprobación Masiva
          </button>
          <button class="btn btn-outline-secondary btn-sm" id="btnExportar">
            <i class="bi bi-download me-1"></i>Exportar
          </button>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body py-2">
              <div class="d-flex align-items-center gap-2">
                <div class="bg-primary-subtle text-primary rounded p-2">
                  <i class="bi bi-calendar-check"></i>
                </div>
                <div>
                  <div class="text-muted small">Planificadas</div>
                  <div class="fw-bold fs-5">${porEstado.planificado}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body py-2">
              <div class="d-flex align-items-center gap-2">
                <div class="bg-success-subtle text-success rounded p-2">
                  <i class="bi bi-play-circle"></i>
                </div>
                <div>
                  <div class="text-muted small">Ejecutadas</div>
                  <div class="fw-bold fs-5">${porEstado.ejecutado}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body py-2">
              <div class="d-flex align-items-center gap-2">
                <div class="bg-info-subtle text-info rounded p-2">
                  <i class="bi bi-eye"></i>
                </div>
                <div>
                  <div class="text-muted small">Revisadas</div>
                  <div class="fw-bold fs-5">${porEstado.revisado}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body py-2 px-3">
          <div class="d-flex gap-2 flex-wrap align-items-center">
            <div class="input-group input-group-sm" style="max-width: 250px;">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control" placeholder="Buscar..." id="buscarPlan" value="${state.buscar}">
            </div>
            <select class="form-select form-select-sm" id="filtroEstado" style="width: auto; min-width: 140px;">
              <option value="todos" ${state.filtroEstado === 'todos' ? 'selected' : ''}>Todos los estados</option>
              <option value="planificado" ${state.filtroEstado === 'planificado' ? 'selected' : ''}>Planificado</option>
              <option value="ejecutado" ${state.filtroEstado === 'ejecutado' ? 'selected' : ''}>Ejecutado</option>
              <option value="revisado" ${state.filtroEstado === 'revisado' ? 'selected' : ''}>Revisado</option>
            </select>
            <select class="form-select form-select-sm" id="filtroMaestro" style="width: auto; min-width: 160px;">
              <option value="">Todos los maestros</option>
              ${_getMaestrosOptions()}
            </select>
            <button class="btn btn-sm btn-light border" id="btnRefresh" title="Actualizar datos">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th style="width: 25%;">Tema</th>
              <th style="width: 15%;">Clase</th>
              <th style="width: 12%;">Maestro</th>
              <th style="width: 10%;">Fecha</th>
              <th style="width: 10%;">Estado</th>
              <th style="width: 8%;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${filtradas.length ? filtradas.map(p => _renderRow(p)).join('') : '<tr><td colspan="6" class="text-center text-muted py-4">No hay planificaciones</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `
}

function _renderRow(p) {
  return `
    <tr data-id="${p.id}">
      <td>
        <div class="d-flex align-items-center gap-2">
          <div class="avatar-compact bg-primary text-white">${getInitials(p.tema)}</div>
          <span class="text-truncate" style="max-width: 180px;">${escapeHTML(p.tema)}</span>
        </div>
      </td>
      <td><span class="text-truncate">${escapeHTML(p.clase_nombre || '-')}</span></td>
      <td>${escapeHTML(p.maestro_nombre || '-')}</td>
      <td>${p.fecha_inicio ? formatDate(p.fecha_inicio) : '-'}</td>
      <td>
        <span class="badge ${getEstadoBadgeClass(p.estado)}">
          <i class="bi ${getEstadoIcon(p.estado)}"></i> ${p.estado}
        </span>
      </td>
      <td>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-info btn-icon-compact" data-action="view" title="Ver"><i class="bi bi-eye"></i></button>
          ${p.estado !== 'revisado' ? `
            <button class="btn btn-sm btn-outline-success btn-icon-compact" data-action="approve" title="Aprobar"><i class="bi bi-check-lg"></i></button>
          ` : ''}
        </div>
      </td>
    </tr>
  `
}

function _getMaestrosOptions() {
  const maestros = [...new Set(state.planificaciones.map(p => p.maestro_nombre).filter(Boolean))].sort()
  return maestros.map(m => `<option value="${m}" ${state.filtroMaestro === m ? 'selected' : ''}>${m}</option>`).join('')
}

function _bindEvents(container) {
  container.querySelector('#buscarPlan')?.addEventListener('input', (e) => {
    state.buscar = e.target.value
    _render(container)
  })

  container.querySelector('#filtroEstado')?.addEventListener('change', (e) => {
    state.filtroEstado = e.target.value
    _render(container)
  })

  container.querySelector('#filtroMaestro')?.addEventListener('change', (e) => {
    state.filtroMaestro = e.target.value
    _render(container)
  })

  container.querySelector('#btnAprobarBulk')?.addEventListener('click', () => _openAprobacionBulk(container))
  container.querySelector('#btnExportar')?.addEventListener('click', () => _exportar())
  container.querySelector('#btnRefresh')?.addEventListener('click', async () => {
    await _loadData()
    _render(container)
    _bindEvents(container)
  })

  container.querySelector('tbody')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]')
    if (!btn) return
    
    const id = btn.closest('tr').dataset.id
    const action = btn.dataset.action

    if (action === 'view') _verDetalle(id)
    else if (action === 'approve') _aprobar(id, container)
  })
}

function _openAprobacionBulk(container) {
  const pendientes = state.planificaciones.filter(p => p.estado === 'planificado' || p.estado === 'ejecutado')

  if (!pendientes.length) {
    alert('No hay planificaciones pendientes de aprobación')
    return
  }

  AppModal.open({
    title: 'Aprobación Masiva de Planificaciones',
    size: 'lg',
    saveText: 'Aprobar Todas',
    body: `
      <div class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>
        Se aprobaron ${pendientes.length} planificaciones automáticamente.
      </div>
      <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
        <table class="table table-sm mb-0">
          <thead><tr><th>Tema</th><th>Maestro</th><th>Estado</th></tr></thead>
          <tbody>
            ${pendientes.slice(0, 10).map(p => `
              <tr>
                <td>${escapeHTML(p.tema)}</td>
                <td>${escapeHTML(p.maestro || '-')}</td>
                <td><span class="badge bg-secondary">${p.estado}</span></td>
              </tr>
            `).join('')}
            ${pendientes.length > 10 ? `<tr><td colspan="3" class="text-muted text-center">... y ${pendientes.length - 10} más</td></tr>` : ''}
          </tbody>
        </table>
      </div>
    `,
    onSave: async () => {
      try {
        const ids = pendientes.map(p => p.id)
        await marcarRevisadasMasivo(ids)
        
        state.planificaciones = state.planificaciones.map(p => {
          if (ids.includes(p.id)) {
            return { ...p, estado: 'revisado' }
          }
          return p
        })
        
        AppToast.success(`${ids.length} planificaciones aprobadas correctamente`)
        _render(container)
        _bindEvents(container)
        AppModal.close()
      } catch (err) {
        AppToast.error('Error al realizar la aprobación masiva')
      }
    },
  })
}

function _verDetalle(id) {
  const p = state.planificaciones.find(pl => pl.id === id)
  if (!p) return

  AppModal.open({
    title: escapeHTML(p.tema),
    size: 'lg',
    hideSave: true,
    cancelText: 'Cerrar',
    body: `
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Clase</label>
            <p class="form-control-plaintext">${escapeHTML(p.clase_nombre || 'Sin asignar')}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Maestro</label>
            <p class="form-control-plaintext">${escapeHTML(p.maestro_nombre || 'Sin asignar')}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Fecha de Inicio</label>
            <p class="form-control-plaintext">${p.fecha_inicio ? formatDate(p.fecha_inicio) : '-'}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Estado</label>
            <p class="form-control-plaintext">
              <span class="badge ${getEstadoBadgeClass(p.estado)}">
                <i class="bi ${getEstadoIcon(p.estado)}"></i> ${p.estado}
              </span>
            </p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Objetivos</label>
            <p class="form-control-plaintext">${escapeHTML(p.objetivos || 'Sin objetivos definidos')}</p>
          </div>
        </div>
      </div>
    `,
  })
}

async function _aprobar(id, container) {
  try {
    await marcarRevisada(id)
    const idx = state.planificaciones.findIndex(p => p.id === id)
    if (idx !== -1) {
      state.planificaciones[idx].estado = 'revisado'
      AppToast.success('Planificación aprobada')
      _render(container)
      _bindEvents(container)
    }
  } catch (err) {
    AppToast.error('Error al aprobar la planificación')
  }
}

function _exportar() {
  let csv = 'Tema,Clase,Maestro,Fecha,Estado,Objetivos\n'
  state.planificaciones.forEach(p => {
    csv += `"${p.tema}","${p.clase_nombre || ''}","${p.maestro_nombre || ''}","${p.fecha_inicio || ''}","${p.estado}","${(p.objetivos || '').replace(/"/g, '""')}"\n`
  })

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `planificaciones-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}