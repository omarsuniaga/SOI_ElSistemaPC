import '../styles/maestros.css'
import { Toast } from 'bootstrap'
import { AppModal } from '../../../shared/components/AppModal.js'
import {
  obtenerMaestros,
  crearMaestro,
  actualizarMaestro,
  inactivarMaestro,
  activarMaestro,
  eliminarMaestro,
  validarEmail,
} from '../api/maestrosApi.js'
import { escapeHTML, getStatusColor, getStatusLabel, getInitials } from '../utils/maestrosUtils.js'
import { obtenerClasesPorMaestro, actualizarClase } from '../../clases/api/clasesApi.js'

const state = {
  maestros: [],
  maestrosOriginales: [],
  editando: null,
  deletingId: null,
}

const VALIDATION = {
  nombreMax: 100,
}

let currentContainer = null

// ─── Entry point ────────────────────────────────────────────────────────────

const ESPECTACULOS_PREDEFINIDOS = [
  'Piano', 'Guitarra', 'Violín', 'Viola', 'Cello', 'Contrabajo',
  'Flauta', 'Clarinete', 'Oboe', 'Fagot', 'Saxofón', 'Trompeta',
  'Trombón', 'Corno', 'Tuba', 'Percusión', 'Batería', 'Canto',
  'Teoría', 'Solfeo', 'Dirección', 'Composición', 'Arreglos'
]

export async function renderMaestrosView(container) {
  try {
    renderLoading(container)
    const maestros = await obtenerMaestros()
    state.maestros = maestros
    state.maestrosOriginales = [...maestros]
    renderContent(container)
    attachEvents(container)
  } catch (error) {
    console.error(error)
    renderError(container, error.message)
  }
}

// ─── Render helpers ─────────────────────────────────────────────────────────

function renderLoading(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando maestros...</p>
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
              <i class="bi bi-exclamation-triangle"></i> Error al cargar
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
  container.querySelector('#retryBtn')?.addEventListener('click', () => renderMaestrosView(container))
}

function renderEspecialidadesChips(especialidades = [], inputId = 'modal-especialidades-input') {
  const containerId = 'modal-especialidades-container'
  return `
    <div class="mb-3">
      <label class="form-label-compact">Especialidades</label>
      <div class="especialidades-chips-container" id="${containerId}">
        <div class="chips-wrapper d-flex flex-wrap gap-1 mb-2">
          ${especialidades.map(e => `
            <span class="badge bg-primary-subtle text-primary rounded-pill chip-item">
              ${escapeHTML(e)}
              <i class="bi bi-x-lg chip-remove" data-especialidad="${escapeHTML(e)}" style="cursor:pointer;margin-left:4px;"></i>
            </span>
          `).join('')}
        </div>
        <div class="d-flex gap-2">
          <input type="text" class="form-control input-dense" id="${inputId}" placeholder="Escribir y presionar Enter...">
          <button type="button" class="btn btn-outline-secondary btn-sm-compact" id="btnAddEspecialidad">
            <i class="bi bi-plus-lg"></i>
          </button>
        </div>
        <div class="mt-2">
          <small class="text-muted">Sugerencias:</small>
          <div class="d-flex flex-wrap gap-1 mt-1">
            ${ESPECTACULOS_PREDEFINIDOS.slice(0, 8).map(e => `
              <button type="button" class="btn btn-link btn-sm p-0 suggest-chip" data-especialidad="${escapeHTML(e)}">${escapeHTML(e)}</button>
            `).join(', ')}
          </div>
        </div>
      </div>
    </div>
  `
}

function getEspecialidadesFromModal(modalBody) {
  const container = modalBody.querySelector('.especialidades-chips-container')
  if (!container) return []
  const chips = container.querySelectorAll('.chip-item')
  return Array.from(chips).map(chip => chip.textContent.replace(/×$/, '').trim())
}

function attachEspecialidadesEvents(modalBody, onChange) {
  const input = modalBody.querySelector('#modal-especialidades-input')
  const addBtn = modalBody.querySelector('#btnAddEspecialidad')
  const container = modalBody.querySelector('.especialidades-chips-container')

  const addEspecialidad = (value) => {
    const trimmed = value.trim()
    if (!trimmed) return
    const current = getEspecialidadesFromModal(modalBody)
    if (!current.includes(trimmed)) {
      const wrapper = container.querySelector('.chips-wrapper')
      const chip = document.createElement('span')
      chip.className = 'badge bg-primary-subtle text-primary rounded-pill chip-item'
      chip.innerHTML = `${escapeHTML(trimmed)}<i class="bi bi-x-lg chip-remove" data-especialidad="${escapeHTML(trimmed)}" style="cursor:pointer;margin-left:4px;"></i>`
      wrapper.appendChild(chip)
      if (onChange) onChange()
    }
    input.value = ''
  }

  input?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addEspecialidad(input.value)
    }
  })

  addBtn?.addEventListener('click', () => addEspecialidad(input.value))

  container?.addEventListener('click', (e) => {
    if (e.target.classList.contains('chip-remove')) {
      e.target.closest('.chip-item').remove()
      if (onChange) onChange()
    }
    if (e.target.classList.contains('suggest-chip')) {
      e.preventDefault()
      addEspecialidad(e.target.dataset.especialidad)
    }
  })
}

function renderContent(container) {
  container.innerHTML = `
    <div class="page-container">
      <div class="maestros-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-person-check fs-4"></i>
          </div>
          <div>
            <h1 class="maestros-title-premium mb-0">Maestros</h1>
            <p class="text-muted small mb-0">${state.maestros.length} maestros en total</p>
          </div>
        </div>
        
        <div class="maestros-header-actions">
          <button class="btn btn-outline-success btn-sm-compact me-2" id="btnExportarCSV" title="Exportar CSV">
            <i class="bi bi-file-earmark-spreadsheet"></i> CSV
          </button>
          <button class="btn btn-premium-action" id="btnAgregarMaestro">
            <i class="bi bi-plus-lg me-1.5"></i>Nuevo Maestro
          </button>
        </div>
      </div>

      <div class="maestros-filter-toolbar mb-4">
        <div class="premium-search-container flex-grow-1">
          <i class="bi bi-search search-icon-muted"></i>
          <input type="text" class="form-control premium-search-input" placeholder="Buscar maestro..." id="buscar" autocomplete="off">
        </div>
        
        <div class="premium-select-container">
          <i class="bi bi-funnel select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="filtroEstado">
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
      </div>

      <div class="page-glass rounded w-100">
        <div class="list-group list-group-flush w-100" id="maestrosTBody">
          ${renderTableRows(state.maestros)}
        </div>
      </div>

      <div class="toast-container position-fixed top-0 end-0 p-3" id="toastContainer"></div>
    </div>
  `
}

function renderTableRows(maestros) {
  if (!maestros.length) {
    return `
      <div class="text-center py-5 w-100 text-muted list-group-item" style="background: transparent; border: none;">
        <i class="bi bi-inbox fs-1 d-block mb-3" style="color: var(--bs-secondary);"></i>
        No hay maestros registrados.
      </div>`
  }
  return maestros.map(a => {
    const nombre = a.nombre || a.name || '-'
    const isActive = a.is_active ?? true
    const accentClass = `border-accent-${isActive ? 'success' : 'secondary'}`
    const statusDotClass = `bg-${isActive ? 'success' : 'secondary'}`
    return `
      <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${accentClass}" data-id="${a.id}" style="cursor: pointer;">
        <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
          <div class="position-relative flex-shrink-0">
            <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
              ${getInitials(nombre)}
            </div>
            <span class="position-absolute bottom-0 end-0 p-1 ${statusDotClass} border border-light rounded-circle" style="transform: translate(10%, 10%);"></span>
          </div>
          <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
            <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${escapeHTML(nombre)}</span>
            <small class="text-muted text-truncate">
              ${escapeHTML(a.instrumento || 'Sin instrumento especificado')}
            </small>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2 flex-shrink-0">
          ${a.telefono ? `
            <button class="btn btn-sm btn-success bg-gradient text-white rounded-pill px-3 shadow-sm d-flex align-items-center gap-2" data-action="whatsapp" data-id="${a.id}" title="Enviar WhatsApp" style="min-height: 32px;" ${!isActive ? 'disabled' : ''}>
              <i class="bi bi-whatsapp"></i> <span class="d-none d-sm-inline fw-medium">${escapeHTML(a.telefono)}</span>
            </button>
          ` : '<span class="badge bg-light text-muted border d-none d-sm-inline-block">Sin número</span>'}
          <i class="bi bi-chevron-right text-muted ms-1" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
        </div>
      </div>
    `
  }).join('')
}

// ─── Events ─────────────────────────────────────────────────────────────────

function attachEvents(container) {
  currentContainer = container

  container.querySelector('#btnAgregarMaestro').addEventListener('click', () => openCreateModal())

  container.querySelector('#btnExportarCSV')?.addEventListener('click', () => exportarMaestrosCSV())

  container.querySelector('#buscar').addEventListener('input', () => applyFilters())
  container.querySelector('#filtroEstado').addEventListener('change', () => applyFilters())

  container.querySelector('#maestrosTBody').addEventListener('click', e => {
    const row = e.target.closest('.list-group-item[data-id]')
    if (row && !e.target.closest('[data-action]')) {
      openViewModal(row.dataset.id)
      return
    }

    const btn = e.target.closest('[data-action]')
    if (!btn) return
    const id = btn.dataset.id
    const action = btn.dataset.action
    if (action === 'edit') openEditModal(id)
    else if (action === 'delete') openDeleteModal(id)
    else if (action === 'whatsapp') openWhatsAppModal(id)
  })
}

function openWhatsAppModal(id) {
  const maestro = state.maestrosOriginales.find(a => a.id === id)
  if (!maestro || !maestro.telefono) return

  const telefonoLimpio = maestro.telefono.replace(/\D/g, '')

  AppModal.open({
    title: 'Enviar WhatsApp a ' + escapeHTML(maestro.nombre || maestro.name || ''),
    size: 'md',
    saveText: 'Enviar WhatsApp',
    body: `
      <div class="mb-3">
        <label class="form-label-compact">Número de destino</label>
        <p class="form-control-plaintext fw-bold mb-0">
          <i class="bi bi-whatsapp text-success me-1"></i> +${telefonoLimpio}
        </p>
      </div>
      <div class="mb-3">
        <label class="form-label-compact">Mensaje</label>
        <textarea class="form-control input-dense" id="modal-whatsapp-msg" rows="4" placeholder="Escribe tu mensaje aquí..."></textarea>
      </div>
      <p class="text-muted small mb-0">
        Se abrirá WhatsApp Web (o la aplicación) con el mensaje listo para ser enviado.
      </p>
    `,
    onSave: async (modalBody) => {
      const msg = modalBody.querySelector('#modal-whatsapp-msg').value.trim()
      const url = `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(msg)}`
      window.open(url, '_blank')
    }
  })
}

// ─── Filters ─────────────────────────────────────────────────────────────────

function applyFilters() {
  const searchTerm = currentContainer.querySelector('#buscar').value.trim().toLowerCase()
  const filtroEstado = currentContainer.querySelector('#filtroEstado').value

  state.maestros = state.maestrosOriginales.filter(a => {
    const nombre = (a.nombre || a.name || '').toLowerCase()
    const matchSearch = !searchTerm ||
      nombre.includes(searchTerm) ||
      (a.email || '').toLowerCase().includes(searchTerm) ||
      (a.instrumento || '').toLowerCase().includes(searchTerm) ||
      (a.especialidad || '').toLowerCase().includes(searchTerm) ||
      (a.especialidades || []).some(e => e.toLowerCase().includes(searchTerm))

    const isActive = a.is_active ?? true
    const matchEstado = filtroEstado === 'todos' ||
      (filtroEstado === 'activo' && isActive) ||
      (filtroEstado === 'inactivo' && !isActive)

    return matchSearch && matchEstado
  })

  refreshTable()
}

// ─── Modal openers ───────────────────────────────────────────────────────────

function openCreateModal() {
  state.editando = null
  AppModal.open({
    title: 'Crear Nuevo Maestro',
    body: `<form class="row g-2" novalidate>
      <div class="col-12">
        <label class="form-label-compact">Nombre Completo *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required maxlength="${VALIDATION.nombreMax}" placeholder="Juan Pérez">
        <small class="text-muted" id="modal-nombreCount">0/${VALIDATION.nombreMax}</small>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Email *</label>
        <input type="email" class="form-control input-dense" id="modal-email" required placeholder="email@ejemplo.com">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Teléfono</label>
        <input type="text" class="form-control input-dense" id="modal-telefono" placeholder="+58 412 1234567">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Instrumento *</label>
        <input type="text" class="form-control input-dense" id="modal-instrumento" required placeholder="Violín">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Especialidad</label>
        <input type="text" class="form-control input-dense" id="modal-especialidad" placeholder="Dirección">
      </div>
      ${renderEspecialidadesChips([], 'modal-especialidades-input')}
      <div class="col-12">
        <label class="form-label-compact">Biografía</label>
        <textarea class="form-control input-dense" id="modal-bio" rows="2" placeholder="Breve descripción..."></textarea>
      </div>
      <div class="col-12">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="modal-esActivo" checked>
          <label class="form-check-label" for="modal-esActivo">Maestro activo</label>
        </div>
      </div>
    </form>`,
    onShow: (modalBody) => attachEspecialidadesEvents(modalBody),
    saveText: 'Guardar',
    onSave: async (modalBody) => {
      const nombre = modalBody.querySelector('#modal-nombre').value.trim()
      const email = modalBody.querySelector('#modal-email').value.trim().toLowerCase()
      const telefono = modalBody.querySelector('#modal-telefono').value.trim()
      const instrumento = modalBody.querySelector('#modal-instrumento').value.trim()
      const especialidad = modalBody.querySelector('#modal-especialidad').value.trim()
      const bio = modalBody.querySelector('#modal-bio').value.trim()
      const esActivo = modalBody.querySelector('#modal-esActivo').checked

      if (!nombre) { showToast('El nombre es obligatorio', 'error'); return false }
      if (!email) { showToast('El email es obligatorio', 'error'); return false }
      if (!isValidEmail(email)) { showToast('El formato del email no es válido', 'error'); return false }

      if (email) {
        const emailExiste = await validarEmail(email)
        if (emailExiste) { showToast('El email ya está registrado', 'error'); return false }
      }

      const especialidades = getEspecialidadesFromModal(modalBody)
      const datosMaestro = { nombre, email: email || null, telefono: telefono || null, instrumento: instrumento || null, especialidad: especialidad || null, bio: bio || null, is_active: esActivo, especialidades }
      const nuevo = await crearMaestro(datosMaestro)
      state.maestrosOriginales.push(nuevo)
      applyFilters()
      showToast('Maestro creado exitosamente', 'success')
    }
  })
}

function openEditModal(id) {
  const maestro = state.maestrosOriginales.find(a => a.id === id)
  if (!maestro) { showToast('Maestro no encontrado', 'error'); return }

  state.editando = id
  AppModal.open({
    title: 'Editar Maestro',
    body: `<form class="row g-2" novalidate>
      <div class="col-12">
        <label class="form-label-compact">Nombre Completo *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required maxlength="${VALIDATION.nombreMax}" value="${escapeHTML(maestro.nombre || maestro.name || '')}">
        <small class="text-muted" id="modal-nombreCount">${(maestro.nombre || maestro.name || '').length}/${VALIDATION.nombreMax}</small>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Email *</label>
        <input type="email" class="form-control input-dense" id="modal-email" required value="${escapeHTML(maestro.email || '')}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Teléfono</label>
        <input type="text" class="form-control input-dense" id="modal-telefono" value="${escapeHTML(maestro.telefono || '')}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Instrumento *</label>
        <input type="text" class="form-control input-dense" id="modal-instrumento" required value="${escapeHTML(maestro.instrumento || '')}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Especialidad</label>
        <input type="text" class="form-control input-dense" id="modal-especialidad" value="${escapeHTML(maestro.especialidad || '')}">
      </div>
      ${renderEspecialidadesChips(maestro.especialidades || [], 'modal-especialidades-input')}
      <div class="col-12">
        <label class="form-label-compact">Biografía</label>
        <textarea class="form-control input-dense" id="modal-bio" rows="2">${escapeHTML(maestro.bio || '')}</textarea>
      </div>
      <div class="col-12">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="modal-esActivo" ${maestro.is_active !== false ? 'checked' : ''}>
          <label class="form-check-label" for="modal-esActivo">Maestro activo</label>
        </div>
      </div>
    </form>`,
    onShow: (modalBody) => attachEspecialidadesEvents(modalBody),
    saveText: 'Guardar cambios',
    onSave: async (modalBody) => {
      const nombre = modalBody.querySelector('#modal-nombre').value.trim()
      const email = modalBody.querySelector('#modal-email').value.trim().toLowerCase()
      const telefono = modalBody.querySelector('#modal-telefono').value.trim()
      const instrumento = modalBody.querySelector('#modal-instrumento').value.trim()
      const especialidad = modalBody.querySelector('#modal-especialidad').value.trim()
      const bio = modalBody.querySelector('#modal-bio').value.trim()
      const esActivo = modalBody.querySelector('#modal-esActivo').checked

      if (!nombre) { showToast('El nombre es obligatorio', 'error'); return false }
      if (!email) { showToast('El email es obligatorio', 'error'); return false }
      if (!isValidEmail(email)) { showToast('El formato del email no es válido', 'error'); return false }

      if (email && maestro.email !== email) {
        const emailExiste = await validarEmail(email)
        if (emailExiste) { showToast('El email ya está registrado', 'error'); return false }
      }

      const especialidades = getEspecialidadesFromModal(modalBody)
      const datosMaestro = { nombre, email: email || null, telefono: telefono || null, instrumento: instrumento || null, especialidad: especialidad || null, bio: bio || null, is_active: esActivo, especialidades }
      await actualizarMaestro(state.editando, datosMaestro)
      const idx = state.maestrosOriginales.findIndex(a => a.id === state.editando)
      if (idx !== -1) state.maestrosOriginales[idx] = { ...state.maestrosOriginales[idx], ...datosMaestro }
      applyFilters()
      showToast('Maestro actualizado correctamente', 'success')
    }
  })
}

function openViewModal(id) {
  const maestro = state.maestrosOriginales.find(a => a.id === id)
  if (!maestro) { showToast('Maestro no encontrado', 'error'); return }

  const nombre = maestro.nombre || maestro.name || '-'
  const isActive = maestro.is_active ?? true
  AppModal.open({
    title: nombre,
    hideSave: true,
    cancelText: 'Cerrar',
    body: `
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Nombre</label>
            <p class="form-control-plaintext">${escapeHTML(nombre)}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Email</label>
            <p class="form-control-plaintext">${maestro.email ? `<a href="mailto:${escapeHTML(maestro.email)}">${escapeHTML(maestro.email)}</a>` : '-'}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Teléfono</label>
            <p class="form-control-plaintext">${escapeHTML(maestro.telefono || '-')}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Instrumento</label>
            <p class="form-control-plaintext">${escapeHTML(maestro.instrumento || '-')}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Especialidad</label>
            <p class="form-control-plaintext">${escapeHTML(maestro.especialidad || '-')}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Especialidades</label>
            <p class="form-control-plaintext">
              ${(maestro.especialidades || []).length 
                ? maestro.especialidades.map(e => `<span class="badge bg-primary-subtle text-primary me-1">${escapeHTML(e)}</span>`).join('')
                : 'Sin especialidades'}
            </p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Estado</label>
            <p class="form-control-plaintext">
              <span class="badge ${getStatusColor(isActive)}">${getStatusLabel(isActive)}</span>
            </p>
          </div>
        </div>
      </div>
      <hr>
      <div class="mb-4">
        <label class="form-label fw-bold">Biografía</label>
        <p class="form-control-plaintext">${escapeHTML(maestro.bio || 'Sin biografía')}</p>
      </div>
      <hr>
      <div class="mb-4">
        <label class="form-label fw-bold"><i class="bi bi-book"></i> Clases Asignadas</label>
        <div id="maestro-clases-container" class="mt-2">
          <div class="text-muted"><div class="spinner-border spinner-border-sm text-primary me-2"></div> Cargando clases...</div>
        </div>
      </div>
      
      <div class="d-flex justify-content-end gap-2 pt-3 border-top mt-auto">
        <button class="btn btn-outline-danger" id="modal-view-btn-delete">
          <i class="bi bi-trash me-1"></i> Eliminar
        </button>
        <button class="btn btn-primary" id="modal-view-btn-edit">
          <i class="bi bi-pencil me-1"></i> Editar Perfil
        </button>
      </div>
    `,
    onShow: async (modalBody) => {
      modalBody.querySelector('#modal-view-btn-edit')?.addEventListener('click', () => {
        AppModal.close()
        setTimeout(() => openEditModal(id), 300)
      })
      modalBody.querySelector('#modal-view-btn-delete')?.addEventListener('click', () => {
        AppModal.close()
        setTimeout(() => openDeleteModal(id), 300)
      })

      // Fetch and render classes
      const container = modalBody.querySelector('#maestro-clases-container')
      try {
        const clases = await obtenerClasesPorMaestro(id)
        if (clases.length === 0) {
          container.innerHTML = '<p class="text-muted small">No tiene clases asignadas actualmente.</p>'
        } else {
          container.innerHTML = '<ul class="list-group">' + clases.map(c => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong style="font-size: 0.95rem;">${escapeHTML(c.nombre)}</strong>
                <div class="small text-muted">${escapeHTML(c.instrumento || 'Sin instrumento')}</div>
              </div>
              <button class="btn btn-sm btn-outline-danger btn-desvincular-clase" data-clase-id="${c.id}" data-clase-nombre="${escapeHTML(c.nombre)}" title="Desvincular Maestro">
                <i class="bi bi-x-circle"></i> Desvincular
              </button>
            </li>
          `).join('') + '</ul>'

          // Add event listeners for desvincular
          container.querySelectorAll('.btn-desvincular-clase').forEach(btn => {
            btn.addEventListener('click', async (e) => {
              const claseId = e.currentTarget.dataset.claseId
              const claseNombre = e.currentTarget.dataset.claseNombre
              if (confirm(`¿Seguro que deseas desvincular a este maestro de la clase "${claseNombre}"?`)) {
                try {
                  e.currentTarget.disabled = true
                  e.currentTarget.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'
                  await actualizarClase(claseId, { maestro_principal_id: null }, true) // force true to avoid overlap checks issues
                  showToast('Maestro desvinculado de la clase', 'success')
                  
                  // Re-render modal by closing and opening it again quickly
                  AppModal.close()
                  setTimeout(() => openViewModal(id), 300)
                } catch(error) {
                  showToast('Error al desvincular: ' + error.message, 'error')
                  e.currentTarget.disabled = false
                  e.currentTarget.innerHTML = '<i class="bi bi-x-circle"></i> Desvincular'
                }
              }
            })
          })
        }
      } catch (error) {
        container.innerHTML = '<p class="text-danger small"><i class="bi bi-exclamation-triangle"></i> Error al cargar las clases.</p>'
      }
    }
  })
}

function openDeleteModal(id) {
  const maestro = state.maestrosOriginales.find(a => a.id === id)
  if (!maestro) { showToast('Maestro no encontrado', 'error'); return }

  state.deletingId = id
  const nombre = maestro.nombre || maestro.name || ''
  const isActive = maestro.is_active !== false

  AppModal.open({
    title: isActive ? '⏸️ Desactivar Maestro' : '▶️ Reactivar Maestro',
    size: 'sm',
    saveText: isActive ? 'Desactivar' : 'Reactivar',
    body: isActive
      ? `<p>¿Desactivar al maestro <strong>${escapeHTML(nombre)}</strong>?</p>
         <p class="text-muted small mb-0">El maestro no aparecerá en las listas, pero sus datos se conservarán.</p>`
      : `<p>¿Reactivar al maestro <strong>${escapeHTML(nombre)}</strong>?</p>
         <p class="text-muted small mb-0">El maestro volverá a aparecer en las listas.</p>`,
    onSave: async () => {
      if (isActive) {
        await inactivarMaestro(id)
        showToast('Maestro desactivado correctamente', 'success')
      } else {
        await activarMaestro(id)
        showToast('Maestro reactivado correctamente', 'success')
      }
      applyFilters()
    }
  })
}

// ─── Utils ───────────────────────────────────────────────────────────────────

function refreshTable() {
  const tbody = currentContainer.querySelector('#maestrosTBody')
  if (!tbody) return
  tbody.innerHTML = renderTableRows(state.maestros)
  const countEl = currentContainer.querySelector('.maestros-header-premium p.text-muted')
  if (countEl) countEl.textContent = `${state.maestros.length} maestros en total`
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function exportarMaestrosCSV() {
  if (state.maestrosOriginales.length === 0) {
    showToast('No hay maestros para exportar', 'error')
    return
  }

  const headers = ['Nombre', 'Email', 'Teléfono', 'Instrumento', 'Especialidad', 'Estado']
  const rows = state.maestrosOriginales.map(m => [
    m.nombre || '',
    m.email || '',
    m.telefono || '',
    m.instrumento || '',
    m.especialidad || '',
    m.is_active !== false ? 'Activo' : 'Inactivo'
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `maestros-${new Date().toISOString().split('T')[0]}.csv`
  link.click()

  showToast('CSV exportado exitosamente', 'success')
}

function showToast(message, type = 'info') {
  const toastContainer = currentContainer.querySelector('#toastContainer')
  if (!toastContainer) return

  const bgClass = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-info'
  const iconClass = type === 'success' ? 'bi-check-circle' : type === 'error' ? 'bi-exclamation-circle' : 'bi-info-circle'
  const label = type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : 'Información'

  const toastEl = document.createElement('div')
  toastEl.className = 'toast'
  toastEl.setAttribute('role', 'alert')
  toastEl.setAttribute('aria-live', 'assertive')
  toastEl.setAttribute('aria-atomic', 'true')
  toastEl.innerHTML = `
    <div class="toast-header ${bgClass} text-white">
      <i class="bi ${iconClass} me-2"></i>
      <strong class="me-auto">${label}</strong>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
    </div>
    <div class="toast-body">${escapeHTML(message)}</div>
  `
  toastContainer.appendChild(toastEl)
  const t = new Toast(toastEl, { autohide: true, delay: 3000 })
  t.show()
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove())
}
