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
      <!-- Page Header Compact -->
      <div class="page-header">
        <div class="d-flex align-items-center gap-2">
          <span class="page-title"><i class="bi bi-people me-2 text-primary"></i>Alumnos</span>
          <span class="badge bg-secondary">${state.alumnos.length}</span>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-outline-success btn-sm-compact" id="btnExportarCSV">
            <i class="bi bi-file-earmark-spreadsheet"></i> CSV
          </button>
          <button class="btn btn-primary btn-sm-compact" id="btnAgregarAlumno">
            <i class="bi bi-plus-lg"></i> Nuevo
          </button>
        </div>
      </div>

      <!-- Toolbar Compact -->
      <div class="toolbar-dense mb-3">
        <div class="search-bar flex-grow-1" style="min-width: 180px;">
          <i class="bi bi-search"></i>
          <input type="text" class="form-control input-dense" placeholder="Buscar alumno..." id="buscar" autocomplete="off">
        </div>
        <select class="form-select input-dense" id="filtroEstado" style="width: auto; min-width: 120px;">
          <option value="todos">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      <!-- Table Compact -->
      <div class="table-scroll-container">
        <table class="table table-compact table-hover mb-0" id="alumnosTable">
          <thead>
            <tr>
              <th>Nombre</th>
              <th class="d-none d-sm-table-cell">Instrumento</th>
              <th class="d-none d-md-table-cell">Teléfono (WA)</th>
              <th class="d-none d-lg-table-cell">Representante</th>
              <th>Estado</th>
              <th class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody id="alumnosTBody">
            ${renderTableRows(state.alumnos)}
          </tbody>
        </table>
        ${state.alumnos.length === 0 ? renderEmpty() : ''}
      </div>


    </div>
  `
}

function renderTableRows(alumnos) {
  if (!alumnos.length) return '<tr><td colspan="7" class="text-center text-muted py-3">No hay alumnos</td></tr>'

  return alumnos.map(a => `
    <tr data-id="${a.id}" class="align-middle">
      <td>
        <div class="d-flex align-items-center gap-2">
          <div class="avatar-compact bg-primary text-white">${getInitials(a.nombre)}</div>
          <span class="text-truncate fw-bold" style="max-width: 150px;" title="${a.nombre}">${escapeHTML(a.nombre)}</span>
        </div>
      </td>
      <td class="d-none d-sm-table-cell">${escapeHTML(a.instrumento || '-')}</td>
      <td class="d-none d-md-table-cell">
        ${a.telefono ? `
          <button class="btn btn-link text-success p-0 border-0 d-flex align-items-center gap-1 text-decoration-none" data-action="whatsapp" data-id="${a.id}">
            <i class="bi bi-whatsapp"></i> ${escapeHTML(a.telefono)}
          </button>
        ` : '-'}
      </td>
      <td class="d-none d-lg-table-cell text-truncate text-muted small" style="max-width: 100px;" title="${a.familiar_nombre || '-'}">${escapeHTML(a.familiar_nombre || '-')}</td>
      <td>
        <span class="badge badge-compact ${getEstadoClass(a.is_active)}">${getEstadoLabel(a.is_active)}</span>
      </td>
      <td class="text-end">
        <div class="quick-actions justify-content-end">
          ${a.telefono ? `
            <button class="btn btn-sm btn-outline-success btn-icon-compact" data-action="whatsapp" data-id="${a.id}" title="WhatsApp">
              <i class="bi bi-whatsapp"></i>
            </button>
          ` : ''}
          <button class="btn btn-sm btn-outline-primary btn-icon-compact" data-action="edit" data-id="${a.id}" title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger btn-icon-compact" data-action="delete" data-id="${a.id}" title="Eliminar">
            <i class="bi bi-trash"></i>
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
        <i class="bi bi-inbox" style="font-size: 3rem; color: var(--bs-secondary);"></i>
      </div>
      <h4>No hay alumnos</h4>
      <p class="text-muted">Crea tu primer alumno haciendo clic en el botón "Nuevo"</p>
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
    const row = e.target.closest('tr[data-id]')
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
    `
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
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">No hay alumnos</td></tr>'
  } else {
    tbody.innerHTML = renderTableRows(state.alumnos)
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


