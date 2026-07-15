import '../../../shared/styles/patterns.css'
import '../styles/programas.css'
import { escapeHTML } from '../../../shared/utils/sanitize.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import {
  obtenerProgramas,
  crearPrograma,
  actualizarPrograma,
  eliminarPrograma,
  exportarProgramasPDF,
  NIVELES,
  getNivelLabel,
} from '../api/programasApi.js'
import { renderFilterPanel } from '../../../shared/components/pageShell.js'
import { renderHeroCard, renderDetailGrid } from '../../../shared/components/profileModal.js'
import { Programa } from '../models/programa.model.js'
import { supabase } from '../../../lib/supabaseClient.js'

const state = {
  programas: [],
  programasOriginales: [],
  cargando: false,
  filtrosAbiertos: typeof window !== 'undefined' ? window.innerWidth >= 992 : true,
  container: null,
  filtroBuscar: '',
  filtroEstado: 'todos',
}

export function resetProgramasStateForTests() {
  state.programas = []
  state.programasOriginales = []
  state.cargando = false
  state.filtrosAbiertos = typeof window !== 'undefined' ? window.innerWidth >= 992 : true
  state.container = null
  state.filtroBuscar = ''
  state.filtroEstado = 'todos'
}

const VALIDATION = {
  nombreMax: 100,
  descripcionMax: 500,
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

function getStatusColor(activo) {
  return activo ? 'bg-success' : 'bg-secondary'
}

function getStatusLabel(activo) {
  return activo ? 'Activo' : 'Inactivo'
}

function getNivelOptions(selectedValue = '') {
  return NIVELES.map(n =>
    `<option value="${n.value}" ${n.value === selectedValue ? 'selected' : ''}>${n.label}</option>`
  ).join('')
}

function saveFilterState() {
  const c = state.container
  if (!c) return
  state.filtroBuscar = c.querySelector('#buscarPrograma')?.value || ''
  state.filtroEstado = c.querySelector('#filtroEstado')?.value || 'todos'
}

export async function renderProgramasView(container) {
  saveFilterState()

  if (container.cleanup) {
    container.cleanup()
  }

  state.container = container
  if (typeof state.filtrosAbiertos !== 'boolean') {
    state.filtrosAbiertos = window.innerWidth >= 992
  }

  if (state.programasOriginales.length === 0) {
    try {
      state.cargando = true
      renderLoading(container)
      const programas = await obtenerProgramas()
      state.programas = programas
      state.programasOriginales = [...programas]
      state.cargando = false
    } catch (error) {
      console.error('[ProgramasView]', error)
      renderError(container, error.message)
      return
    }
  }

  renderContent()
  attachEvents()
  applyFilters()
}

function renderLoading(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted">Cargando programas...</p>
      </div>
    </div>
  `
}

function renderError(container, mensaje) {
  container.innerHTML = `
    <div class="container mt-5">
      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Error al cargar</h4>
        <p>${escapeHTML(mensaje)}</p>
        <button class="btn btn-primary btn-sm" id="retryBtn">Reintentar</button>
      </div>
    </div>
  `
  container.querySelector('#retryBtn')?.addEventListener('click', () => renderProgramasView(container))
}

function getFilterConfigHtml() {
  return `
    <div class="premium-search-container flex-grow-1" style="min-width: 180px;">
      <i class="bi bi-search search-icon-muted"></i>
      <input type="text" class="form-control premium-search-input" placeholder="Buscar programa..." id="buscarPrograma" autocomplete="off" value="${escapeHTML(state.filtroBuscar)}">
    </div>
    <div class="premium-select-container">
      <i class="bi bi-funnel select-icon-muted"></i>
      <select class="form-select premium-filter-select" id="filtroEstado">
        <option value="todos" ${state.filtroEstado === 'todos' ? 'selected' : ''}>Todos los estados</option>
        <option value="activo" ${state.filtroEstado === 'activo' ? 'selected' : ''}>Activos</option>
        <option value="inactivo" ${state.filtroEstado === 'inactivo' ? 'selected' : ''}>Inactivos</option>
      </select>
    </div>
  `
}

function renderContent() {
  const container = state.container
  container.innerHTML = `
    <div class="page-container">
      <div class="programas-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-journal-bookmark fs-4"></i>
          </div>
          <div>
            <h1 class="programas-title-premium mb-0">Programas</h1>
            <p class="text-muted small mb-0"><span id="programasCount">${state.programas.length}</span> programas en total</p>
          </div>
        </div>

        <div class="programas-header-actions">
          <button class="btn btn-outline-secondary btn-sm me-2" id="btnExportarPDF" title="Exportar PDF">
            <i class="bi bi-file-earmark-pdf"></i> PDF
          </button>
          <button class="btn btn-premium-action btn-icon-only" id="btnAgregarPrograma" title="Nuevo Programa" aria-label="Nuevo Programa">
            <i class="bi bi-plus-lg"></i>
          </button>
        </div>
      </div>

      ${renderFilterPanel({
        isOpen: state.filtrosAbiertos,
        filtersHtml: getFilterConfigHtml(),
        onToggleId: 'btnToggleFiltros',
      })}

      <div class="page-glass rounded w-100">
        <div class="list-group list-group-flush w-100" id="programasTBody">
          ${renderTableRows(state.programas)}
        </div>
        <div id="emptyContainer">
          ${state.programas.length === 0 ? renderEmpty() : ''}
        </div>
      </div>
    </div>
  `
}

function renderTableRows(programas) {
  if (!programas.length) return ''

  return programas.map(p => {
    const nivel = getNivelLabel(p.nivel)
    const descripcion = escapeHTML(p.descripcion || 'Sin descripción')
    const accentClass = `border-accent-${p.activo ? 'success' : 'secondary'}`
    const estadoBadge = p.activo
      ? '<span class="badge rounded-pill bg-success-subtle text-success-emphasis programa-estado-badge">Activo</span>'
      : '<span class="badge rounded-pill bg-secondary-subtle text-secondary-emphasis programa-estado-badge">Inactivo</span>'
    const duracion = p.duracion_anios
      ? `${p.duracion_anios} ${p.duracion_anios === 1 ? 'año' : 'años'}`
      : 'Sin especificar'

    return `
      <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${accentClass}" data-id="${p.id}" style="cursor: pointer;">
        <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden programa-card-main">
          <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3 programa-card-copy">
            <div class="d-flex align-items-center gap-2">
              <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${escapeHTML(p.nombre)}</span>
              ${estadoBadge}
            </div>
            <small class="text-muted text-truncate"><i class="bi bi-bar-chart-steps me-1"></i>${nivel} <span class="mx-1">•</span> <i class="bi bi-clock me-1"></i>${duracion}</small>
            <small class="text-muted extra-small mt-1 programa-card-descripcion" style="font-size: 0.85rem;"><i class="bi bi-file-earmark-text me-1"></i>${descripcion.substring(0, 80)}${descripcion.length > 80 ? '...' : ''}</small>
          </div>
        </div>
        <div class="flex-shrink-0 text-muted ms-2 pe-1">
          <i class="bi bi-chevron-right" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
        </div>
      </div>
    `
  }).join('')
}

function renderEmpty() {
  return `
    <div class="text-center py-5 text-muted">
      <i class="bi bi-inbox fs-1 d-block mb-2"></i>
      <p>No hay programas que coincidan con la búsqueda.</p>
    </div>
  `
}

function attachEvents() {
  const container = state.container

  container.querySelector('#btnAgregarPrograma')?.addEventListener('click', () => openCreateModal())

  container.querySelector('#btnExportarPDF')?.addEventListener('click', async () => {
    try {
      await exportarProgramasPDF(state.programas)
      AppToast.success('PDF generado exitosamente')
    } catch (err) {
      AppToast.error('Error al generar PDF')
    }
  })

  container.querySelector('#btnToggleFiltros')?.addEventListener('click', () => {
    state.filtrosAbiertos = !state.filtrosAbiertos
    renderProgramasView(state.container)
  })

  let debounceTimer
  container.addEventListener('input', (e) => {
    if (e.target.id === 'buscarPrograma') {
      saveFilterState()
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(applyFilters, 300)
    }
  })

  container.addEventListener('change', (e) => {
    if (e.target.id === 'filtroEstado') {
      saveFilterState()
      applyFilters()
    }
  })

  container.querySelector('#programasTBody')?.addEventListener('click', (e) => {
    const item = e.target.closest('.list-group-item[data-id]')
    if (item) {
      openViewModal(item.dataset.id)
    }
  })

  container.cleanup = () => {}
}

function applyFilters() {
  const c = state.container
  if (!c) return

  const searchTerm = c.querySelector('#buscarPrograma')?.value.trim().toLowerCase() || ''
  const filtroEstado = c.querySelector('#filtroEstado')?.value || 'todos'

  state.programas = state.programasOriginales.filter(p => {
    const matchSearch = !searchTerm ||
      p.nombre.toLowerCase().includes(searchTerm) ||
      (p.descripcion || '').toLowerCase().includes(searchTerm)

    const matchEstado = filtroEstado === 'todos' ||
      (filtroEstado === 'activo' && p.activo) ||
      (filtroEstado === 'inactivo' && !p.activo)

    return matchSearch && matchEstado
  })

  refreshTable()
}

function refreshTable() {
  const c = state.container
  if (!c) return

  const tbody = c.querySelector('#programasTBody')
  if (tbody) tbody.innerHTML = renderTableRows(state.programas)

  const empty = c.querySelector('#emptyContainer')
  if (empty) empty.innerHTML = state.programas.length === 0 ? renderEmpty() : ''

  const count = c.querySelector('#programasCount')
  if (count) count.textContent = state.programas.length
}

function openCreateModal() {
  _renderFormModal({ title: 'Nuevo Programa', saveText: 'Crear Programa' })
}

function openEditModal(id) {
  const prog = state.programasOriginales.find(p => p.id === id)
  if (!prog) return AppToast.error('Programa no encontrado')
  _renderFormModal({ title: 'Editar Programa', saveText: 'Guardar Cambios', programa: prog })
}

function _renderFormModal({ title, saveText, programa = null }) {
  AppModal.open({
    title,
    saveText,
    body: `
      <form id="form-programa" class="row g-3">
        <div class="col-12">
          <label class="form-label-compact">Nombre del Programa *</label>
          <input type="text" class="form-control input-dense" id="prog-nombre" required maxlength="${VALIDATION.nombreMax}" value="${escapeHTML(programa?.nombre || '')}">
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Nivel / Año *</label>
          <select class="form-select input-dense" id="prog-nivel">
            ${getNivelOptions(programa?.nivel || '')}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Duración (años)</label>
          <input type="number" class="form-control input-dense" id="prog-duracion" min="0" step="0.5" value="${programa?.duracion_anios || ''}">
        </div>
        <div class="col-12">
          <label class="form-label-compact">Descripción</label>
          <textarea class="form-control input-dense" id="prog-descripcion" rows="3" maxlength="${VALIDATION.descripcionMax}">${escapeHTML(programa?.descripcion || '')}</textarea>
        </div>
        <div class="col-12">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="prog-activo" ${programa?.activo !== false ? 'checked' : ''}>
            <label class="form-check-label" for="prog-activo">Programa Activo</label>
          </div>
        </div>
      </form>
    `,
    onSave: async (modalBody) => {
      const data = {
        nombre: modalBody.querySelector('#prog-nombre').value.trim(),
        nivel: modalBody.querySelector('#prog-nivel').value,
        duracion_anios: modalBody.querySelector('#prog-duracion').value ? parseFloat(modalBody.querySelector('#prog-duracion').value) : null,
        descripcion: modalBody.querySelector('#prog-descripcion').value.trim(),
        activo: modalBody.querySelector('#prog-activo').checked
      }

      const p = new Programa(data)
      const validLevels = NIVELES.map(n => n.value).filter(Boolean)
      const errores = p.validate(validLevels)

      if (errores.length > 0) {
        AppToast.error(errores[0])
        return false
      }

      try {
        if (programa) {
          const updated = await actualizarPrograma(programa.id, data)
          const idx = state.programasOriginales.findIndex(x => x.id === programa.id)
          state.programasOriginales[idx] = updated
          AppToast.success('Programa actualizado')
        } else {
          const nuevo = await crearPrograma(data)
          state.programasOriginales.unshift(nuevo)
          AppToast.success('Programa creado')
        }
        applyFilters()
        return true
      } catch (err) {
        AppToast.error(err.message)
        return false
      }
    }
  })
}

async function loadClasesForPrograma(programaId, modalBody) {
  const section = modalBody.querySelector('#programa-clases-section')
  if (!section) return

  try {
    const [clasesRes, maestrosRes] = await Promise.all([
      supabase.from('clases').select('*').eq('programa_id', programaId),
      supabase.from('maestros').select('id, nombre_completo'),
    ])

    const clases   = clasesRes.data   || []
    const maestros = maestrosRes.data || []

    if (clases.length === 0) {
      section.innerHTML = `<p class="text-muted small fst-italic mb-0">Este programa no tiene clases registradas.</p>`
      return
    }

    const totalAlumnos  = clases.reduce((sum, c) => sum + (c.alumnos_inscritos || 0), 0)
    const instruments   = [...new Set(clases.map(c => c.instrumento).filter(Boolean))]
    const maestrosIds   = [...new Set([
      ...clases.map(c => c.maestro_principal_id),
      ...clases.map(c => c.maestro_suplente_id),
    ].filter(Boolean))]

    const summaryHtml = `
      <div class="row g-2 mb-3">
        <div class="col-6 col-md-3">
          <div class="card card-body py-2 text-center border-0 bg-body-secondary">
            <div class="fs-5 fw-bold">${clases.length}</div>
            <small class="text-muted">Clases</small>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card card-body py-2 text-center border-0 bg-body-secondary">
            <div class="fs-5 fw-bold">${totalAlumnos}</div>
            <small class="text-muted">Alumnos</small>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card card-body py-2 text-center border-0 bg-body-secondary">
            <div class="fs-5 fw-bold">${instruments.length}</div>
            <small class="text-muted">Instrumentos</small>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card card-body py-2 text-center border-0 bg-body-secondary">
            <div class="fs-5 fw-bold">${maestrosIds.length}</div>
            <small class="text-muted">Maestros</small>
          </div>
        </div>
      </div>
    `

    const clasesHtml = clases.map(clase => {
      const principal = maestros.find(m => m.id === clase.maestro_principal_id)
      const suplente  = maestros.find(m => m.id === clase.maestro_suplente_id)
      const nombreP   = principal ? (principal.nombre_completo || principal.nombre) : 'No asignado'
      const nombreS   = suplente  ? (suplente.nombre_completo  || suplente.nombre)  : null
      const horarios  = (clase.horarios || []).slice(0, 2)
      const horarioStr = horarios.length > 0
        ? horarios.map(h => `${(h.dia || '').slice(0, 2).toUpperCase()} ${(h.hora_inicio || '').slice(0, 5)}`).join(' · ')
        : 'Sin horario'
      const alumnos   = clase.alumnos_inscritos ?? 0

      return `
        <div class="card mb-2 border-0 shadow-sm">
          <div class="card-body py-2 px-3">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1 overflow-hidden">
                <div class="fw-semibold text-truncate">${escapeHTML(clase.nombre || 'Sin nombre')}</div>
                <small class="text-muted">${clase.descripcion ? escapeHTML(clase.descripcion) : '<em>Sin descripción registrada</em>'}</small>
              </div>
              <span class="badge ms-2 flex-shrink-0 ${clase.estado === 'activa' ? 'bg-success-subtle text-success-emphasis' : 'bg-secondary-subtle text-secondary-emphasis'}">${escapeHTML(clase.estado || 'activa')}</span>
            </div>
            <div class="row g-1 mt-1 small text-muted">
              <div class="col-6"><i class="bi bi-person-badge me-1"></i>${escapeHTML(nombreP)}</div>
              <div class="col-6"><i class="bi bi-person-dash me-1"></i>${nombreS ? escapeHTML(nombreS) : 'Sin maestro suplente'}</div>
              <div class="col-6"><i class="bi bi-music-note me-1"></i>${escapeHTML(clase.instrumento || '-')} · ${escapeHTML(clase.nivel || '-')}</div>
              <div class="col-6"><i class="bi bi-people me-1"></i>${alumnos} alumno${alumnos !== 1 ? 's' : ''} inscritos</div>
              <div class="col-6"><i class="bi bi-clock me-1"></i>${escapeHTML(horarioStr)}</div>
              <div class="col-6"><i class="bi bi-door-open me-1"></i>${escapeHTML(clase.salon || 'Sin salón')}</div>
            </div>
          </div>
        </div>
      `
    }).join('')

    section.innerHTML = summaryHtml + clasesHtml
  } catch (err) {
    console.error('[programasView] loadClasesForPrograma error:', err)
    section.innerHTML = '<p class="text-danger small mb-0">Error al cargar las clases del programa.</p>'
  }
}

function openViewModal(id) {
  const p = state.programasOriginales.find(x => x.id === id)
  if (!p) return

  const nivel = getNivelLabel(p.nivel)
  const estadoLabel = p.activo ? 'Activo' : 'Inactivo'
  const estadoDotClass = p.activo ? 'bg-success' : 'bg-secondary'

  const bodyHTML = `
    <div class="programa-profile-container">
      ${renderHeroCard({
        title: p.nombre || 'Programa',
        badgesHtml: `
          <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle" style="font-size: 0.75rem;">${escapeHTML(nivel)}</span>
          <span class="d-inline-block rounded-circle ${estadoDotClass}" style="width: 10px; height: 10px;" title="${estadoLabel}"></span>
        `,
        actionsHtml: `
          <button class="btn btn-outline-primary btn-sm btn-profile-edit" data-id="${p.id}" type="button" title="Editar programa">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-outline-danger btn-sm btn-profile-delete" data-id="${p.id}" type="button" title="Eliminar programa">
            <i class="bi bi-trash"></i>
          </button>
        `,
      })}

      ${renderDetailGrid({
        items: [
          { icon: 'bi-clock', label: 'Duración', value: p.duracion_anios ? `${p.duracion_anios} ${p.duracion_anios === 1 ? 'año' : 'años'}` : 'No especificada' },
          { icon: 'bi-fingerprint', label: 'Identificador', value: `<code>${escapeHTML(p.id)}</code>` },
          { icon: 'bi-calendar-check', label: 'Creado', value: formatDate(p.created_at) },
          { icon: 'bi-calendar-event', label: 'Modificado', value: p.updated_at ? formatDate(p.updated_at) : formatDate(p.created_at) },
        ],
      })}

      ${p.descripcion ? `
        <div class="description-card p-3 rounded mb-4 border bg-body-tertiary">
          <small class="text-muted d-block mb-1"><i class="bi bi-file-earmark-text me-1"></i>Descripción</small>
          <p class="mb-0 text-muted small" style="white-space: pre-line; line-height: 1.5;">${escapeHTML(p.descripcion)}</p>
        </div>
      ` : ''}

      <div class="mt-2">
        <h6 class="fw-bold border-bottom pb-2 mb-3" style="font-size:0.85rem; text-transform:uppercase; letter-spacing:0.05em;">
          <i class="bi bi-collection me-2 text-primary"></i>Clases del programa
        </h6>
        <div id="programa-clases-section">
          <div class="text-center text-muted py-3">
            <span class="spinner-border spinner-border-sm me-2"></span>Cargando clases...
          </div>
        </div>
      </div>
    </div>
  `

  AppModal.open({
    title: `Perfil del Programa: ${escapeHTML(p.nombre || 'Programa')}`,
    hideSave: true,
    body: bodyHTML,
    onShow: (modalBody) => {
      const footer = modalBody.closest('.app-modal-dialog')?.querySelector('.app-modal-footer')
      if (footer) footer.style.setProperty('display', 'none', 'important')

      modalBody.querySelector('.btn-profile-edit')?.addEventListener('click', () => {
        AppModal.close()
        setTimeout(() => openEditModal(id), 250)
      })

      modalBody.querySelector('.btn-profile-delete')?.addEventListener('click', () => {
        AppModal.close()
        setTimeout(() => openDeleteModal(id), 250)
      })

      loadClasesForPrograma(id, modalBody)
    }
  })
}

function openDeleteModal(id) {
  const p = state.programasOriginales.find(x => x.id === id)
  if (!p) return

  AppModal.open({
    title: '⚠️ Eliminar Programa',
    saveText: 'Confirmar Eliminación',
    body: `
      <p>¿Estás seguro de eliminar el programa <strong>${escapeHTML(p.nombre)}</strong>?</p>
      <p class="text-danger small mb-0"><i class="bi bi-exclamation-triangle-fill me-1"></i> Esta acción no se puede deshacer.</p>
    `,
    onSave: async () => {
      try {
        await eliminarPrograma(id)
        state.programasOriginales = state.programasOriginales.filter(x => x.id !== id)
        applyFilters()
        AppToast.success('Programa eliminado')
        return true
      } catch (err) {
        AppToast.error('Error al eliminar')
        return false
      }
    }
  })
}
