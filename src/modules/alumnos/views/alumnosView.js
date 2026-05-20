import '../styles/alumnos.css'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import {
  obtenerAlumnos,
  crearAlumno,
  actualizarAlumno,
  eliminarAlumno,
  PARENTESCOS,
  getParentescoLabel,
} from '../api/alumnosApi.js'
import {
  formatDate,
  calcularEdad,
  escapeHTML,
  isValidEmail,
  formatGenero,
  getGeneroIcon,
  getEstadoClass,
  getEstadoLabel,
  getInitials,
} from '../utils/alumnosUtils.js'

const state = {
  alumnos: [],
  alumnosOriginales: [],
  cargando: false,
  editando: null,
  viewingId: null,
  deletingId: null,
  filtroGenero: '',
  filtroEstado: 'todos',
}

let currentContainer = null

const VALIDATION = {
  nombreMax: 100,
  emailMax: 100,
  cedulaMax: 20,
  telefonoMax: 20,
  acudienteMax: 100,
  direccionMax: 255,
  sectionMax: 100,
}



export async function renderAlumnosView(container) {
  try {
    state.cargando = true
    renderLoading(container)

    const alumnos = await obtenerAlumnos()
    state.alumnos = alumnos
    state.alumnosOriginales = [...alumnos]
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
        <p class="text-muted">Cargando alumnos...</p>
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
  document.getElementById('retryBtn')?.addEventListener('click', () => renderAlumnosView(container))
}

function renderContent(container) {
  container.innerHTML = `
    <div class="page-container">
      <div class="alumnos-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-people fs-4"></i>
          </div>
          <div>
            <h1 class="alumnos-title-premium mb-0">Alumnos</h1>
            <p class="text-muted small mb-0">${state.alumnos.length} alumnos en total</p>
          </div>
        </div>
        
        <div class="alumnos-header-actions">
          <button class="btn btn-outline-success btn-sm-compact me-2" id="btnExportarCSV" title="Exportar CSV">
            <i class="bi bi-file-earmark-spreadsheet"></i> CSV
          </button>
          <button class="btn btn-premium-action" id="btnAgregarAlumno">
            <i class="bi bi-plus-lg me-1.5"></i>Nuevo Alumno
          </button>
        </div>
      </div>

      <div class="alumnos-filter-toolbar mb-4">
        <div class="premium-search-container flex-grow-1">
          <i class="bi bi-search search-icon-muted"></i>
          <input type="text" class="form-control premium-search-input" placeholder="Buscar alumno..." id="buscar" autocomplete="off">
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
        <div class="list-group list-group-flush w-100" id="alumnosTBody">
          ${renderTableRows(state.alumnos)}
        </div>
        <div id="emptyContainer">
          ${state.alumnos.length === 0 ? renderEmpty() : ''}
        </div>
      </div>

    </div>
  `
}

function renderTableRows(alumnos) {
  if (!alumnos.length) return ''

  return alumnos.map(a => {
    const nombre = a.nombre || '-'
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
              ${escapeHTML(a.instrumento || 'Sin instrumento especificado')} ${a.familiar_nombre ? `• Rep: ${escapeHTML(a.familiar_nombre)}` : ''}
            </small>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2 flex-shrink-0">
          ${a.telefono ? `
            <button class="btn btn-sm btn-success bg-gradient text-white rounded-pill px-3 shadow-sm d-flex align-items-center gap-2" data-action="whatsapp" data-id="${a.id}" title="Enviar WhatsApp" style="min-height: 32px;">
              <i class="bi bi-whatsapp"></i> <span class="d-none d-sm-inline fw-medium">${escapeHTML(a.telefono)}</span>
            </button>
          ` : '<span class="badge bg-light text-muted border d-none d-sm-inline-block">Sin número</span>'}
          <i class="bi bi-chevron-right text-muted ms-1" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
        </div>
      </div>
    `
  }).join('')
}

function renderEmpty() {
  return `
    <div class="text-center py-5 w-100 list-group-item text-muted" style="background: transparent; border: none;">
      <div class="mb-3">
        <i class="bi bi-inbox" style="font-size: 3rem; color: var(--bs-secondary);"></i>
      </div>
      <h4>No hay alumnos</h4>
      <p class="text-muted mb-0">Crea tu primer alumno haciendo clic en el botón "Nuevo"</p>
    </div>
  `
}

function attachGlobalEvents(container) {
  currentContainer = container

  container.querySelector('#btnAgregarAlumno')?.addEventListener('click', () => openCreateModal())

  container.querySelector('#btnExportarCSV')?.addEventListener('click', () => exportarAlumnosCSV())

  const searchInput = container.querySelector('#buscar')
  searchInput?.addEventListener('input', applyFilters)

  container.querySelector('#filtroEstado')?.addEventListener('change', applyFilters)

  const tbody = container.querySelector('#alumnosTBody')
  tbody?.addEventListener('click', async (e) => {
    const row = e.target.closest('.list-group-item[data-id]')
    if (row && !e.target.closest('[data-action]')) {
      openViewModal(row.dataset.id)
      return
    }

    const btn = e.target.closest('[data-action]')
    if (!btn) return
    const id = btn.dataset.id
    if (btn.dataset.action === 'edit') {
      openEditModal(id)
    } else if (btn.dataset.action === 'delete') {
      openDeleteModal(id)
    } else if (btn.dataset.action === 'whatsapp') {
      openWhatsAppModal(id)
    }
  })
}

function openWhatsAppModal(id) {
  const alumno = state.alumnosOriginales.find(a => a.id === id)
  if (!alumno || !alumno.telefono) return

  const telefonoLimpio = alumno.telefono.replace(/\D/g, '')

  AppModal.open({
    title: 'Enviar WhatsApp a ' + escapeHTML(alumno.nombre),
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

function applyFilters() {
  const searchTerm = currentContainer.querySelector('#buscar')?.value.trim().toLowerCase() || ''
  const filtroEstado = currentContainer.querySelector('#filtroEstado')?.value || 'todos'

  state.alumnos = state.alumnosOriginales.filter(a => {
    const matchSearch = !searchTerm ||
      (a.nombre || '').toLowerCase().includes(searchTerm) ||
      (a.instrumento || '').toLowerCase().includes(searchTerm) ||
      (a.telefono || '').toLowerCase().includes(searchTerm) ||
      (a.familiar_nombre || '').toLowerCase().includes(searchTerm)

    const matchEstado = filtroEstado === 'todos' ||
      (filtroEstado === 'activo' && a.is_active) ||
      (filtroEstado === 'inactivo' && !a.is_active)

    return matchSearch && matchEstado
  })

  refreshTable()
}

function getParentescoOptions(selectedValue = '') {
  return PARENTESCOS.map(p => 
    `<option value="${p.value}" ${p.value === selectedValue ? 'selected' : ''}>${p.label}</option>`
  ).join('')
}

function buildAlumnoForm(alumno = null) {
  const a = alumno || {}
  return `<form class="row g-2">
    <div class="col-12">
      <label class="form-label-compact">Nombre Completo *</label>
      <input type="text" class="form-control input-dense" id="modal-nombre" maxlength="${VALIDATION.nombreMax}" required placeholder="Juan Pérez" autocomplete="off" value="${escapeHTML(a.nombre || '')}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Teléfono (WhatsApp) *</label>
      <input type="tel" class="form-control input-dense" id="modal-telefono" required placeholder="+58 412 555 1234" autocomplete="off" value="${escapeHTML(a.telefono || '')}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Email</label>
      <input type="email" class="form-control input-dense" id="modal-email" maxlength="${VALIDATION.emailMax}" placeholder="representante@ejemplo.com" autocomplete="off" value="${escapeHTML(a.email || '')}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Cédula del Alumno</label>
      <input type="text" class="form-control input-dense" id="modal-cedula" maxlength="${VALIDATION.cedulaMax}" placeholder="12345678" autocomplete="off" value="${escapeHTML(a.cedula || '')}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Fecha de Nacimiento</label>
      <input type="date" class="form-control input-dense" id="modal-fechaNacimiento" value="${a.fecha_nacimiento || ''}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Género</label>
      <select class="form-select input-dense" id="modal-genero">
        <option value="" ${!a.genero ? 'selected' : ''}>No especificado</option>
        <option value="M" ${a.genero === 'M' ? 'selected' : ''}>Masculino</option>
        <option value="F" ${a.genero === 'F' ? 'selected' : ''}>Femenino</option>
        <option value="O" ${a.genero === 'O' ? 'selected' : ''}>Otro</option>
        <option value="N" ${a.genero === 'N' ? 'selected' : ''}>No binario</option>
      </select>
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Instrumento *</label>
      <input type="text" class="form-control input-dense" id="modal-instrumento" required maxlength="${VALIDATION.sectionMax}" placeholder="Violín, Piano..." autocomplete="off" value="${escapeHTML(a.instrumento || '')}">
    </div>
    <div class="col-12">
      <label class="form-label-compact">Dirección</label>
      <input type="text" class="form-control input-dense" id="modal-direccion" maxlength="${VALIDATION.direccionMax}" placeholder="Dirección completa" autocomplete="off" value="${escapeHTML(a.direccion || '')}">
    </div>
    
    <div class="col-12 mt-3">
      <div class="border rounded p-2 bg-body-tertiary">
        <h6 class="mb-2"><i class="bi bi-person-exclamation me-1"></i>Contacto de Emergencia</h6>
        <div class="row g-2">
          <div class="col-md-4">
            <label class="form-label-compact">Nombre</label>
            <input type="text" class="form-control input-dense" id="modal-contacto-emergencia-nombre" placeholder="Nombre contacto" value="${escapeHTML(a.contacto_emergencia_nombre || '')}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Teléfono</label>
            <input type="tel" class="form-control input-dense" id="modal-contacto-emergencia-telefono" placeholder="+58 412 555 1234" value="${escapeHTML(a.contacto_emergencia_telefono || '')}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Parentesco</label>
            <select class="form-select input-dense" id="modal-contacto-emergencia-parentesco">
              ${getParentescoOptions(a.contacto_emergencia_parentesco)}
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="col-12">
      <div class="border rounded p-2 bg-body-tertiary">
        <h6 class="mb-2"><i class="bi bi-people me-1"></i>Datos del Familiar</h6>
        <div class="row g-2">
          <div class="col-md-4">
            <label class="form-label-compact">Nombre</label>
            <input type="text" class="form-control input-dense" id="modal-familiar-nombre" placeholder="Nombre familiar" value="${escapeHTML(a.familiar_nombre || '')}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Teléfono</label>
            <input type="tel" class="form-control input-dense" id="modal-familiar-telefono-input" placeholder="+58 412 555 1234" value="${escapeHTML(a.familiar_telefono || '')}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Parentesco</label>
            <select class="form-select input-dense" id="modal-familiar-parentesco-input">
              ${getParentescoOptions(a.familiar_parentesco)}
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="col-12">
      <div class="border rounded p-2 bg-warning bg-opacity-10">
        <h6 class="mb-2"><i class="bi bi-heart-pulse me-1"></i>Información Médica</h6>
        <div class="row g-2">
          <div class="col-md-4">
            <label class="form-label-compact">Condiciones médicas</label>
            <textarea class="form-control input-dense" id="modal-condiciones-medicas" rows="2" placeholder="Diabetes, epilepsia, etc.">${escapeHTML(a.condiciones_medicas || '')}</textarea>
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Alergias</label>
            <textarea class="form-control input-dense" id="modal-alergias" rows="2" placeholder="Alimentos, medicamentos, etc.">${escapeHTML(a.alergias || '')}</textarea>
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Medicamentos</label>
            <textarea class="form-control input-dense" id="modal-medicamentos" rows="2" placeholder="Medicamentos actuales">${escapeHTML(a.medicamentos || '')}</textarea>
          </div>
        </div>
      </div>
    </div>

    <div class="col-12">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="modal-esActivo" ${a.is_active !== false ? 'checked' : ''}>
        <label class="form-check-label" for="modal-esActivo">Alumno activo</label>
      </div>
    </div>
  </form>`
}

async function collectAndValidateAlumno(modalBody, existingAlumno = null) {
  const nombre = modalBody.querySelector('#modal-nombre').value.trim()
  const email = modalBody.querySelector('#modal-email').value.trim().toLowerCase()
  const telefono = modalBody.querySelector('#modal-telefono').value.trim()
  const cedula = modalBody.querySelector('#modal-cedula').value.trim()
  const fechaNacimiento = modalBody.querySelector('#modal-fechaNacimiento').value
  const genero = modalBody.querySelector('#modal-genero').value
  const instrumento = modalBody.querySelector('#modal-instrumento').value.trim()
  const familiarNombre = modalBody.querySelector('#modal-familiar-nombre').value.trim()
  const familiarTelefono = modalBody.querySelector('#modal-familiar-telefono-input').value.trim() || telefono
  const familiarParentesco = modalBody.querySelector('#modal-familiar-parentesco-input').value
  const esActivo = modalBody.querySelector('#modal-esActivo').checked

  if (!nombre) { AppToast.error('El nombre es obligatorio'); return null }
  if (!instrumento) { AppToast.error('El instrumento es obligatorio'); return null }
  if (!telefono) { AppToast.error('El teléfono es obligatorio para WhatsApp'); return null }

  return {
    nombre: nombre,
    email: email || null,
    telefono: telefono,
    cedula: cedula || null,
    fecha_nacimiento: fechaNacimiento || null,
    genero: genero || null,
    instrumento: instrumento,
    is_active: esActivo,
    familiar_nombre: familiarNombre || null,
    familiar_telefono: familiarTelefono,
    familiar_parentesco: familiarParentesco || null,
    contacto_emergencia_nombre: modalBody.querySelector('#modal-contacto-emergencia-nombre').value.trim() || null,
    contacto_emergencia_telefono: modalBody.querySelector('#modal-contacto-emergencia-telefono').value.trim() || null,
    contacto_emergencia_parentesco: modalBody.querySelector('#modal-contacto-emergencia-parentesco').value || null,
    condiciones_medicas: modalBody.querySelector('#modal-condiciones-medicas').value.trim() || null,
    alergias: modalBody.querySelector('#modal-alergias').value.trim() || null,
    medicamentos: modalBody.querySelector('#modal-medicamentos').value.trim() || null,
  }
}

function openCreateModal() {
  state.editando = null
  AppModal.open({
    title: 'Crear Nuevo Alumno',
    size: 'lg',
    body: buildAlumnoForm(),
    saveText: 'Guardar',
    onSave: async (modalBody) => {
      const datos = await collectAndValidateAlumno(modalBody)
      if (!datos) return false

      const nuevo = await crearAlumno(datos)
      state.alumnosOriginales.push(nuevo)
      applyFilters()
      AppToast.success('Alumno creado exitosamente')
    }
  })
}

function openEditModal(id) {
  const alumno = state.alumnosOriginales.find(a => a.id === id)
  if (!alumno) {
    AppToast.error('Alumno no encontrado')
    return
  }

  state.editando = id
  AppModal.open({
    title: 'Editar Alumno',
    size: 'lg',
    body: buildAlumnoForm(alumno),
    saveText: 'Guardar cambios',
    onSave: async (modalBody) => {
      const datos = await collectAndValidateAlumno(modalBody, alumno)
      if (!datos) return false

      await actualizarAlumno(state.editando, datos)
      const idx = state.alumnosOriginales.findIndex(a => a.id === state.editando)
      if (idx !== -1) {
        state.alumnosOriginales[idx] = { ...state.alumnosOriginales[idx], ...datos }
      }
      applyFilters()
      AppToast.success('Alumno actualizado correctamente')
    }
  })
}

function openViewModal(id) {
  const alumno = state.alumnosOriginales.find(a => a.id === id)
  if (!alumno) {
    AppToast.error('Alumno no encontrado')
    return
  }

  state.viewingId = id
  AppModal.open({
    title: escapeHTML(alumno.nombre),
    hideSave: true,
    cancelText: 'Cerrar',
    size: 'lg',
    body: `
      <div class="row">
        <div class="col-md-6">
          <div class="mb-2">
            <label class="form-label fw-bold">Nombre</label>
            <p class="form-control-plaintext">${escapeHTML(alumno.nombre)}</p>
          </div>
          <div class="mb-2">
            <label class="form-label fw-bold">Email</label>
            <p class="form-control-plaintext">${alumno.email ? `<a href="mailto:${escapeHTML(alumno.email)}">${escapeHTML(alumno.email)}</a>` : '-'}</p>
          </div>
          <div class="mb-2">
            <label class="form-label fw-bold">Cédula</label>
            <p class="form-control-plaintext">${escapeHTML(alumno.cedula || '-')}</p>
          </div>
          <div class="mb-2">
            <label class="form-label fw-bold">Edad</label>
            <p class="form-control-plaintext">${calcularEdad(alumno.fecha_nacimiento) ? calcularEdad(alumno.fecha_nacimiento) + ' años' : '-'}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-2">
            <label class="form-label fw-bold">Género</label>
            <p class="form-control-plaintext">${formatGenero(alumno.genero)}</p>
          </div>
          <div class="mb-2">
            <label class="form-label fw-bold">Instrumento</label>
            <p class="form-control-plaintext">${escapeHTML(alumno.instrumento || '-')}</p>
          </div>
          <div class="mb-2">
            <label class="form-label fw-bold">Estado</label>
            <p class="form-control-plaintext">
              <span class="badge ${getEstadoClass(alumno.is_active)}">
                ${getEstadoLabel(alumno.is_active)}
              </span>
            </p>
          </div>
        </div>
      </div>
      <hr>
      <div class="row">
        <div class="col-md-6">
          <div class="mb-2">
            <label class="form-label fw-bold">Familiar/Representante</label>
            <p class="form-control-plaintext">${escapeHTML(alumno.familiar_nombre || '-')}</p>
          </div>
          ${alumno.telefono ? `
            <div class="mb-2">
              <label class="form-label fw-bold">Teléfono (WhatsApp)</label>
              <p class="form-control-plaintext"><a href="https://wa.me/${alumno.telefono.replace(/\D/g, '')}" target="_blank" class="text-success text-decoration-none"><i class="bi bi-whatsapp"></i> ${escapeHTML(alumno.telefono)}</a></p>
            </div>
          ` : ''}
        </div>
        <div class="col-md-6">
          ${alumno.email ? `
            <div class="mb-2">
              <label class="form-label fw-bold">Email</label>
              <p class="form-control-plaintext"><a href="mailto:${escapeHTML(alumno.email)}">${escapeHTML(alumno.email)}</a></p>
            </div>
          ` : ''}
          ${alumno.direccion ? `
            <div class="mb-2">
              <label class="form-label fw-bold">Dirección</label>
              <p class="form-control-plaintext">${escapeHTML(alumno.direccion)}</p>
            </div>
          ` : ''}
        </div>
      </div>
      
      ${(alumno.contacto_emergencia_nombre || alumno.contacto_emergencia_telefono) ? `
      <hr>
      <div class="row">
        <div class="col-12">
          <h6 class="text-info"><i class="bi bi-person-exclamation me-1"></i>Contacto de Emergencia</h6>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Nombre</label>
            <p class="form-control-plaintext">${escapeHTML(alumno.contacto_emergencia_nombre || '-')}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Teléfono</label>
            <p class="form-control-plaintext">${alumno.contacto_emergencia_telefono ? `<a href="tel:${escapeHTML(alumno.contacto_emergencia_telefono)}">${escapeHTML(alumno.contacto_emergencia_telefono)}</a>` : '-'}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Parentesco</label>
            <p class="form-control-plaintext">${getParentescoLabel(alumno.contacto_emergencia_parentesco)}</p>
          </div>
        </div>
      </div>
      ` : ''}

      ${(alumno.familiar_nombre || alumno.familiar_telefono) ? `
      <div class="row">
        <div class="col-12">
          <h6 class="text-primary"><i class="bi bi-people me-1"></i>Datos del Familiar</h6>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Nombre</label>
            <p class="form-control-plaintext">${escapeHTML(alumno.familiar_nombre || '-')}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Teléfono</label>
            <p class="form-control-plaintext">${alumno.familiar_telefono ? `<a href="tel:${escapeHTML(alumno.familiar_telefono)}">${escapeHTML(alumno.familiar_telefono)}</a>` : '-'}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Parentesco</label>
            <p class="form-control-plaintext">${getParentescoLabel(alumno.familiar_parentesco)}</p>
          </div>
        </div>
      </div>
      ` : ''}

      ${(alumno.condiciones_medicas || alumno.alergias || alumno.medicamentos) ? `
      <div class="row">
        <div class="col-12">
          <h6 class="text-warning"><i class="bi bi-heart-pulse me-1"></i>Información Médica</h6>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Condiciones</label>
            <p class="form-control-plaintext">${escapeHTML(alumno.condiciones_medicas || '-')}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Alergias</label>
            <p class="form-control-plaintext">${escapeHTML(alumno.alergias || '-')}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Medicamentos</label>
            <p class="form-control-plaintext">${escapeHTML(alumno.medicamentos || '-')}</p>
          </div>
        </div>
      </div>
      ` : ''}

      <div class="row mt-2 pt-2 border-top">
        <div class="col-6">
          <label class="form-label fw-bold">Creado</label>
          <p class="form-control-plaintext small">${formatDate(alumno.created_at)}</p>
        </div>
        <div class="col-6">
          <label class="form-label fw-bold">Última actualización</label>
          <p class="form-control-plaintext small">${formatDate(alumno.updated_at)}</p>
        </div>
      </div>
      
      <div class="d-flex justify-content-end gap-2 pt-3 border-top mt-4">
        <button class="btn btn-outline-danger" id="modal-view-btn-delete">
          <i class="bi bi-trash me-1"></i> Eliminar
        </button>
        <button class="btn btn-primary" id="modal-view-btn-edit">
          <i class="bi bi-pencil me-1"></i> Editar Perfil
        </button>
      </div>
    `,
    onShow: (modalBody) => {
      modalBody.querySelector('#modal-view-btn-edit')?.addEventListener('click', () => {
        AppModal.close()
        setTimeout(() => openEditModal(alumno.id), 300)
      })
      modalBody.querySelector('#modal-view-btn-delete')?.addEventListener('click', () => {
        AppModal.close()
        setTimeout(() => openDeleteModal(alumno.id), 300)
      })
    }
  })
}

function openDeleteModal(id) {
  const alumno = state.alumnosOriginales.find(a => a.id === id)
  if (!alumno) {
    AppToast.error('Alumno no encontrado')
    return
  }

  state.deletingId = id
  AppModal.open({
    title: '⚠️ Eliminar Alumno',
    size: 'sm',
    saveText: 'Eliminar',
    body: `<p>¿Eliminar al alumno <strong>${escapeHTML(alumno.nombre)}</strong>?</p>
           <p class="text-muted small mb-0">Esta acción no se puede deshacer.</p>`,
    onSave: async () => {
      await eliminarAlumno(id)
      state.alumnosOriginales = state.alumnosOriginales.filter(a => a.id !== id)
      applyFilters()
      AppModal.close()
      AppToast.success('Alumno eliminado correctamente')
    }
  })
}

function refreshTable() {
  const tbody = currentContainer.querySelector('#alumnosTBody')
  if (!tbody) return
  
  if (state.alumnos.length === 0) {
    tbody.innerHTML = renderEmpty()
  } else {
    tbody.innerHTML = renderTableRows(state.alumnos)
  }

  const emptyContainer = currentContainer.querySelector('#emptyContainer')
  if (emptyContainer) {
    emptyContainer.innerHTML = state.alumnos.length === 0 ? renderEmpty() : ''
  }

  const countEl = currentContainer.querySelector('.alumnos-header-premium p.text-muted')
  if (countEl) {
    countEl.textContent = `${state.alumnos.length} alumnos en total`
  }
}

function exportarAlumnosCSV() {
  if (state.alumnosOriginales.length === 0) {
    AppToast.error('No hay alumnos para exportar')
    return
  }

  const headers = ['Nombre', 'Email', 'Teléfono', 'Estado', 'Fecha Nac.', 'Sección']
  const rows = state.alumnosOriginales.map(a => [
    a.nombre || '',
    a.email || '',
    a.telefono || '',
    a.estado || 'activo',
    a.fecha_nacimiento || '',
    a.section || ''
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `alumnos-${new Date().toISOString().split('T')[0]}.csv`
  link.click()

  AppToast.success('CSV exportado exitosamente')
}


