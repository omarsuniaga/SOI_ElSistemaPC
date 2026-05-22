import '../styles/observaciones.css'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import {
  obtenerObservaciones,
  crearObservacion,
  actualizarObservacion,
  eliminarObservacion,
  agregarSeguimiento,
  resolverObservacion,
  getEstadisticas,
} from '../api/observacionesApi.js'
import { obtenerAlumnos } from '../../alumnos/api/alumnosApi.js'
import {
  escapeHTML,
} from '../utils/observacionesUtils.js'
import { Observacion } from '../models/observacion.model.js'

const state = {
  observaciones: [],
  observacionesOriginales: [],
  alumnos: [],
  estadisticas: null,
  cargando: false,
  filtroTipo: '',
  filtroEstado: 'todos',
  container: null
}

/**
 * Vista de Observaciones - Refactored (Phase 10)
 */
export async function renderObservacionesView(container) {
  if (!container) return
  try {
    state.container = container
    state.cargando = true
    renderLoading(container)

    const [observaciones, alumnos, stats] = await Promise.all([
      obtenerObservaciones(),
      obtenerAlumnos().catch(() => []),
      getEstadisticas().catch(() => null)
    ])

    state.observaciones = observaciones
    state.observacionesOriginales = [...observaciones]
    state.alumnos = alumnos
    state.estadisticas = stats
    state.cargando = false

    renderContent(container)
    _attachEvents(container)
  } catch (error) {
    console.error(error)
    renderError(container, error.message)
  }
}

function renderLoading(container) {
  container.innerHTML = `<div class="d-flex justify-content-center align-items-center" style="min-height: 400px;"><div class="spinner-border text-primary" role="status"></div></div>`
}

function renderError(container, msg) {
  container.innerHTML = `
    <div class="page-container">
      <div class="alert alert-warning d-flex align-items-start gap-3 m-0" role="alert">
        <i class="bi bi-database-exclamation fs-3 text-warning mt-1"></i>
        <div>
          <h5 class="alert-heading mb-1">Tabla no encontrada o sin acceso</h5>
          <p class="mb-2 small">${escapeHTML(msg)}</p>
          <p class="mb-0 small text-muted">Verificá que la tabla <code>observaciones_alumnos</code> existe en Supabase y que las políticas RLS permiten la lectura.</p>
          <button class="btn btn-outline-warning btn-sm mt-3" id="retry-btn">
            <i class="bi bi-arrow-clockwise me-1"></i>Reintentar
          </button>
        </div>
      </div>
    </div>`
  container.querySelector('#retry-btn')?.addEventListener('click', () => renderObservacionesView(container))
}

function renderContent(container) {
  container.innerHTML = `
    <div class="page-container">
      <div class="observaciones-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-clipboard2-pulse fs-4"></i>
          </div>
          <div>
            <h1 class="observaciones-title-premium page-title mb-0">Observaciones</h1>
            <p class="text-muted small mb-0">${state.observaciones.length} observaciones en total</p>
          </div>
        </div>
        <div class="observaciones-header-actions">
          <button class="btn btn-premium-action" id="btn-nueva-obs">
            <i class="bi bi-plus-lg me-1.5"></i>Nueva Observación
          </button>
        </div>
      </div>

      <!-- Panel de Estadísticas / KPIs Premium -->
      <div class="stats-panel mb-4">
        <div class="stats-grid">
          <div class="stat-card stat-total border-start border-4 border-primary">
            <div class="stat-label">Abiertas</div>
            <div class="stat-value">${state.estadisticas?.abiertas || 0}</div>
          </div>
          <div class="stat-card stat-justified border-start border-4 border-warning">
            <div class="stat-label">Seguimiento</div>
            <div class="stat-value">${state.estadisticas?.seguimiento || 0}</div>
          </div>
          <div class="stat-card stat-absent border-start border-4 border-danger">
            <div class="stat-label">Alta Prioridad</div>
            <div class="stat-value">${state.estadisticas?.altas || 0}</div>
          </div>
          <div class="stat-card stat-present border-start border-4 border-success">
            <div class="stat-label">Total</div>
            <div class="stat-value">${state.estadisticas?.total || 0}</div>
          </div>
        </div>
      </div>

      <div class="observaciones-filter-toolbar mb-4">
        <div class="premium-search-container flex-grow-1">
          <i class="bi bi-search search-icon-muted"></i>
          <input type="text" class="form-control premium-search-input" placeholder="Buscar observación..." id="buscar-obs">
        </div>
        <div class="premium-select-container select-tipo-container">
          <i class="bi bi-funnel select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="select-tipo">
            <option value="">Todos los tipos</option>
            ${Observacion.getTipos().map(t => `<option value="${t.value}">${t.label}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="page-glass rounded">
        <div class="table-responsive">
          <table class="table table-compact table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Alumno / Título</th>
                <th class="d-none d-md-table-cell">Tipo / Prioridad</th>
                <th>Estado</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody id="obs-tbody">
              ${renderTableRows(state.observaciones)}
            </tbody>
          </table>
        </div>
        <div id="empty-container">${state.observaciones.length === 0 ? renderEmpty() : ''}</div>
      </div>
    </div>
  `
}

function renderTableRows(progs) {
  return progs.map(o => {
    const tipo = Observacion.getTipos().find(t => t.value === o.tipo)
    const prio = Observacion.getPrioridades().find(p => p.value === o.prioridad)
    const estado = Observacion.getEstados().find(e => e.value === o.estado)

    const accentClass = o.prioridad === 'alta' 
      ? 'border-accent-danger' 
      : o.prioridad === 'media' 
        ? 'border-accent-warning' 
        : 'border-accent-secondary'
    
    return `
      <tr data-id="${o.id}" class="border-start-accent ${accentClass}">
        <td>
          <div class="fw-bold text-truncate" style="max-width: 250px;">${escapeHTML(o.titulo)}</div>
          <div class="small text-muted">${escapeHTML(o.alumno_nombre)}</div>
        </td>
        <td class="d-none d-md-table-cell align-middle">
          <div class="d-flex align-items-center gap-2">
            <i class="bi ${tipo?.icon || 'bi-info-circle'} text-muted"></i>
            <span class="small ${prio?.color} fw-bold">${prio?.label || o.prioridad}</span>
          </div>
        </td>
        <td class="align-middle">
          <span class="badge badge-compact ${estado?.color}">${estado?.label || o.estado}</span>
        </td>
        <td class="text-end align-middle">
          <div class="quick-actions justify-content-end">
            <button class="btn btn-sm btn-outline-warning btn-icon-compact" data-action="follow" data-id="${o.id}" title="Seguimiento">
              <i class="bi bi-arrow-repeat"></i>
            </button>
            <button class="btn btn-sm btn-outline-primary btn-icon-compact" data-action="edit" data-id="${o.id}" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger btn-icon-compact" data-action="delete" data-id="${o.id}" title="Eliminar">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `
  }).join('')
}

function renderEmpty() {
  return `<div class="text-center py-5 text-muted"><i class="bi bi-chat-left-dots fs-1 d-block mb-2"></i>No se encontraron observaciones.</div>`
}

function _attachEvents(container) {
  container.querySelector('#buscar-obs')?.addEventListener('input', _applyFilters)
  container.querySelector('#select-tipo')?.addEventListener('change', _applyFilters)

  container.querySelector('#obs-tbody')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]')
    if (!btn) return
    const { action, id } = btn.dataset
    if (action === 'edit') openEditModal(id)
    if (action === 'delete') openDeleteModal(id)
    if (action === 'follow') openFollowUpModal(id)
  })

  container.querySelector('#btn-nueva-obs')?.addEventListener('click', () => openEditModal(null))
}

function _applyFilters() {
  const term = state.container.querySelector('#buscar-obs').value.toLowerCase()
  const tipo = state.container.querySelector('#select-tipo').value

  state.observaciones = state.observacionesOriginales.filter(o => {
    const matchSearch = o.titulo.toLowerCase().includes(term) || o.alumno_nombre.toLowerCase().includes(term)
    const matchTipo = !tipo || o.tipo === tipo
    return matchSearch && matchTipo
  })

  state.container.querySelector('#obs-tbody').innerHTML = renderTableRows(state.observaciones)
}

async function openEditModal(id) {
  const obs = id ? state.observacionesOriginales.find(o => o.id === id) : new Observacion()
  
  AppModal.open({
    title: id ? 'Editar Observación' : 'Nueva Observación',
    saveText: 'Guardar',
    body: `
      <form id="form-obs" class="row g-3">
        <div class="col-12">
          <label class="form-label-compact">Alumno *</label>
          <select class="form-select input-dense" id="obs-alumno_id" required>
            <option value="">Seleccionar alumno...</option>
            ${state.alumnos.map(a => `<option value="${a.id}" ${a.id === obs.alumno_id ? 'selected' : ''}>${escapeHTML(a.nombre_completo)}</option>`).join('')}
          </select>
        </div>
        <div class="col-md-8">
          <label class="form-label-compact">Título de la Incidencia *</label>
          <input type="text" class="form-control input-dense" id="obs-titulo" value="${escapeHTML(obs.titulo)}" required>
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Prioridad</label>
          <select class="form-select input-dense" id="obs-prioridad">
            ${Observacion.getPrioridades().map(p => `<option value="${p.value}" ${p.value === obs.prioridad ? 'selected' : ''}>${p.label}</option>`).join('')}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Tipo</label>
          <select class="form-select input-dense" id="obs-tipo">
            ${Observacion.getTipos().map(t => `<option value="${t.value}" ${t.value === obs.tipo ? 'selected' : ''}>${t.label}</option>`).join('')}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Fecha</label>
          <input type="date" class="form-control input-dense" id="obs-fecha" value="${obs.fecha_observacion || new Date().toISOString().split('T')[0]}">
        </div>
        <div class="col-12">
          <label class="form-label-compact">Descripción Detallada *</label>
          <textarea class="form-control input-dense" id="obs-descripcion" rows="4" required>${escapeHTML(obs.descripcion)}</textarea>
        </div>
      </form>
    `,
    onSave: async (modalBody) => {
      const data = {
        alumno_id: modalBody.querySelector('#obs-alumno_id').value,
        titulo: modalBody.querySelector('#obs-titulo').value.trim(),
        prioridad: modalBody.querySelector('#obs-prioridad').value,
        tipo: modalBody.querySelector('#obs-tipo').value,
        fecha_observacion: modalBody.querySelector('#obs-fecha').value,
        descripcion: modalBody.querySelector('#obs-descripcion').value.trim()
      }

      const model = new Observacion(data)
      const errores = model.validate()
      if (errores.length > 0) {
        AppToast.error(errores[0])
        return false
      }

      try {
        if (id) {
          await actualizarObservacion(id, data)
          AppToast.success('Observación actualizada')
        } else {
          await crearObservacion(data)
          AppToast.success('Observación registrada')
        }
        renderObservacionesView(state.container)
        return true
      } catch (err) {
        AppToast.error(err.message)
        return false
      }
    }
  })
}

function openFollowUpModal(id) {
  const obs = state.observacionesOriginales.find(o => o.id === id)
  AppModal.open({
    title: 'Añadir Seguimiento',
    saveText: 'Guardar Seguimiento',
    body: `
      <p class="small text-muted mb-3">Estás añadiendo una nota de seguimiento a: <strong>${escapeHTML(obs.titulo)}</strong></p>
      <div class="mb-3">
        <label class="form-label-compact">Nota de seguimiento</label>
        <textarea class="form-control input-dense" id="follow-obs" rows="4" placeholder="Describe las acciones tomadas..."></textarea>
      </div>
    `,
    onSave: async (modalBody) => {
      const nota = modalBody.querySelector('#follow-obs').value.trim()
      if (!nota) {
        AppToast.error('La nota es obligatoria')
        return false
      }
      try {
        await agregarSeguimiento(id, nota)
        AppToast.success('Seguimiento registrado')
        renderObservacionesView(state.container)
        return true
      } catch (err) {
        AppToast.error(err.message)
        return false
      }
    }
  })
}

function openDeleteModal(id) {
  const obs = state.observacionesOriginales.find(o => o.id === id)
  AppModal.open({
    title: '⚠️ Eliminar Observación',
    saveText: 'Eliminar',
    body: `<p>¿Estás seguro de eliminar "${escapeHTML(obs.titulo)}"?</p>`,
    onSave: async () => {
      await eliminarObservacion(id)
      renderObservacionesView(state.container)
      return true
    }
  })
}
