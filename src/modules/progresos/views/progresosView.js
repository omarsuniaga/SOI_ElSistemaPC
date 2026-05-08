import { Toast } from 'bootstrap'
import { AppModal } from '../../../shared/components/AppModal.js'
// Note: Bootstrap Modal removed — all dialogs use AppModal singleton
import {
  obtenerProgresos,
  obtenerAlumnos,
  obtenerClases,
  obtenerMaestros,
  crearProgreso,
  actualizarProgreso,
  eliminarProgreso,
  exportarBoletinPDF,
} from '../api/progresosApi.js'
import {
  formatDate,
  escapeHTML,
  formatCalificacion,
  getCalificacionColor,
  getCalificacionLabel,
  getTipoLabel,
  getTipoBadgeClass,
  getEstadoClass,
  getEstadoLabel,
  getInitials,
  calcularPromedio,
  getRiesgo,
  getConsistentColor,
} from '../utils/progresosUtils.js'
import { Progreso } from '../models/progreso.model.js'

const state = {
  progresos: [],
  progresosOriginales: [],
  alumnos: [],
  clases: [],
  maestros: [],
  cargando: false,
  filtroTipo: '',
  filtroEstado: 'todos',
  filtroClase: '',
}

function openCalificacionModal(mode, container, data = null) {
  const modalId = 'modalCalificacion'
  const isEdit = mode === 'edit' && data

  const tiposOptions = Progreso.getTiposEvaluacion()
    .map(t => `<option value="${t.value}">${t.label}</option>`)
    .join('')

  const estadosOptions = Progreso.getEstados()
    .map(e => `<option value="${e.value}">${e.label}</option>`)
    .join('')

  const alumnoOptions = state.alumnos.length
    ? state.alumnos.map(a => `<option value="${a.id}" ${isEdit && data.alumno_id === a.id ? 'selected' : ''}>${escapeHTML(a.name || a.nombre || 'Sin nombre')}</option>`).join('')
    : '<option value="">Cargando alumnos...</option>'

  const claseOptions = state.clases.length
    ? state.clases.map(c => `<option value="${c.id}" ${isEdit && data.clase_id === c.id ? 'selected' : ''}>${escapeHTML(c.nombre || 'Sin nombre')}</option>`).join('')
    : '<option value="">Cargando clases...</option>'

  const maestroOptions = state.maestros.length
    ? `<option value="">Sin asignar</option>` + state.maestros.map(m => `<option value="${m.id}" ${isEdit && data.maestro_id === m.id ? 'selected' : ''}>${escapeHTML(m.nombre || m.name || 'Sin nombre')}</option>`).join('')
    : '<option value="">Sin asignar</option>'

  const body = `
    <form id="formCalificacion" class="row g-2">
      <div class="col-md-6">
        <label class="form-label-compact">Alumno *</label>
        <select class="form-select input-dense" id="alumno_id" name="alumno_id" required>
          <option value="">Seleccionar</option>
          ${alumnoOptions}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Clase *</label>
        <select class="form-select input-dense" id="clase_id" name="clase_id" required>
          <option value="">Seleccionar</option>
          ${claseOptions}
        </select>
      </div>

      <div class="col-md-6">
        <label class="form-label-compact">Maestro</label>
        <select class="form-select input-dense" id="maestro_id" name="maestro_id">
          ${maestroOptions}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Fecha</label>
        <input type="date" class="form-control input-dense" id="fecha_evaluacion" name="fecha_evaluacion" value="${isEdit && data.fecha_evaluacion ? data.fecha_evaluacion : new Date().toISOString().split('T')[0]}">
      </div>

      <div class="col-md-6">
        <label class="form-label-compact">Tipo *</label>
        <select class="form-select input-dense" id="tipo_evaluacion" name="tipo_evaluacion" required>
          <option value="">Seleccionar</option>
          ${tiposOptions}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Calificacion (0-5)</label>
        <input type="number" class="form-control input-dense" id="calificacion" name="calificacion" min="0" max="5" step="0.01" placeholder="0.00" value="${isEdit && data.calificacion !== null ? data.calificacion : ''}">
        <small class="form-text text-muted" id="calificacionLabel"></small>
      </div>

      <div class="col-md-6">
        <label class="form-label-compact">Estado</label>
        <select class="form-select input-dense" id="estado" name="estado">
          ${estadosOptions}
        </select>
      </div>

      <div class="col-12">
        <label class="form-label-compact">Observaciones</label>
        <textarea class="form-control input-dense" id="observaciones" name="observaciones" rows="2" maxlength="500" placeholder="Notas adicionales...">${isEdit && data.observaciones ? escapeHTML(data.observaciones) : ''}</textarea>
        <small class="form-text text-muted" id="observacionesCount">${isEdit && data.observaciones ? data.observaciones.length : 0}/500</small>
      </div>
    </form>
  `

  AppModal.open({
    title:    isEdit ? 'Editar Calificación' : 'Nueva Calificación',
    body,
    saveText: 'Guardar',
    onSave:   async (bodyEl) => {
      const alumno_id      = bodyEl.querySelector('#alumno_id')?.value
      const clase_id       = bodyEl.querySelector('#clase_id')?.value
      const tipo_evaluacion= bodyEl.querySelector('#tipo_evaluacion')?.value

      if (!alumno_id)       { showToast('El alumno es obligatorio', 'error', container);  return false }
      if (!clase_id)        { showToast('La clase es obligatoria', 'error', container);   return false }
      if (!tipo_evaluacion) { showToast('El tipo es obligatorio', 'error', container);    return false }

      const calRaw = bodyEl.querySelector('#calificacion')?.value
      const datos = {
        alumno_id,
        clase_id,
        maestro_id:       bodyEl.querySelector('#maestro_id')?.value || null,
        fecha_evaluacion: bodyEl.querySelector('#fecha_evaluacion')?.value || null,
        tipo_evaluacion,
        calificacion:     calRaw !== '' ? parseFloat(calRaw) : null,
        estado:           bodyEl.querySelector('#estado')?.value,
        observaciones:    bodyEl.querySelector('#observaciones')?.value,
      }

      if (isEdit && data?.id) {
        await actualizarProgreso(data.id, datos)
        const idx = state.progresosOriginales.findIndex(p => p.id === data.id)
        if (idx !== -1) state.progresosOriginales[idx] = { ...state.progresosOriginales[idx], ...datos, id: data.id }
        showToast('Calificación actualizada', 'success', container)
      } else {
        const nuevo = await crearProgreso(datos)
        state.progresosOriginales.push(nuevo)
        showToast('Calificación creada', 'success', container)
      }
      applyFilters()
    },
  })

  // Wire char counter and calificacion label after AppModal renders
  requestAnimationFrame(() => {
    if (isEdit && data) {
      const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? '' }
      set('alumno_id',       data.alumno_id)
      set('clase_id',        data.clase_id)
      set('maestro_id',      data.maestro_id)
      set('tipo_evaluacion', data.tipo_evaluacion)
      set('estado',          data.estado || 'en_progreso')
    }

    document.getElementById('calificacion')?.addEventListener('input', (e) => {
      const val   = parseFloat(e.target.value)
      const label = document.getElementById('calificacionLabel')
      if (label) {
        label.textContent = (!isNaN(val) && val >= 0 && val <= 5) ? getCalificacionLabel(val) : ''
        label.className   = `form-text text-${getCalificacionColor(val)}`
      }
    })

    document.getElementById('observaciones')?.addEventListener('input', (e) => {
      const el = document.getElementById('observacionesCount')
      if (el) el.textContent = e.target.value.length + '/500'
    })
  })
}


function renderBoletinModal(container, alumnoId) {
  const alumno = state.alumnos.find(a => a.id === alumnoId)
  if (!alumno) {
    showToast('Alumno no encontrado', 'error', container)
    return
  }

  const progresosAlumno = state.progresosOriginales.filter(p => p.alumno_id === alumnoId)
  const promedio = calcularPromedio(progresosAlumno)
  const enRiesgo = promedio !== null && getRiesgo(promedio)

  const evaluationsHTML = progresosAlumno.length
    ? progresosAlumno.map(p => `
        <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
          <div>
            <span class="badge badge-compact ${getTipoBadgeClass(p.tipo_evaluacion)} me-2">${getTipoLabel(p.tipo_evaluacion)}</span>
            <small class="text-muted">${escapeHTML(p.fecha_evaluacion ? formatDate(p.fecha_evaluacion) : 'Sin fecha')}</small>
          </div>
          <div class="text-end">
            <span class="badge badge-compact bg-${getCalificacionColor(p.calificacion)}">${formatCalificacion(p.calificacion)}</span>
            <div class="small text-muted">${getCalificacionLabel(p.calificacion)}</div>
          </div>
        </div>
      `).join('')
    : '<p class="text-muted text-center py-3">Sin evaluaciones</p>'

  const body = `
    <div class="card border-0 shadow-sm">
      <div class="card-header bg-primary text-white">
        <div class="d-flex align-items-center gap-3">
          <div class="avatar-compact bg-white bg-opacity-25 text-white">${getInitials(alumno.name || alumno.nombre)}</div>
          <div>
            <h6 class="mb-0">${escapeHTML(alumno.name || alumno.nombre)}</h6>
            <small>${escapeHTML(alumno.section || 'Sin seccion')}</small>
          </div>
        </div>
      </div>
      <div class="card-body">
        <div class="row mb-3">
          <div class="col-4 text-center">
            <div class="fs-4 fw-bold text-primary">${progresosAlumno.length}</div>
            <small class="text-muted">Evaluaciones</small>
          </div>
          <div class="col-4 text-center">
            <div class="fs-4 fw-bold ${promedio !== null ? 'text-' + getCalificacionColor(promedio) : 'text-muted'}">
              ${promedio !== null ? formatCalificacion(promedio) : 'N/A'}
            </div>
            <small class="text-muted">Promedio</small>
          </div>
          <div class="col-4 text-center">
            ${enRiesgo
              ? '<div class="fs-4"><span class="badge badge-compact bg-danger"><i class="bi bi-exclamation-triangle"></i> Riesgo</span></div>'
              : '<div class="fs-4"><span class="badge badge-compact bg-success"><i class="bi bi-check-circle"></i> OK</span></div>'
            }
            <small class="text-muted">Estado</small>
          </div>
        </div>

        ${progresosAlumno.length > 1 ? `
        <h6 class="fw-bold mb-3">Evolución</h6>
        <div class="evolution-chart mb-3 p-2" style="background: var(--bs-body-bg); border-radius: 8px;">
          <div class="d-flex align-items-end justify-content-between gap-1" style="height: 100px;">
            ${progresosAlumno.slice().reverse().map((p, i) => {
              const calif = p.calificacion !== null ? parseFloat(p.calificacion) : 0
              const height = (calif / 5) * 100
              const color = calif >= 4 ? 'success' : calif >= 3 ? 'warning' : 'danger'
              return `
                <div class="text-center flex-fill">
                  <div class="progress" style="height: 100%; width: 100%; min-width: 20px;">
                    <div class="progress-bar bg-${color}" style="height: ${height}%;"></div>
                  </div>
                  <small class="text-muted d-block mt-1" style="font-size: 0.65rem;">${p.fecha_evaluacion ? formatDate(p.fecha_evaluacion).split(',')[0] : '-'}</small>
                </div>
              `
            }).join('')}
          </div>
          <div class="d-flex justify-content-between mt-2">
            <span class="badge bg-danger">0</span>
            <span class="badge bg-warning">2.5</span>
            <span class="badge bg-success">5</span>
          </div>
        </div>
      ` : ''}

        <h6 class="fw-bold mb-3">Evaluaciones</h6>
        ${evaluationsHTML}
      </div>
    </div>
  `

  AppModal.open({
    title:      'Boletín Académico',
    body,
    hideSave:   true,
    cancelText: 'Cerrar',
    onShow: () => {
      setTimeout(() => {
        const btn = document.querySelector('#app-global-modal .app-modal-footer .btn-primary')
        if (btn) {
          btn.textContent = 'Descargar PDF'
          btn.classList.remove('btn-primary')
          btn.classList.add('btn-danger')
          btn.onclick = () => exportarBoletinPDF(alumno, progresosAlumno)
        }
      }, 100)
    }
  })
}

async function renderSummary(container) {
  const total = state.progresosOriginales.length
  const promedioGeneral = calcularPromedio(state.progresosOriginales)
  const enRiesgo = state.progresosOriginales.filter(p => getRiesgo(p.calificacion)).length

  return `
    <div class="row g-2 mb-3">
      <div class="col-6 col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center py-2">
            <div class="fs-4 fw-bold text-primary">${total}</div>
            <small class="text-muted">Total</small>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center py-2">
            <div class="fs-4 fw-bold ${promedioGeneral !== null ? 'text-' + getCalificacionColor(promedioGeneral) : 'text-muted'}">
              ${promedioGeneral !== null ? formatCalificacion(promedioGeneral) : 'N/A'}
            </div>
            <small class="text-muted">Promedio</small>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center py-2">
            <div class="fs-4 fw-bold text-danger">${enRiesgo}</div>
            <small class="text-muted">En Riesgo</small>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center py-2">
            <div class="fs-4 fw-bold text-success">${total - enRiesgo}</div>
            <small class="text-muted">Aprobados</small>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderTableRows(progresos) {
  if (!progresos.length) return '<tr><td colspan="7" class="text-center text-muted py-3">No hay progresos</td></tr>'

  return progresos.map(p => {
    const alumno = state.alumnos.find(a => a.id === p.alumno_id)
    const clase = state.clases.find(c => c.id === p.clase_id)
    const alumnoName = alumno ? (alumno.name || alumno.nombre || 'Sin nombre') : 'Sin alumno'
    const claseName = clase ? (clase.nombre || 'Sin nombre') : 'Sin clase'

    return `
      <tr data-id="${p.id}">
        <td><small>${p.fecha_evaluacion ? formatDate(p.fecha_evaluacion) : '-'}</small></td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="avatar-compact bg-light">${getInitials(alumnoName)}</div>
            <span class="text-truncate" style="max-width: 120px;" title="${escapeHTML(alumnoName)}">${escapeHTML(alumnoName)}</span>
          </div>
        </td>
        <td><small class="text-truncate" style="max-width: 100px;" title="${escapeHTML(claseName)}">${escapeHTML(claseName)}</small></td>
        <td><span class="badge badge-compact ${getTipoBadgeClass(p.tipo_evaluacion)}">${getTipoLabel(p.tipo_evaluacion)}</span></td>
        <td>
          <span class="badge badge-compact bg-${getCalificacionColor(p.calificacion)}">${formatCalificacion(p.calificacion)}</span>
          <div class="small text-muted">${getCalificacionLabel(p.calificacion)}</div>
        </td>
        <td><span class="${getEstadoClass(p.estado)} small">${getEstadoLabel(p.estado)}</span></td>
        <td class="text-end">
          <div class="quick-actions justify-content-end">
            <button class="btn btn-sm btn-outline-info btn-icon-compact" data-action="view" data-id="${p.id}" title="Ver">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline-primary btn-icon-compact" data-action="edit" data-id="${p.id}" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger btn-icon-compact" data-action="delete" data-id="${p.id}" title="Eliminar">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `
  }).join('')
}

function renderEmpty() {
  return `
    <div class="col-12 text-center py-5">
      <div class="mb-3">
        <i class="bi bi-inbox" style="font-size: 3rem; color: var(--bs-secondary);"></i>
      </div>
      <h4>No hay progresos</h4>
      <p class="text-muted">Crea tu primera evaluacion con el boton "Nuevo"</p>
    </div>
  `
}

export async function renderProgresosView(container) {
  try {
    state.cargando = true
    renderLoading(container)

    const [progresos, alumnos, clases, maestros] = await Promise.all([
      obtenerProgresos().catch(() => []),
      fetchAlumnosList().catch(() => []),
      fetchClasesList().catch(() => []),
      fetchMaestrosList().catch(() => []),
    ])

    state.progresos = progresos
    state.progresosOriginales = [...progresos]
    state.alumnos = alumnos
    state.clases = clases
    state.maestros = maestros
    state.cargando = false

    const summaryHTML = await renderSummary(container)

    const tipoOptions = Progreso.getTiposEvaluacion()
      .map(t => `<option value="${t.value}">${t.label}</option>`)
      .join('')

    const estadoOptions = Progreso.getEstados()
      .map(e => `<option value="${e.value}">${e.label}</option>`)
      .join('')

    const claseFilterOptions = state.clases.length
      ? `<option value="">Todas las clases</option>` + state.clases.map(c => `<option value="${c.id}">${escapeHTML(c.nombre || 'Sin nombre')}</option>`).join('')
      : '<option value="">Sin clases</option>'

    container.innerHTML = `
      <div class="page-container">
        <!-- Page Header Compact -->
        <div class="page-header">
          <div class="d-flex align-items-center gap-2">
            <span class="page-title"><i class="bi bi-graph-up me-2 text-primary"></i>Progresos</span>
            <span class="badge bg-secondary">${state.progresos.length}</span>
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn btn-outline-danger btn-sm-compact" id="btnExportarPDF">
              <i class="bi bi-file-earmark-pdf"></i> PDF
            </button>
            <button class="btn btn-primary btn-sm-compact" id="btnAgregarProgreso">
              <i class="bi bi-plus-lg"></i> Nuevo
            </button>
          </div>
        </div>

        <!-- Summary Cards -->
        ${summaryHTML}

        <!-- Toolbar Compact -->
        <div class="toolbar-dense mb-3">
          <div class="search-bar flex-grow-1" style="min-width: 180px;">
            <i class="bi bi-search"></i>
            <input type="text" class="form-control input-dense" placeholder="Buscar..." id="buscar" autocomplete="off">
          </div>
          <select class="form-select input-dense" id="filtroTipo" style="width: auto; min-width: 120px;">
            <option value="">Todos los tipos</option>
            ${tipoOptions}
          </select>
          <select class="form-select input-dense" id="filtroEstado" style="width: auto; min-width: 120px;">
            <option value="todos">Todos</option>
            ${estadoOptions}
          </select>
          <select class="form-select input-dense" id="filtroClase" style="width: auto; min-width: 140px;">
            ${claseFilterOptions}
          </select>
        </div>

        <!-- Table Compact -->
        <div class="table-scroll-container">
          <table class="table table-compact table-hover mb-0" id="progresosTable">
            <thead>
              <tr>
                <th style="width: 10%;">Fecha</th>
                <th style="width: 22%;">Alumno</th>
                <th style="width: 18%;">Clase</th>
                <th style="width: 12%;">Tipo</th>
                <th style="width: 14%;">Calificacion</th>
                <th style="width: 10%;">Estado</th>
                <th style="width: 14%;" class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody id="progresosTBody">
              ${renderTableRows(state.progresos)}
            </tbody>
          </table>
          ${state.progresos.length === 0 ? renderEmpty() : ''}
        </div>

        <!-- Boletin Section -->
        <div class="mt-4">
          <h6 class="fw-bold mb-3"><i class="bi bi-journal-text"></i> Boletin por Alumno</h6>
          <div class="row g-2" id="boletinAlumnosGrid">
            ${state.alumnos.filter(a => a.es_activo !== false).slice(0, 12).map(a => {
              const avg = calcularPromedio(state.progresosOriginales.filter(p => p.alumno_id === a.id))
              const enRiesgo = avg !== null && getRiesgo(avg)
              return `
                <div class="col-6 col-md-4 col-lg-3">
                  <div class="card border-0 shadow-sm h-100">
                    <div class="card-body text-center p-3">
                      <div class="avatar-compact bg-primary text-white mx-auto mb-2">${getInitials(a.name || a.nombre)}</div>
                      <h6 class="card-title mb-1 small text-truncate" title="${escapeHTML(a.name || a.nombre)}">${escapeHTML(a.name || a.nombre)}</h6>
                      <small class="text-muted d-block mb-2">${escapeHTML(a.section || 'Sin seccion')}</small>
                      ${avg !== null
                        ? `<span class="badge badge-compact bg-${getCalificacionColor(avg)}">${formatCalificacion(avg)}</span>`
                        : '<span class="badge badge-compact bg-secondary">Sin notas</span>'
                      }
                      ${enRiesgo ? '<span class="badge badge-compact bg-danger ms-1"><i class="bi bi-exclamation-triangle"></i></span>' : ''}
                      <button class="btn btn-sm btn-outline-primary w-100 mt-2" data-action="ver-boletin" data-id="${a.id}">
                        <i class="bi bi-card-text"></i> Ver
                      </button>
                    </div>
                  </div>
                </div>
              `
            }).join('')}
          </div>
        </div>

        <!-- Toast Container -->
        <div class="toast-container position-fixed top-0 end-0 p-3" id="toastContainer"></div>
      </div>
    `

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
        <p class="text-muted">Cargando progresos...</p>
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
            <h4 class="alert-heading">
              <i class="bi bi-exclamation-triangle"></i> Error
            </h4>
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
  document.getElementById('retryBtn')?.addEventListener('click', () => renderProgresosView(container))
}

function attachGlobalEvents(container) {
  document.getElementById('btnAgregarProgreso')?.addEventListener('click', () => {
    openCalificacionModal('create', container)
  })

  document.getElementById('btnExportarPDF')?.addEventListener('click', async () => {
    if (state.alumnos.length === 0) {
      showToast('No hay alumnos para generar boletines', 'error', container)
      return
    }
    for (const alumno of state.alumnos) {
      const progresosAlumno = state.progresosOriginales.filter(p => p.alumno_id === alumno.id)
      await exportarBoletinPDF(alumno, progresosAlumno)
    }
    showToast(`Se generaron ${state.alumnos.length} boletines PDF`, 'success', container)
  })

  document.getElementById('buscar')?.addEventListener('input', applyFilters)
  document.getElementById('filtroTipo')?.addEventListener('change', applyFilters)
  document.getElementById('filtroEstado')?.addEventListener('change', applyFilters)
  document.getElementById('filtroClase')?.addEventListener('change', applyFilters)

  const tbody = document.getElementById('progresosTBody')
  tbody?.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]')
    if (!btn) return

    const id = btn.dataset.id

    if (btn.dataset.action === 'edit') {
      const progreso = state.progresosOriginales.find(p => p.id === id)
      if (progreso) openCalificacionModal('edit', container, progreso)
    } else if (btn.dataset.action === 'delete') {
      await handleDelete(id, container)
    } else if (btn.dataset.action === 'view') {
      const progreso = state.progresosOriginales.find(p => p.id === id)
      if (progreso) openViewModal(progreso, container)
    } else if (btn.dataset.action === 'ver-boletin') {
      renderBoletinModal(container, id)
    }
  })
}

function openViewModal(progreso, container) {
  const alumno = state.alumnos.find(a => a.id === progreso.alumno_id)
  const clase = state.clases.find(c => c.id === progreso.clase_id)
  const maestro = state.maestros.find(m => m.id === progreso.maestro_id)

  const alumnoName = alumno ? (alumno.name || alumno.nombre || 'Sin nombre') : 'Sin alumno'
  const claseName = clase ? (clase.nombre || 'Sin nombre') : 'Sin clase'
  const maestroName = maestro ? (maestro.nombre || maestro.name || 'Sin nombre') : 'No asignado'

  const body = `
    <div class="row">
      <div class="col-md-6">
        <div class="mb-2">
          <label class="form-label fw-bold">Alumno</label>
          <p class="form-control-plaintext">${escapeHTML(alumnoName)}</p>
        </div>
        <div class="mb-2">
          <label class="form-label fw-bold">Clase</label>
          <p class="form-control-plaintext">${escapeHTML(claseName)}</p>
        </div>
        <div class="mb-2">
          <label class="form-label fw-bold">Maestro</label>
          <p class="form-control-plaintext">${escapeHTML(maestroName)}</p>
        </div>
      </div>
      <div class="col-md-6">
        <div class="mb-2">
          <label class="form-label fw-bold">Fecha</label>
          <p class="form-control-plaintext">${progreso.fecha_evaluacion ? formatDate(progreso.fecha_evaluacion) : '-'}</p>
        </div>
        <div class="mb-2">
          <label class="form-label fw-bold">Tipo</label>
          <p class="form-control-plaintext"><span class="badge badge-compact ${getTipoBadgeClass(progreso.tipo_evaluacion)}">${getTipoLabel(progreso.tipo_evaluacion)}</span></p>
        </div>
        <div class="mb-2">
          <label class="form-label fw-bold">Calificacion</label>
          <p class="form-control-plaintext">
            <span class="badge badge-compact bg-${getCalificacionColor(progreso.calificacion)}">${formatCalificacion(progreso.calificacion)}</span>
            <span class="ms-2 text-muted">${getCalificacionLabel(progreso.calificacion)}</span>
          </p>
        </div>
        <div class="mb-2">
          <label class="form-label fw-bold">Estado</label>
          <p class="form-control-plaintext">
            <span class="${getEstadoClass(progreso.estado)} fw-bold">${getEstadoLabel(progreso.estado)}</span>
          </p>
        </div>
      </div>
    </div>
    ${progreso.observaciones ? `
      <hr>
      <div class="mb-2">
        <label class="form-label fw-bold">Observaciones</label>
        <p class="form-control-plaintext">${escapeHTML(progreso.observaciones)}</p>
      </div>
    ` : ''}
    <hr>
    <div class="row mt-2 pt-2 border-top">
      <div class="col-6">
        <label class="form-label fw-bold">Creado</label>
        <p class="form-control-plaintext small">${formatDate(progreso.created_at)}</p>
      </div>
      <div class="col-6">
        <label class="form-label fw-bold">Actualizado</label>
        <p class="form-control-plaintext small">${formatDate(progreso.updated_at)}</p>
      </div>
    </div>
  `

  AppModal.open({
    title:      'Detalle de Calificación',
    body,
    hideSave:   true,
    cancelText: 'Cerrar',
  })
}

async function handleDelete(id, container) {
  const progreso = state.progresosOriginales.find(p => p.id === id)
  if (!progreso) {
    showToast('Progreso no encontrado', 'error', container)
    return
  }

  const alumno = state.alumnos.find(a => a.id === progreso.alumno_id)
  const alumnoName = alumno ? (alumno.name || alumno.nombre || 'Sin nombre') : progreso.alumno_id

  AppModal.open({
    title:    'Eliminar evaluación',
    size:     'sm',
    saveText: 'Eliminar',
    body: `
      <p class="mb-2">Esta evaluación será eliminada.</p>
      <p class="fw-bold text-danger mb-0">${escapeHTML(alumnoName)} — ${getTipoLabel(progreso.tipo_evaluacion)}</p>
    `,
    onSave: async () => {
      await eliminarProgreso(id)
      state.progresosOriginales = state.progresosOriginales.filter(p => p.id !== id)
      applyFilters()
      showToast('Evaluación eliminada', 'success', container)
    },
  })
}

function applyFilters() {
  const searchTerm = document.getElementById('buscar')?.value.trim().toLowerCase() || ''
  const filtroTipo = document.getElementById('filtroTipo')?.value || ''
  const filtroEstado = document.getElementById('filtroEstado')?.value || 'todos'
  const filtroClase = document.getElementById('filtroClase')?.value || ''

  state.progresos = state.progresosOriginales.filter(p => {
    const matchSearch = !searchTerm ||
      (p.alumno_id || '').toLowerCase().includes(searchTerm) ||
      (p.clase_id || '').toLowerCase().includes(searchTerm) ||
      (p.observaciones || '').toLowerCase().includes(searchTerm) ||
      (p.tipo_evaluacion || '').toLowerCase().includes(searchTerm)

    const matchTipo = !filtroTipo || p.tipo_evaluacion === filtroTipo
    const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado
    const matchClase = !filtroClase || p.clase_id === filtroClase

    return matchSearch && matchTipo && matchEstado && matchClase
  })

  refreshTable()
}

function refreshTable() {
  const tbody = document.getElementById('progresosTBody')
  if (!tbody) return

  if (state.progresos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">No hay progresos</td></tr>'
  } else {
    tbody.innerHTML = renderTableRows(state.progresos)
  }
}

async function fetchAlumnosList() {
  try {
    const { supabase } = await import('../../../lib/supabaseClient.js')
    const { data } = await supabase.from('alumnos').select('*').order('nombre_completo', { ascending: true })
    return data || []
  } catch {
    return []
  }
}

async function fetchClasesList() {
  try {
    const { supabase } = await import('../../../lib/supabaseClient.js')
    const { data } = await supabase.from('clases').select('*').order('nombre', { ascending: true })
    return data || []
  } catch {
    return []
  }
}

async function fetchMaestrosList() {
  try {
    const { supabase } = await import('../../../lib/supabaseClient.js')
    const { data } = await supabase.from('maestros').select('*').order('nombre_completo', { ascending: true })
    return data || []
  } catch {
    return []
  }
}

function showToast(message, type = 'info', container) {
  const toastContainer = document.getElementById('toastContainer')
  if (!toastContainer) return

  const toastId = 'toast-' + Date.now()
  const bgClass = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-info'
  const iconClass = type === 'success' ? 'bi-check-circle' : type === 'error' ? 'bi-exclamation-circle' : 'bi-info-circle'

  const toastHTML = `
    <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header ${bgClass} text-white">
        <i class="bi ${iconClass} me-2"></i>
        <strong class="me-auto">${type === 'success' ? 'OK' : type === 'error' ? 'Error' : 'Info'}</strong>
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

export { openCalificacionModal, renderBoletinModal }