import '../styles/campanias.css'
import * as api from '../api/campaniasApi.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const ESTADOS = [
  { value: 'lead', label: 'Lead', color: 'secondary' },
  { value: 'contactado', label: 'Contactado', color: 'info' },
  { value: 'en_negociacion', label: 'En negociación', color: 'warning' },
  { value: 'aceptado', label: 'Aceptado', color: 'success' },
  { value: 'rechazado', label: 'Rechazado', color: 'danger' },
  { value: 'inactivo', label: 'Inactivo', color: 'dark' },
]

const TIPOS = ['empresa', 'institucion', 'colegio', 'fundacion', 'iglesia', 'club', 'otro']

const state = {
  list: [],
  filtroEstado: 'todos',
  busqueda: '',
}

export async function renderInstitucionesView(container) {
  container.innerHTML = `<div class="d-flex justify-content-center py-5"><div class="spinner-border text-primary"></div></div>`
  try {
    state.list = await api.getInstituciones()
    render(container)
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger m-3">${escapeHTML(err.message)}</div>`
  }
  return { teardown: () => {} }
}

function render(container) {
  const filtrados = filtrar()
  container.innerHTML = `
    <div class="page-container camp-portal">
      <div class="d-flex align-items-center justify-content-between gap-3 mb-3">
        <div class="d-flex align-items-center gap-3">
          <div class="page-header-icon"><i class="bi bi-building fs-4"></i></div>
          <div>
            <h1 class="mb-0 h3">Directorio de Instituciones</h1>
            <p class="text-muted small mb-0">Empresas, colegios, fundaciones y contactos B2B</p>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="btn-nueva-institucion">
          <i class="bi bi-plus-lg"></i> Nueva
        </button>
      </div>

      <div class="row g-2 mb-3">
        <div class="col-auto">
          <select class="form-select form-select-sm" id="filtro-estado">
            <option value="todos">Todos los estados</option>
            ${ESTADOS.map((e) => `<option value="${e.value}"${state.filtroEstado === e.value ? ' selected' : ''}>${e.label}</option>`).join('')}
          </select>
        </div>
        <div class="col">
          <input class="form-control form-control-sm" id="busqueda" placeholder="Buscar por nombre, contacto, email..." value="${escapeHTML(state.busqueda)}">
        </div>
      </div>

      <div class="row g-2" id="instituciones-list">
        ${filtrados.length === 0 ? '<div class="col-12"><p class="text-muted text-center py-4">No hay instituciones. ¡Agregue la primera!</p></div>'
          : filtrados.map((ins) => cardHTML(ins)).join('')}
      </div>
    </div>`

  container.querySelector('#btn-nueva-institucion').onclick = () => abrirModal(null)
  container.querySelector('#filtro-estado').onchange = (e) => {
    state.filtroEstado = e.target.value
    render(container)
  }
  container.querySelector('#busqueda').oninput = (e) => {
    state.busqueda = e.target.value
    render(container)
  }
  container.querySelectorAll('.institution-card').forEach((el) => {
    el.onclick = () => abrirModal(el.dataset.id)
  })
}

function filtrar() {
  let r = state.list
  if (state.filtroEstado !== 'todos') r = r.filter((i) => i.estado === state.filtroEstado)
  if (state.busqueda) {
    const q = state.busqueda.toLowerCase()
    r = r.filter((i) =>
      i.nombre.toLowerCase().includes(q) ||
      (i.contacto_nombre || '').toLowerCase().includes(q) ||
      (i.email || '').toLowerCase().includes(q)
    )
  }
  return r
}

function cardHTML(ins) {
  const estado = ESTADOS.find((e) => e.value === ins.estado) || ESTADOS[0]
  return `<div class="col-md-6 col-lg-4">
    <div class="institution-card" data-id="${ins.id}">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h6 class="mb-0 fw-semibold">${escapeHTML(ins.nombre)}</h6>
        <span class="badge badge-estado bg-${estado.color}">${estado.label}</span>
      </div>
      <div class="small text-muted">
        ${ins.tipo ? `<span class="me-2"><i class="bi bi-tag"></i> ${capitalize(ins.tipo)}</span>` : ''}
        ${ins.sector ? `<span><i class="bi bi-bookmark"></i> ${capitalize(ins.sector)}</span>` : ''}
      </div>
      ${ins.contacto_nombre ? `<div class="small mt-1"><i class="bi bi-person"></i> ${escapeHTML(ins.contacto_nombre)}${ins.cargo ? ` — ${escapeHTML(ins.cargo)}` : ''}</div>` : ''}
      ${ins.email ? `<div class="small"><i class="bi bi-envelope"></i> ${escapeHTML(ins.email)}</div>` : ''}
      ${ins.telefono ? `<div class="small"><i class="bi bi-telephone"></i> ${escapeHTML(ins.telefono)}</div>` : ''}
    </div>
  </div>`
}

function abrirModal(id) {
  const ins = id ? state.list.find((i) => i.id === id) : null
  const esNuevo = !ins
  const datos = ins || { nombre: '', tipo: 'empresa', sector: '', contacto_nombre: '', cargo: '', email: '', telefono: '', direccion: '', sitio_web: '', estado: 'lead', notas: '' }

  const modal = new AppModal({
    title: esNuevo ? 'Nueva Institución' : 'Editar Institución',
    size: 'lg',
    body: `
      <form id="form-institucion">
        <div class="row g-2 mb-2">
          <div class="col-8">
            <label class="form-label small">Nombre *</label>
            <input class="form-control form-control-sm" name="nombre" value="${escapeHTML(String(datos.nombre || ''))}" required>
          </div>
          <div class="col-2">
            <label class="form-label small">Tipo</label>
            <select class="form-select form-select-sm" name="tipo">
              ${TIPOS.map((t) => `<option value="${t}"${datos.tipo === t ? ' selected' : ''}>${capitalize(t)}</option>`).join('')}
            </select>
          </div>
          <div class="col-2">
            <label class="form-label small">Sector</label>
            <input class="form-control form-control-sm" name="sector" value="${escapeHTML(String(datos.sector || ''))}">
          </div>
        </div>
        <div class="row g-2 mb-2">
          <div class="col-4">
            <label class="form-label small">Contacto</label>
            <input class="form-control form-control-sm" name="contacto_nombre" value="${escapeHTML(String(datos.contacto_nombre || ''))}">
          </div>
          <div class="col-4">
            <label class="form-label small">Cargo</label>
            <input class="form-control form-control-sm" name="cargo" value="${escapeHTML(String(datos.cargo || ''))}">
          </div>
          <div class="col-4">
            <label class="form-label small">Estado</label>
            <select class="form-select form-select-sm" name="estado">
              ${ESTADOS.map((e) => `<option value="${e.value}"${datos.estado === e.value ? ' selected' : ''}>${e.label}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="row g-2 mb-2">
          <div class="col-6">
            <label class="form-label small">Email</label>
            <input class="form-control form-control-sm" name="email" type="email" value="${escapeHTML(String(datos.email || ''))}">
          </div>
          <div class="col-6">
            <label class="form-label small">Teléfono</label>
            <input class="form-control form-control-sm" name="telefono" value="${escapeHTML(String(datos.telefono || ''))}">
          </div>
        </div>
        <div class="mb-2">
          <label class="form-label small">Dirección</label>
          <input class="form-control form-control-sm" name="direccion" value="${escapeHTML(String(datos.direccion || ''))}">
        </div>
        <div class="mb-2">
          <label class="form-label small">Sitio web</label>
          <input class="form-control form-control-sm" name="sitio_web" value="${escapeHTML(String(datos.sitio_web || ''))}">
        </div>
        <div class="mb-2">
          <label class="form-label small">Notas</label>
          <textarea class="form-control form-control-sm" name="notas" rows="3">${escapeHTML(String(datos.notas || ''))}</textarea>
        </div>
      </form>`,
    buttons: [
      { text: 'Cancelar', class: 'btn btn-light', dismiss: true },
      { text: 'Guardar', class: 'btn btn-primary', dismiss: false, primary: true },
    ],
  })

  modal.on('primary', async () => {
    const form = modal.element.querySelector('#form-institucion')
    if (!form.checkValidity()) { form.reportValidity(); return }
    const fd = new FormData(form)
    const payload = Object.fromEntries(fd.entries())
    if (id) payload.id = id
    try {
      await api.guardarInstitucion(payload)
      state.list = await api.getInstituciones()
      render(document.querySelector('#app .camp-portal')?.closest('.page-container')?.parentElement || document.querySelector('#app'))
      modal.close()
      AppToast.success(esNuevo ? 'Institución creada' : 'Institución actualizada')
    } catch (err) {
      AppToast.error(err.message)
    }
  })

  modal.show()
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : '' }

function escapeHTML(s) {
  if (s === null || s === undefined) return ''
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
