import { Toast } from 'bootstrap'
import { AppModal } from '../../../shared/components/AppModal.js'
import { router } from '../../../core/router/router.js'
import {
  obtenerPlanificaciones,
  crearPlanificacion,
  actualizarPlanificacion,
  eliminarPlanificacion,
  marcarEjecutada,
  marcarRevisada,
} from '../api/planificacionApi.js'
import { enrichText, transcribeAndParse } from '../api/groqService.js'
import {
  formatDate,
  escapeHTML,
  formatEstado,
  getEstadoBadgeClass,
  getEstadoIcon,
  getInitials,
  parseRecursos,
} from '../utils/planificacionUtils.js'
import { openPlanificacionModal } from '../components/planificacionModal.js'
import { openRevisionModal } from '../components/revisionModal.js'
import { renderTareasPanel } from '../components/tareasPanel.js'

const state = {
  planificaciones: [],
  planificacionesOriginales: [],
  cargando: false,
  editando: null,
  filtroEstado: 'todos',
  filtroClase: '',
  clases: [],
  maestros: [],
  viewingId: null,
  deletingId: null,
}

export async function renderPlanificacionView(container) {
  try {
    state.cargando = true
    renderLoading(container)

    const planificaciones = await obtenerPlanificaciones()
    state.planificaciones = planificaciones
    state.planificacionesOriginales = [...planificaciones]
    state.cargando = false

    renderContent(container)
    attachGlobalEvents(container)
  } catch (error) {
    console.error(error)
    renderError(container, error.message)
  }
}

function renderLoading(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando planificaciones...</p>
      </div>
    </div>
  `
}

function renderError(container, mensaje) {
  const esErrorTabla = mensaje.includes('planificaciones') || mensaje.includes('relation') || mensaje.includes('does not exist')

  container.innerHTML = `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">
              <i class="bi bi-exclamation-triangle"></i> Error al cargar
            </h4>
            ${esErrorTabla ? `
              <p class="fw-bold">La tabla planificaciones no existe aún.</p>
              <p>Ejecute las migraciones primero para crear la tabla.</p>
              <hr>
              <p class="small">Detalles: ${escapeHTML(mensaje)}</p>
            ` : `
              <p>${escapeHTML(mensaje)}</p>
            `}
            <hr>
            <button class="btn btn-primary" id="retryBtn">
              <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
  document.getElementById('retryBtn')?.addEventListener('click', () => renderPlanificacionView(container))
}

function renderContent(container) {
  container.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div class="d-flex align-items-center gap-2">
          <span class="page-title"><i class="bi bi-journal-text me-2 text-primary"></i>Planificaciones</span>
          <span class="badge bg-secondary">${state.planificaciones.length}</span>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-outline-secondary btn-sm-compact" id="btnEnriquecer" title="✨ Enriquecer texto con IA">
            <i class="bi bi-magic"></i> ✨
          </button>
          <button class="btn btn-outline-secondary btn-sm-compact" id="btnVoz" title="🎤 Grabar y procesar voz">
            <i class="bi bi-mic"></i> 🎤
          </button>
          <button class="btn btn-outline-info btn-sm-compact" id="btnTareas" title="Ver tareas de alumnos">
            <i class="bi bi-clipboard-check"></i> Tareas
          </button>
          <button class="btn btn-outline-dark btn-sm-compact" id="btnVistaAdmin" title="Ver todas las planificaciones">
            <i class="bi bi-collection"></i> Admin
          </button>
          <button class="btn btn-primary btn-sm-compact" id="btnAgregarPlanificacion" title="Crear nueva planificación">
            <i class="bi bi-plus-lg"></i> Nueva
          </button>
        </div>
      </div>

      <div class="toolbar-dense mb-3">
        <div class="search-bar flex-grow-1" style="min-width: 180px;">
          <i class="bi bi-search"></i>
          <input type="text" class="form-control input-dense" placeholder="Buscar por tema, contenido u objetivos..." id="buscar" autocomplete="off">
        </div>
        <select class="form-select input-dense" id="filtroEstado" style="width: auto; min-width: 140px;">
          <option value="todos">Todos los estados</option>
          <option value="planificado">Planificado</option>
          <option value="ejecutado">Ejecutado</option>
          <option value="revisado">Revisado</option>
        </select>
      </div>

      <div class="table-scroll-container">
        <table class="table table-compact table-hover mb-0" id="planificacionesTable">
          <thead>
            <tr>
              <th style="width: 25%;">Tema</th>
              <th style="width: 12%;">Fecha Inicio</th>
              <th style="width: 10%;">Estado</th>
              <th style="width: 28%;">Objetivos</th>
              <th style="width: 15%;">Creado</th>
              <th style="width: 10%;" class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody id="planificacionesTBody">
            ${renderTableRows(state.planificaciones)}
          </tbody>
        </table>
        ${state.planificaciones.length === 0 ? renderEmpty() : ''}
      </div>

      <div class="mt-4" id="tareasSection" style="display: none;">
        <h6 class="fw-bold mb-3"><i class="bi bi-clipboard-check me-2 text-warning"></i>Tareas de Alumnos</h6>
        <div id="tareasPanelContainer"></div>
      </div>

      <div class="toast-container position-fixed top-0 end-0 p-3" id="toastContainer"></div>
    </div>
  `
}

function renderTableRows(planificaciones) {
  if (!planificaciones.length) return '<tr><td colspan="6" class="text-center text-muted py-3">No hay planificaciones</td></tr>'

  return planificaciones.map(p => `
    <tr data-id="${p.id}">
      <td>
        <div class="d-flex align-items-center gap-2">
          <div class="avatar-compact bg-primary text-white">${getInitials(p.tema)}</div>
          <span class="text-truncate" style="max-width: 180px;" title="${escapeHTML(p.tema)}">${escapeHTML(p.tema)}</span>
        </div>
      </td>
      <td>${p.fecha_inicio ? formatDate(p.fecha_inicio) : '-'}</td>
      <td>
        <span class="badge badge-compact ${getEstadoBadgeClass(p.estado)}">
          <i class="bi ${getEstadoIcon(p.estado)}"></i> ${formatEstado(p.estado)}
        </span>
      </td>
      <td class="text-truncate" style="max-width: 200px;" title="${escapeHTML(p.objetivos || '')}">
        ${p.objetivos ? escapeHTML(p.objetivos.substring(0, 50)) + (p.objetivos.length > 50 ? '...' : '') : '-'}
      </td>
      <td>${formatDate(p.created_at)}</td>
      <td class="text-end">
        <div class="quick-actions justify-content-end">
          <button class="btn btn-sm btn-outline-info btn-icon-compact" data-action="view" data-id="${p.id}" title="Ver detalles">
            <i class="bi bi-eye"></i>
          </button>
          ${p.estado === 'planificado' ? `
            <button class="btn btn-sm btn-outline-success btn-icon-compact" data-action="ejecutar" data-id="${p.id}" title="Marcar ejecutada">
              <i class="bi bi-check-lg"></i>
            </button>
          ` : ''}
          ${p.estado === 'ejecutado' ? `
            <button class="btn btn-sm btn-outline-info btn-icon-compact" data-action="revisar" data-id="${p.id}" title="Marcar revisada">
              <i class="bi bi-eye"></i>
            </button>
          ` : ''}
          <button class="btn btn-sm btn-outline-primary btn-icon-compact" data-action="edit" data-id="${p.id}" title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger btn-icon-compact" data-action="delete" data-id="${p.id}" title="Eliminar">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('')
}

function renderEmpty() {
  return `
    <div class="col-12 text-center py-5">
      <div class="mb-3">
        <i class="bi bi-journal-x" style="font-size: 3rem; color: var(--bs-secondary);"></i>
      </div>
      <h4>No hay planificaciones</h4>
      <p class="text-muted">Crea tu primera planificación haciendo clic en el botón "Nueva"</p>
    </div>
  `
}

function attachGlobalEvents(container) {
  document.getElementById('btnAgregarPlanificacion')?.addEventListener('click', () => {
    openCreateModal()
  })

  document.getElementById('btnEnriquecer')?.addEventListener('click', () => {
    openEnriquecerModal()
  })

  document.getElementById('btnVoz')?.addEventListener('click', () => {
    iniciarGrabacion()
  })

  document.getElementById('btnTareas')?.addEventListener('click', () => {
    toggleTareasPanel()
  })

  document.getElementById('btnVistaAdmin')?.addEventListener('click', () => {
    router.navigate('planificacion-maestros')
  })

  const searchInput = document.getElementById('buscar')
  searchInput?.addEventListener('input', applyFilters)

  document.getElementById('filtroEstado')?.addEventListener('change', applyFilters)

  const tbody = document.getElementById('planificacionesTBody')
  tbody?.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]')
    if (!btn) return
    const id = btn.dataset.id
    const action = btn.dataset.action

    if (action === 'view') {
      openViewModal(id)
    } else if (action === 'edit') {
      openEditModal(id)
    } else if (action === 'delete') {
      openDeleteModal(id)
    } else if (action === 'ejecutar') {
      await handleMarcarEjecutada(id)
    } else if (action === 'revisar') {
      await handleMarcarRevisada(id)
    }
  })

}

function applyFilters() {
  const searchTerm = document.getElementById('buscar')?.value.trim().toLowerCase() || ''
  const filtroEstado = document.getElementById('filtroEstado')?.value || 'todos'

  state.planificaciones = state.planificacionesOriginales.filter(p => {
    const matchSearch = !searchTerm ||
      (p.tema || '').toLowerCase().includes(searchTerm) ||
      (p.contenido || '').toLowerCase().includes(searchTerm) ||
      (p.objetivos || '').toLowerCase().includes(searchTerm) ||
      (p.observaciones || '').toLowerCase().includes(searchTerm)

    const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado

    return matchSearch && matchEstado
  })

  refreshTable()
}

function openCreateModal() {
  state.editando = null
  openPlanificacionModal('create', null, state.clases, state.maestros, async (datos) => {
    const nueva = await crearPlanificacion(datos)
    state.planificacionesOriginales.unshift(nueva)
    applyFilters()
    showToast('Planificación creada exitosamente', 'success')
  })
}

function openEditModal(id) {
  const plan = state.planificacionesOriginales.find(p => p.id === id)
  if (!plan) { showToast('Planificación no encontrada', 'error'); return }

  state.editando = id
  openPlanificacionModal('edit', plan, state.clases, state.maestros, async (datos) => {
    await actualizarPlanificacion(id, datos)
    const idx = state.planificacionesOriginales.findIndex(p => p.id === id)
    if (idx !== -1) state.planificacionesOriginales[idx] = { ...state.planificacionesOriginales[idx], ...datos }
    applyFilters()
    showToast('Planificación actualizada correctamente', 'success')
  })
}

function openViewModal(id) {
  const plan = state.planificacionesOriginales.find(p => p.id === id)
  if (!plan) {
    showToast('Planificación no encontrada', 'error')
    return
  }

  const recursosList = parseRecursos(plan.recursos)

  AppModal.open({
    title: escapeHTML(plan.tema),
    size: 'lg',
    hideSave: true,
    cancelText: 'Cerrar',
    body: `
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Tema</label>
            <p class="form-control-plaintext">${escapeHTML(plan.tema)}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Clase</label>
            <p class="form-control-plaintext">${escapeHTML(plan.clase_id || 'Sin asignar')}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Maestro</label>
            <p class="form-control-plaintext">${escapeHTML(plan.maestro_id || 'Sin asignar')}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Fecha de Inicio</label>
            <p class="form-control-plaintext">${formatDate(plan.fecha_inicio)}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Estado</label>
            <p class="form-control-plaintext">
              <span class="badge ${getEstadoBadgeClass(plan.estado)}">
                <i class="bi ${getEstadoIcon(plan.estado)}"></i> ${formatEstado(plan.estado)}
              </span>
            </p>
          </div>
        </div>
        <div class="col-md-6">
          ${plan.objetivos ? `
            <div class="mb-3">
              <label class="form-label fw-bold">Objetivos</label>
              <p class="form-control-plaintext">${escapeHTML(plan.objetivos)}</p>
            </div>
          ` : ''}
          ${plan.contenido ? `
            <div class="mb-3">
              <label class="form-label fw-bold">Contenido</label>
              <p class="form-control-plaintext">${escapeHTML(plan.contenido)}</p>
            </div>
          ` : ''}
          ${recursosList.length > 0 ? `
            <div class="mb-3">
              <label class="form-label fw-bold">Recursos</label>
              <div class="d-flex flex-wrap gap-1">
                ${recursosList.map(r => `<span class="badge badge-compact bg-secondary">${escapeHTML(r)}</span>`).join('')}
              </div>
            </div>
          ` : ''}
          ${plan.evaluacion_metodo ? `
            <div class="mb-3">
              <label class="form-label fw-bold">Método de Evaluación</label>
              <p class="form-control-plaintext">${escapeHTML(plan.evaluacion_metodo)}</p>
            </div>
          ` : ''}
          ${plan.observaciones ? `
            <div class="mb-3">
              <label class="form-label fw-bold">Observaciones</label>
              <p class="form-control-plaintext">${escapeHTML(plan.observaciones)}</p>
            </div>
          ` : ''}
        </div>
      </div>
      <hr>
      <div class="row">
        <div class="col-6">
          <label class="form-label fw-bold">Creado</label>
          <p class="form-control-plaintext small">${formatDate(plan.created_at)}</p>
        </div>
        <div class="col-6">
          <label class="form-label fw-bold">Última actualización</label>
          <p class="form-control-plaintext small">${formatDate(plan.updated_at)}</p>
        </div>
      </div>
    `,
  })
}

function openDeleteModal(id) {
  const plan = state.planificacionesOriginales.find(p => p.id === id)
  if (!plan) { showToast('Planificación no encontrada', 'error'); return }

  AppModal.open({
    title:    'Eliminar planificación',
    size:     'sm',
    saveText: 'Eliminar',
    body: `
      <p class="mb-2">¿Eliminar esta planificación?</p>
      <p class="fw-bold text-danger mb-1">${escapeHTML(plan.tema)}</p>
      <small class="text-muted">Esta acción no se puede deshacer.</small>
    `,
    onSave: async () => {
      await eliminarPlanificacion(id)
      state.planificacionesOriginales = state.planificacionesOriginales.filter(p => p.id !== id)
      applyFilters()
      showToast('Planificación eliminada correctamente', 'success')
    },
  })
}

async function handleMarcarEjecutada(id) {
  try {
    const actualizada = await marcarEjecutada(id)
    const idx = state.planificacionesOriginales.findIndex(p => p.id === id)
    if (idx !== -1) {
      state.planificacionesOriginales[idx] = actualizada
    }
    applyFilters()
    showToast('Planificación marcada como ejecutada', 'success')
  } catch (error) {
    showToast(error.message || 'Error al actualizar', 'error')
  }
}

async function handleMarcarRevisada(id) {
  try {
    const actualizada = await marcarRevisada(id)
    const idx = state.planificacionesOriginales.findIndex(p => p.id === id)
    if (idx !== -1) {
      state.planificacionesOriginales[idx] = actualizada
    }
    applyFilters()
    showToast('Planificación marcada como revisada', 'success')
  } catch (error) {
    showToast(error.message || 'Error al actualizar', 'error')
  }
}

function refreshTable() {
  const tbody = document.getElementById('planificacionesTBody')
  if (!tbody) return

  if (state.planificaciones.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">No hay planificaciones</td></tr>'
  } else {
    tbody.innerHTML = renderTableRows(state.planificaciones)
  }
}

function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer')
  if (!toastContainer) return

  const toastId = 'toast-' + Date.now()
  const bgClass = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-info'
  const iconClass = type === 'success' ? 'bi-check-circle' : type === 'error' ? 'bi-exclamation-circle' : 'bi-info-circle'

  const toastHTML = `
    <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header ${bgClass} text-white">
        <i class="bi ${iconClass} me-2"></i>
        <strong class="me-auto">${type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : 'Información'}</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">
        ${escapeHTML(message)}
      </div>
    </div>
  `

  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = toastHTML
  const toastElement = tempDiv.firstElementChild
  toastContainer.appendChild(toastElement)

  const bootstrapToast = new Toast(toastElement, { autohide: true, delay: 3000 })
  bootstrapToast.show()

  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove()
  })
}

function openEnriquecerModal() {
  let currentText = ''

  AppModal.open({
    title: '✨ Enriquecer con IA',
    size: 'lg',
    saveText: 'Procesar',
    body: `
      <div class="mb-3">
        <label class="form-label">Escribe el registro de clase del maestro:</label>
        <textarea class="form-control" id="inputEnriquecer" rows="5" placeholder="Ej: hoy dimos escala do con pedro se porto mal..."></textarea>
        <small class="text-muted">La IA lo estructurará en formato DSL automáticamente.</small>
      </div>
    `,
    onSave: async () => {
      currentText = document.getElementById('inputEnriquecer')?.value || ''
      if (!currentText.trim()) {
        showToast('Escribe algo para enriquecer', 'error')
        return
      }

      AppModal.showLoading('Enriqueciendo con IA...')

      const result = await enrichText(currentText)

      if (result.success) {
        openRevisionModal(
          currentText,
          result.dsl,
          (dslAceptado) => {
            showToast('DSL aceptado. Listo para guardar en la planificación.', 'success')
          }
        )
      } else {
        showToast(result.message || 'Error al enriquecer', 'error')
      }
    },
  })
}

let mediaRecorder = null
let audioChunks = []

async function iniciarGrabacion() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []

    mediaRecorder.ondataavailable = (e) => {
      audioChunks.push(e.data)
    }

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
      stream.getTracks().forEach(track => track.stop())

      AppModal.showLoading('Procesando voz... 🎤')

      const result = await transcribeAndParse(audioBlob)

      if (result.success) {
        openRevisionModal(
          result.transcript,
          result.dsl,
          (dslAceptado) => {
            showToast('DSL aceptado. Listo para guardar.', 'success')
          }
        )
      } else {
        showToast(result.message || 'Error al procesar voz', 'error')
      }
    }

    mediaRecorder.start()
    showToast('Grabando... 🎤 Haz clic para detener', 'info')

    setTimeout(() => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop()
      }
    }, 5000)
  } catch (error) {
    console.error('Error accessing microphone:', error)
    showToast('No se pudo acceder al micrófono', 'error')
  }
}

function toggleTareasPanel() {
  const section = document.getElementById('tareasSection')
  const container = document.getElementById('tareasPanelContainer')

  if (section.style.display === 'none') {
    renderTareasPanel(container)
    section.style.display = 'block'
  } else {
    section.style.display = 'none'
  }
}