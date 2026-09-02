import '../styles/alumnos.css'
import { renderPageHeader, renderFilterPanel } from '../../../shared/components/pageShell.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import {
  obtenerAlumnosInactivos,
  reactivarAlumno,
} from '../api/alumnosApi.js'
import {
  escapeHTML,
  getInitials,
} from '../utils/alumnosUtils.js'
import { formatPhone } from '../../../shared/utils/phoneUtils.js'

function renderLoading(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-secondary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando archivo de alumnos inactivos...</p>
      </div>
    </div>
  `
}

function renderEmpty() {
  return `
    <div class="text-center py-5 w-100 list-group-item text-muted" style="background: transparent; border: none;">
      <div class="mb-3">
        <i class="bi bi-folder-check" style="font-size: 3rem; color: var(--bs-secondary);"></i>
      </div>
      <h4>No hay alumnos inactivos</h4>
      <p class="text-muted mb-0">Todos los alumnos del sistema se encuentran activos actualmente.</p>
    </div>
  `
}

export async function renderAlumnosInactivosView(container) {
  const abortController = new AbortController()
  const state = {
    alumnos: [],
    alumnosOriginales: [],
    totalAlumnos: 0,
    cargando: false,
  }

  try {
    state.cargando = true
    renderLoading(container)

    const { alumnos, total } = await obtenerAlumnosInactivos()
    state.totalAlumnos = total ?? (alumnos || []).length
    state.alumnosOriginales = alumnos || []
    state.alumnos = [...state.alumnosOriginales]
    state.cargando = false

    renderContent(container)
    attachEvents(container)
    applyFilters()
  } catch (error) {
    console.error('[alumnosInactivosView] Error al cargar alumnos inactivos:', error)
    container.innerHTML = `
      <div class="container mt-5">
        <div class="alert alert-danger">
          <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar alumnos inactivos</h5>
          <p>${escapeHTML(error.message || 'Error de conexión')}</p>
          <button class="btn btn-outline-danger btn-sm" id="btnRetryInactivos">
            <i class="bi bi-arrow-clockwise me-1"></i>Reintentar
          </button>
        </div>
      </div>
    `
    container.querySelector('#btnRetryInactivos')?.addEventListener('click', () => renderAlumnosInactivosView(container))
  }

  return {
    teardown: () => abortController.abort(),
  }

  function renderContent(container) {
    const actionsHtml = `
      <button class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1" id="btnVolverActivos" title="Volver al listado de alumnos activos">
        <i class="bi bi-arrow-left"></i> <span>Alumnos Activos</span>
      </button>
    `

    const filtersHtml = `
      <div class="premium-search-container flex-grow-1" style="min-width: 220px;">
        <i class="bi bi-search search-icon-muted"></i>
        <input type="text" class="form-control premium-search-input" placeholder="Buscar por nombre, cédula o email..." id="buscarInactivos" autocomplete="off">
      </div>

      <div class="premium-select-container">
        <i class="bi bi-music-note select-icon-muted"></i>
        <select class="form-select premium-filter-select" id="filtroInstrumentoInactivos">
          <option value="todos">Instrumento (Todos)</option>
          <option value="con_instrumento">Con Instrumento</option>
          <option value="sin_instrumento">Sin Instrumento</option>
        </select>
      </div>

      <button class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" id="btnLimpiarFiltrosInactivos" type="button" title="Limpiar filtros">
        <i class="bi bi-x-circle"></i> <span>Limpiar</span>
      </button>
    `

    container.innerHTML = `
      <div class="page-container">
        ${renderPageHeader({
          icon: 'bi-person-x',
          title: 'Alumnos Inactivos',
          subtitle: `${state.totalAlumnos || state.alumnos.length} alumnos en archivo institucional`,
          actionsHtml,
        })}

        ${renderFilterPanel({
          isOpen: true,
          filtersHtml,
          onToggleId: 'btnToggleFiltrosInactivos',
          badgeId: 'filtrosBadgeCountInactivos',
          subtitle: 'Consulta y reactiva estudiantes que han sido archivados',
        })}

        <div class="alert alert-secondary d-flex align-items-center gap-2 mb-3 py-2 px-3">
          <i class="bi bi-archive-fill fs-5 text-secondary flex-shrink-0"></i>
          <div class="small">
            Este módulo reúne a los alumnos dados de baja. Sus registros no interfieren con las clases activas, y pueden ser reactivados en cualquier momento sin perder asistencias ni historiales previos.
          </div>
        </div>

        <div class="page-glass rounded w-100">
          <div class="list-group list-group-flush w-100" id="inactivosTBody">
            ${renderTableRows(state.alumnos)}
          </div>
          <div id="inactivosEmptyContainer">
            ${state.alumnos.length === 0 ? renderEmpty() : ''}
          </div>
        </div>
      </div>
    `
  }

  function renderTableRows(alumnos) {
    if (!alumnos.length) return ''

    return alumnos.map(a => {
      const nombre = a.nombre || a.nombre_completo || '-'
      const initials = getInitials(nombre)
      const instrumento = a.instrumento || a.instrumento_principal || 'Sin instrumento'

      return `
        <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent border-accent-secondary" data-id="${a.id}">
          <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden" data-action="view" data-id="${a.id}" style="cursor: pointer;">
            <div class="position-relative flex-shrink-0">
              <div class="avatar-compact bg-secondary bg-opacity-10 text-secondary border border-secondary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
                ${initials}
              </div>
              <span class="position-absolute bottom-0 end-0 p-1 bg-secondary border border-light rounded-circle" style="transform: translate(10%, 10%);"></span>
            </div>
            <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
              <div class="d-flex align-items-center gap-2">
                <span class="fw-bold text-truncate text-body-secondary" style="font-size: 1.05rem;">${escapeHTML(nombre)}</span>
                <span class="badge bg-secondary-subtle text-secondary-emphasis border">Inactivo</span>
              </div>
              <small class="text-muted text-truncate">
                ${escapeHTML(instrumento)} ${a.familiar_nombre ? `• Rep: ${escapeHTML(a.familiar_nombre)}` : ''} ${a.telefono ? `• ${formatPhone(a.telefono)}` : ''}
              </small>
            </div>
          </div>

          <div class="d-flex align-items-center gap-2 flex-shrink-0">
            <button class="btn btn-sm btn-outline-success d-flex align-items-center gap-1" data-action="reactivate" data-id="${a.id}" title="Reactivar alumno">
              <i class="bi bi-arrow-counterclockwise"></i> <span class="d-none d-sm-inline">Reactivar</span>
            </button>
            <button class="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center" data-action="view" data-id="${a.id}" title="Ver perfil" style="height: 32px; width: 32px; min-height: 32px; padding: 0;">
              <i class="bi bi-person-lines-fill"></i>
            </button>
          </div>
        </div>
      `
    }).join('')
  }

  function attachEvents(container) {
    const signal = abortController.signal

    container.querySelector('#btnVolverActivos')?.addEventListener('click', () => {
      if (window.router?.navigate) {
        window.router.navigate('alumnos')
      }
    }, { signal })

    const toggleBtn = container.querySelector('#btnToggleFiltrosInactivos')
    const filterBody = container.querySelector('#btnToggleFiltrosInactivosBody')
    toggleBtn?.addEventListener('click', () => {
      const isOpen = filterBody?.classList.toggle('is-open')
      filterBody?.classList.toggle('is-collapsed', !isOpen)
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
      const icon = toggleBtn.querySelector('i')
      if (icon) icon.className = `bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`
    }, { signal })

    const searchInput = container.querySelector('#buscarInactivos')
    searchInput?.addEventListener('input', applyFilters, { signal })

    container.querySelector('#filtroInstrumentoInactivos')?.addEventListener('change', applyFilters, { signal })

    container.querySelector('#btnLimpiarFiltrosInactivos')?.addEventListener('click', () => {
      if (searchInput) searchInput.value = ''
      const iSelect = container.querySelector('#filtroInstrumentoInactivos')
      if (iSelect) iSelect.value = 'todos'
      applyFilters()
    }, { signal })

    const tbody = container.querySelector('#inactivosTBody')
    tbody?.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-action]')
      if (!btn) {
        const row = e.target.closest('.list-group-item[data-id]')
        if (row && window.router?.navigate) window.router.navigate(`alumnos/${row.dataset.id}`, { id: row.dataset.id })
        return
      }

      const action = btn.dataset.action
      const id = btn.dataset.id

      if (action === 'view') {
        if (window.router?.navigate) window.router.navigate(`alumnos/${id}`, { id })
      } else if (action === 'reactivate') {
        openReactivateModal(id)
      }
    }, { signal })
  }

  function openReactivateModal(id) {
    const alumno = state.alumnosOriginales.find(a => a.id === id)
    if (!alumno) return

    AppModal.open({
      title: 'Reactivar Alumno',
      saveText: 'Confirmar Reactivación',
      saveClass: 'btn-success',
      cancelText: 'Cancelar',
      body: `
        <div class="p-2">
          <p>¿Deseas reactivar al alumno <strong>${escapeHTML(alumno.nombre || alumno.nombre_completo)}</strong>?</p>
          <p class="text-muted small mb-0">El alumno volverá a aparecer en el listado de <strong>Alumnos Activos</strong> y estará habilitado para asignación de clases y asistencias.</p>
        </div>
      `,
      onSave: async () => {
        try {
          await reactivarAlumno(id)
          AppToast.success('Alumno reactivado correctamente')
          state.alumnosOriginales = state.alumnosOriginales.filter(a => a.id !== id)
          state.totalAlumnos = Math.max(0, (state.totalAlumnos || 1) - 1)
          applyFilters()
          return true
        } catch (err) {
          console.error('[alumnosInactivosView] Error reactivando alumno:', err)
          AppToast.error(err.message || 'Error al reactivar el alumno')
          return false
        }
      }
    })
  }

  function applyFilters() {
    const searchInput = container.querySelector('#buscarInactivos')
    const searchTerm = searchInput?.value.trim().toLowerCase() || ''
    const filtroInstrumento = container.querySelector('#filtroInstrumentoInactivos')?.value || 'todos'

    state.alumnos = state.alumnosOriginales.filter(a => {
      const nombre = a.nombre || a.nombre_completo || ''
      const inst = a.instrumento || a.instrumento_principal || ''
      const tel = a.telefono || a.familiar_telefono || ''
      const rep = a.familiar_nombre || ''
      const email = a.email || a.correo_representante || ''
      const ced = a.cedula || a.representante_cedula || ''

      const matchSearch = !searchTerm ||
        nombre.toLowerCase().includes(searchTerm) ||
        inst.toLowerCase().includes(searchTerm) ||
        tel.toLowerCase().includes(searchTerm) ||
        rep.toLowerCase().includes(searchTerm) ||
        email.toLowerCase().includes(searchTerm) ||
        ced.toLowerCase().includes(searchTerm)

      const tieneInstrumento = !!inst && inst !== 'Sin instrumento'
      const matchInstrumento = filtroInstrumento === 'todos' ||
        (filtroInstrumento === 'con_instrumento' && tieneInstrumento) ||
        (filtroInstrumento === 'sin_instrumento' && !tieneInstrumento)

      return matchSearch && matchInstrumento
    })

    const tbody = container.querySelector('#inactivosTBody')
    const emptyContainer = container.querySelector('#inactivosEmptyContainer')
    if (tbody) {
      tbody.innerHTML = state.alumnos.length === 0 ? '' : renderTableRows(state.alumnos)
    }
    if (emptyContainer) {
      emptyContainer.innerHTML = state.alumnos.length === 0 ? renderEmpty() : ''
    }
  }
}
