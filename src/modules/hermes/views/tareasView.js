/**
 * tareasView.js — Vista de Tareas Institucionales (Hermes).
 * Lee las tareas generadas por el motor de cascada y permite al staff
 * actualizar estado, checklist y feedback.
 *
 * Esquema real (tareas_institucionales):
 *   departamento: DIR|ACM|ADM|FIN|LOG|COM|TECNICO
 *   estado:       pendiente|en_progreso|completada|bloqueada|cancelada
 *   prioridad:    baja|media|alta|critica
 *   checklist:    [{ item, completado }]
 *   feedback:     TEXT
 *
 * Patrón: retorna { teardown() } para limpieza de listeners (AbortController).
 *
 * @param {HTMLElement} container
 * @param {object} [opciones]
 * @param {string} [opciones.departamento] — fija el portal a un departamento (ACM, FIN, ...)
 *                                            y oculta el filtro de departamento.
 * @param {boolean} [opciones.hideCalendarBtn] — reservado: oculta el botón "crear evento"
 *                  (solo la futura vista Score del Director lo mostrará). Hoy es no-op
 *                  porque la vista departamental no expone ese botón.
 */

import '../styles/tareas.css'
import * as tareasApi from '../api/tareasApi.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { AppModal } from '../../../shared/components/AppModal.js'

const DEPARTAMENTOS = {
  DIR: 'Dirección',
  ACM: 'Académica',
  ADM: 'Administración',
  FIN: 'Financiero',
  LOG: 'Logística',
  COM: 'Comunicaciones',
  TECNICO: 'Técnico',
}

const ESTADOS = {
  pendiente: { label: 'Pendiente', color: 'secondary' },
  en_progreso: { label: 'En Progreso', color: 'info' },
  completada: { label: 'Completada', color: 'success' },
  bloqueada: { label: 'Bloqueada', color: 'danger' },
  cancelada: { label: 'Cancelada', color: 'dark' },
}

const PRIORIDADES = {
  baja: { label: 'Baja', color: 'secondary', orden: 3 },
  media: { label: 'Media', color: 'info', orden: 2 },
  alta: { label: 'Alta', color: 'warning', orden: 1 },
  critica: { label: 'Crítica', color: 'danger', orden: 0 },
}

const state = {
  tareas: [],
  cargando: false,
  filtroEstado: 'todos',
  filtroDepartamento: 'todos',
  filtroPrioridad: 'todos',
  busqueda: '',
  departamentoFijo: null,
}

let _abortController = null

export async function renderTareasView(container, opciones = {}) {
  _abortController?.abort()
  _abortController = new AbortController()
  state.departamentoFijo = opciones.departamento || null

  try {
    state.cargando = true
    renderLoading(container)

    const tareas = state.departamentoFijo
      ? await tareasApi.getTareasByDepartamento(state.departamentoFijo)
      : await tareasApi.getTareas()
    state.tareas = tareas
    state.cargando = false

    renderContent(container)
    attachGlobalEvents(container)
  } catch (error) {
    console.error('[TareasView] Error:', error.message)
    renderError(container, error.message)
  }

  return { teardown: () => _abortController?.abort() }
}

function renderLoading(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando tareas institucionales...</p>
      </div>
    </div>
  `
}

function renderError(container, mensaje) {
  container.innerHTML = `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Error al cargar</h4>
            <p>${escapeHTML(mensaje)}</p>
            <hr>
            <button class="btn btn-primary" id="retryBtn">
              <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
  container.querySelector('#retryBtn')?.addEventListener(
    'click',
    () => renderTareasView(container, { departamento: state.departamentoFijo }),
    { signal: _abortController.signal },
  )
}

function renderContent(container) {
  const tareasFiltradas = filtrarTareas()
  const cuenta = (estado) => state.tareas.filter((t) => t.estado === estado).length
  const tituloPortal = state.departamentoFijo
    ? `Tareas — ${DEPARTAMENTOS[state.departamentoFijo] || state.departamentoFijo}`
    : 'Tareas Institucionales'

  container.innerHTML = `
    <div class="page-container">
      <div class="tareas-header mb-4">
        <div class="d-flex align-items-center gap-3 mb-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-check2-square fs-4"></i>
          </div>
          <div>
            <h1 class="tareas-title mb-0">${escapeHTML(tituloPortal)}</h1>
            <p class="text-muted small mb-0">Sistema Hermes · delegación automática</p>
          </div>
        </div>

        <div class="tareas-kpis d-flex gap-2 flex-wrap">
          <div class="kpi-card bg-secondary bg-opacity-10 p-2 rounded">
            <small class="text-muted">Pendientes</small>
            <div class="fs-5 fw-bold text-secondary">${cuenta('pendiente')}</div>
          </div>
          <div class="kpi-card bg-info bg-opacity-10 p-2 rounded">
            <small class="text-muted">En Progreso</small>
            <div class="fs-5 fw-bold text-info">${cuenta('en_progreso')}</div>
          </div>
          <div class="kpi-card bg-danger bg-opacity-10 p-2 rounded">
            <small class="text-muted">Bloqueadas</small>
            <div class="fs-5 fw-bold text-danger">${cuenta('bloqueada')}</div>
          </div>
          <div class="kpi-card bg-success bg-opacity-10 p-2 rounded">
            <small class="text-muted">Completadas</small>
            <div class="fs-5 fw-bold text-success">${cuenta('completada')}</div>
          </div>
        </div>
      </div>

      <div class="tareas-filters mb-4 d-flex gap-2 flex-wrap">
        <div class="flex-grow-1" style="min-width: 200px;">
          <input type="text" class="form-control form-control-sm" id="buscarTarea"
            placeholder="🔍 Buscar tarea..." autocomplete="off" value="${escapeHTML(state.busqueda)}">
        </div>
        <select class="form-select form-select-sm" id="filtroEstado" style="max-width: 150px;">
          <option value="todos">Todos Estados</option>
          ${Object.entries(ESTADOS)
            .map(([k, v]) => `<option value="${k}" ${state.filtroEstado === k ? 'selected' : ''}>${v.label}</option>`)
            .join('')}
        </select>
        ${
          state.departamentoFijo
            ? ''
            : `<select class="form-select form-select-sm" id="filtroDepartamento" style="max-width: 160px;">
                 <option value="todos">Todos Departamentos</option>
                 ${Object.entries(DEPARTAMENTOS)
                   .map(([k, v]) => `<option value="${k}" ${state.filtroDepartamento === k ? 'selected' : ''}>${v}</option>`)
                   .join('')}
               </select>`
        }
        <select class="form-select form-select-sm" id="filtroPrioridad" style="max-width: 130px;">
          <option value="todos">Toda Prioridad</option>
          ${Object.entries(PRIORIDADES)
            .map(([k, v]) => `<option value="${k}" ${state.filtroPrioridad === k ? 'selected' : ''}>${v.label}</option>`)
            .join('')}
        </select>
      </div>

      <div id="tareasList" class="tareas-list">
        ${
          tareasFiltradas.length === 0
            ? `<div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> No hay tareas que cumplan con los filtros</div>`
            : tareasFiltradas.map(renderTareaCard).join('')
        }
      </div>
    </div>
  `
}

function renderTareaCard(tarea) {
  const estado = ESTADOS[tarea.estado] || ESTADOS.pendiente
  const prioridad = PRIORIDADES[tarea.prioridad] || PRIORIDADES.media
  const checklist = Array.isArray(tarea.checklist) ? tarea.checklist : []
  const hechos = checklist.filter((c) => c.completado).length
  const total = checklist.length
  const pct = total > 0 ? (hechos / total) * 100 : 0

  const dias = tarea.fecha_vencimiento
    ? Math.ceil((new Date(tarea.fecha_vencimiento) - new Date()) / 86400000)
    : null
  const vencClass = dias === null ? 'text-muted' : dias < 0 ? 'text-danger' : dias < 3 ? 'text-warning' : 'text-muted'

  return `
    <div class="tarea-card card border-0 mb-3 shadow-sm" data-tarea-id="${tarea.id}">
      <div class="card-body p-3">
        <div class="d-flex align-items-start gap-3">
          <div class="flex-shrink-0">
            <span class="badge bg-${prioridad.color}" title="${prioridad.label}">${prioridad.label}</span>
          </div>
          <div class="flex-grow-1">
            <h5 class="card-title mb-1">${escapeHTML(tarea.titulo)}</h5>
            <p class="card-text text-muted small mb-2">${escapeHTML(tarea.descripcion || '')}</p>
            <div class="d-flex flex-wrap gap-3 mb-2 small">
              <span class="text-muted"><i class="bi bi-building"></i> ${DEPARTAMENTOS[tarea.departamento] || tarea.departamento}</span>
              ${tarea.fecha_vencimiento ? `<span class="${vencClass}"><i class="bi bi-calendar"></i> ${tarea.fecha_vencimiento}${dias !== null && dias < 0 ? ' (vencida)' : ''}</span>` : ''}
              ${tarea.event_id ? `<span class="text-muted"><i class="bi bi-link-45deg"></i> Evento</span>` : ''}
            </div>
            ${
              total > 0
                ? `<div class="mb-1">
                     <div class="d-flex justify-content-between align-items-center mb-1">
                       <small class="text-muted">Checklist</small>
                       <small class="text-muted">${hechos}/${total}</small>
                     </div>
                     <div class="progress" style="height: 6px;">
                       <div class="progress-bar bg-${estado.color}" style="width: ${pct}%;"></div>
                     </div>
                   </div>`
                : ''
            }
          </div>
          <div class="flex-shrink-0 text-end">
            <div class="mb-2"><span class="badge bg-${estado.color}">${estado.label}</span></div>
            <button class="btn btn-sm btn-outline-primary btn-detalle" data-tarea-id="${tarea.id}" title="Ver detalles">
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
}

function filtrarTareas() {
  let res = [...state.tareas]
  if (state.filtroEstado !== 'todos') res = res.filter((t) => t.estado === state.filtroEstado)
  if (!state.departamentoFijo && state.filtroDepartamento !== 'todos') {
    res = res.filter((t) => t.departamento === state.filtroDepartamento)
  }
  if (state.filtroPrioridad !== 'todos') res = res.filter((t) => t.prioridad === state.filtroPrioridad)
  if (state.busqueda) {
    const q = state.busqueda.toLowerCase()
    res = res.filter(
      (t) => t.titulo.toLowerCase().includes(q) || (t.descripcion || '').toLowerCase().includes(q),
    )
  }
  res.sort((a, b) => (PRIORIDADES[a.prioridad]?.orden ?? 9) - (PRIORIDADES[b.prioridad]?.orden ?? 9))
  return res
}

function attachGlobalEvents(container) {
  const signal = _abortController.signal
  const rerender = () => {
    renderContent(container)
    attachGlobalEvents(container)
  }

  const buscar = container.querySelector('#buscarTarea')
  buscar?.addEventListener(
    'input',
    (e) => {
      state.busqueda = e.target.value
      const list = container.querySelector('#tareasList')
      const filtradas = filtrarTareas()
      list.innerHTML =
        filtradas.length === 0
          ? `<div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> No hay tareas que cumplan con los filtros</div>`
          : filtradas.map(renderTareaCard).join('')
      attachCardEvents(container)
    },
    { signal },
  )

  container.querySelector('#filtroEstado')?.addEventListener('change', (e) => {
    state.filtroEstado = e.target.value
    rerender()
  }, { signal })

  container.querySelector('#filtroDepartamento')?.addEventListener('change', (e) => {
    state.filtroDepartamento = e.target.value
    rerender()
  }, { signal })

  container.querySelector('#filtroPrioridad')?.addEventListener('change', (e) => {
    state.filtroPrioridad = e.target.value
    rerender()
  }, { signal })

  attachCardEvents(container)
}

function attachCardEvents(container) {
  const signal = _abortController.signal
  container.querySelectorAll('.btn-detalle').forEach((btn) => {
    btn.addEventListener(
      'click',
      () => {
        const tarea = state.tareas.find((t) => t.id === btn.dataset.tareaId)
        if (tarea) openTareaModal(container, tarea)
      },
      { signal },
    )
  })
}

function openTareaModal(container, tarea) {
  const prioridad = PRIORIDADES[tarea.prioridad] || PRIORIDADES.media
  const checklist = Array.isArray(tarea.checklist) ? tarea.checklist : []

  AppModal.open({
    title: tarea.titulo,
    size: 'lg',
    body: `
      <div class="modal-tarea-content">
        <p>${escapeHTML(tarea.descripcion || '')}</p>
        <div class="row mb-3">
          <div class="col-md-4"><strong>Departamento</strong><p>${DEPARTAMENTOS[tarea.departamento] || tarea.departamento}</p></div>
          <div class="col-md-4"><strong>Prioridad</strong><p><span class="badge bg-${prioridad.color}">${prioridad.label}</span></p></div>
          <div class="col-md-4"><strong>Vencimiento</strong><p>${tarea.fecha_vencimiento || '—'}</p></div>
        </div>

        <div class="mb-3">
          <strong>Estado</strong>
          <select class="form-select form-select-sm mt-1" id="modalEstado">
            ${Object.entries(ESTADOS)
              .map(([k, v]) => `<option value="${k}" ${tarea.estado === k ? 'selected' : ''}>${v.label}</option>`)
              .join('')}
          </select>
        </div>

        ${
          checklist.length > 0
            ? `<div class="mb-3">
                 <strong>Checklist</strong>
                 <div class="list-group list-group-flush mt-1" id="modalChecklist">
                   ${checklist
                     .map(
                       (c, i) => `
                     <label class="list-group-item px-0 d-flex align-items-center gap-2">
                       <input class="form-check-input m-0 chk-item" type="checkbox" data-idx="${i}" ${c.completado ? 'checked' : ''}>
                       <span class="${c.completado ? 'text-decoration-line-through text-muted' : ''}">${escapeHTML(c.item)}</span>
                     </label>`,
                     )
                     .join('')}
                 </div>
               </div>`
            : ''
        }

        <div class="mb-2">
          <strong>Feedback / notas de cierre</strong>
          <textarea class="form-control form-control-sm mt-1" id="modalFeedback" rows="3"
            placeholder="Comentario del responsable...">${escapeHTML(tarea.feedback || '')}</textarea>
        </div>
      </div>
    `,
    saveText: 'Guardar cambios',
    onSave: async (modalBody) => {
      const nuevoEstado = modalBody.querySelector('#modalEstado').value
      const nuevoFeedback = modalBody.querySelector('#modalFeedback').value.trim()
      try {
        // Checklist: persistir cambios item por item
        const checks = modalBody.querySelectorAll('.chk-item')
        for (const chk of checks) {
          const idx = parseInt(chk.dataset.idx, 10)
          if (Boolean(checklist[idx]?.completado) !== chk.checked) {
            await tareasApi.updateChecklistItem(tarea.id, idx, chk.checked)
          }
        }
        if (nuevoEstado === 'completada') {
          await tareasApi.completarTarea(tarea.id, nuevoFeedback || null)
        } else {
          await tareasApi.updateTareaEstado(tarea.id, nuevoEstado)
          if (nuevoFeedback !== (tarea.feedback || '')) {
            await tareasApi.guardarFeedback(tarea.id, nuevoFeedback)
          }
        }
        AppToast.show('Tarea actualizada', 'success')
        await renderTareasView(container, { departamento: state.departamentoFijo })
      } catch (err) {
        AppToast.show(`Error: ${err.message}`, 'error')
      }
    },
  })
}

function escapeHTML(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
