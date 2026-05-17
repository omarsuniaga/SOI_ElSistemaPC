import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { useSalones } from '../hooks/useSalones.js'
import * as salonesApi from '../api/salonesApi.js'

const state = {
  editandoId: null,
}

function escapeHTML(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getInitials(nombre) {
  if (!nombre) return '?'
  const parts = String(nombre).trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function renderSalonesView(container) {
  container.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div class="d-flex align-items-center gap-2">
          <span class="page-title"><i class="bi bi-door-open me-2 text-primary"></i>Salones</span>
          <span class="badge bg-secondary" id="salonesCount">0</span>
        </div>
        <button class="btn btn-primary btn-sm-compact" id="btnCrearSalon">
          <i class="bi bi-plus-lg"></i> Nuevo
        </button>
      </div>

      <div class="toolbar-dense mb-3">
        <div class="search-bar flex-grow-1" style="min-width: 180px;">
          <i class="bi bi-search"></i>
          <input type="text" class="form-control input-dense" placeholder="Buscar por nombre, código o ubicación..." id="searchSalon" autocomplete="off">
        </div>
        <select class="form-select input-dense" id="filterCondicion" style="width: auto; min-width: 140px;">
          <option value="">Todas las condiciones</option>
          <option value="excelente">Excelente</option>
          <option value="buena">Buena</option>
          <option value="regular">Regular</option>
          <option value="mala">Mala</option>
        </select>
        <select class="form-select input-dense" id="filterPiso" style="width: auto; min-width: 120px;">
          <option value="">Todos los pisos</option>
          <option value="0">Planta Baja</option>
          <option value="1">Piso 1</option>
          <option value="2">Piso 2</option>
          <option value="3">Piso 3</option>
          <option value="4">Piso 4</option>
        </select>
      </div>

      <!-- Table Compact Overhauled to modern List-Group -->
      <div class="page-glass rounded w-100">
        <div class="list-group list-group-flush w-100" id="salonesTableBody">
          <div class="text-center py-5 text-muted"><div class="spinner-border text-primary mb-3" role="status"></div><br><small class="text-muted">Cargando salones...</small></div>
        </div>
      </div>

    </div>
  `

  const tbody = container.querySelector('#salonesTableBody')
  const searchInput = container.querySelector('#searchSalon')
  const filterCondicion = container.querySelector('#filterCondicion')
  const filterPiso = container.querySelector('#filterPiso')
  const salonesCount = container.querySelector('#salonesCount')

  const renderTable = () => {
    const query = searchInput.value
    const condicion = filterCondicion.value
    const piso = filterPiso.value
    const salones = useSalones.getFiltered(query, piso, condicion)

    if (useSalones.cargando) {
      tbody.innerHTML = `<div class="text-center py-5 text-muted"><div class="spinner-border text-primary mb-3" role="status"></div><br><small class="text-muted">Cargando salones...</small></div>`
      return
    }

    if (useSalones.error) {
      tbody.innerHTML = `<div class="text-center py-5 text-danger"><i class="bi bi-exclamation-triangle fs-3 d-block mb-2"></i> Error: ${escapeHTML(useSalones.error)}</div>`
      return
    }

    if (salones.length === 0) {
      tbody.innerHTML = `
        <div class="text-center py-5 w-100 text-muted list-group-item" style="background: transparent; border: none;">
          <i class="bi bi-inbox fs-1 d-block mb-3" style="color: var(--bs-secondary);"></i>
          No se encontraron salones con esos filtros.
        </div>`
      return
    }

    salonesCount.textContent = salones.length

    tbody.innerHTML = salones.map(salon => {
      const initials = getInitials(salon.nombre || 'S')
      const active = salon.is_active !== false
      const condicionBadge = getCondicionBadge(salon.condicion)

      return `
        <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100" data-id="${salon.id}" style="cursor: pointer; background: transparent;">
          <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
            <div class="position-relative flex-shrink-0">
              <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle" style="width: 48px; height: 48px; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; border-radius: 50%;">${initials}</div>
              <span class="position-absolute bottom-0 end-0 p-1 bg-${active ? 'success' : 'secondary'} border border-light rounded-circle" style="transform: translate(10%, 10%);">
                <span class="visually-hidden">${active ? 'Activo' : 'Inactivo'}</span>
              </span>
            </div>
            <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
              <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${escapeHTML(salon.nombre || '-')}</span>
              <small class="text-muted text-truncate">Capacidad: ${salon.capacidad || '-'} personas</small>
            </div>
          </div>
          <div class="flex-shrink-0 text-end">
            ${condicionBadge}
          </div>
        </div>
      `
    }).join('')
  }

  const getCondicionBadge = (condicion) => {
    const colors = {
      excelente: 'bg-success',
      buena: 'bg-primary',
      regular: 'bg-warning',
      mala: 'bg-danger'
    }
    const labels = {
      excelente: 'Excelente',
      buena: 'Buena',
      regular: 'Regular',
      mala: 'Mala'
    }
    const color = colors[condicion] || 'bg-secondary'
    const label = labels[condicion] || '-'
    return `<span class="badge badge-compact ${color}">${label}</span>`
  }

  const unsubscribe = useSalones.subscribe(renderTable)

  let debounceTimer
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(renderTable, 300)
  })

  filterCondicion.addEventListener('change', renderTable)
  filterPiso.addEventListener('change', renderTable)

  container.querySelector('#btnCrearSalon')?.addEventListener('click', () => {
    openCreateModal()
  })

  tbody?.addEventListener('click', async (e) => {
    const item = e.target.closest('.list-group-item[data-id]')
    if (item) {
      const id = item.dataset.id
      openViewModal(id)
    }
  })

  useSalones.fetchSalones()

  container.cleanup = () => {
    unsubscribe()
  }
}

function openCreateModal() {
  state.editandoId = null
  AppModal.open({
    title: 'Crear Nuevo Salón',
    body: `<form class="row g-2" id="formSalon">
      <div class="col-12">
        <label class="form-label-compact">Nombre *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required placeholder="Salón de Música A">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Capacidad *</label>
        <input type="number" class="form-control input-dense" id="modal-capacidad" required placeholder="30" min="1">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Piso *</label>
        <select class="form-select input-dense" id="modal-piso" required>
          <option value="">Seleccionar</option>
          <option value="0">Planta Baja</option>
          <option value="1">Piso 1</option>
          <option value="2">Piso 2</option>
          <option value="3">Piso 3</option>
          <option value="4">Piso 4</option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Condición</label>
        <select class="form-select input-dense" id="modal-condicion">
          <option value="excelente">Excelente</option>
          <option value="buena" selected>Buena</option>
          <option value="regular">Regular</option>
          <option value="mala">Mala</option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Estado</label>
        <select class="form-select input-dense" id="modal-esActivo">
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
      </div>
      <div class="col-12">
        <label class="form-label-compact">Equipamiento</label>
        <textarea class="form-control input-dense" id="modal-equipamiento" rows="2" placeholder="Piano, sillas, escritorio, pizarra..."></textarea>
      </div>
      <div class="col-12">
        <label class="form-label-compact">Descripción</label>
        <textarea class="form-control input-dense" id="modal-descripcion" rows="2" placeholder="Descripción adicional del salón..."></textarea>
      </div>
    </form>`,
    saveText: 'Guardar',
    onSave: async (modalBody) => {
      const nombre = modalBody.querySelector('#modal-nombre').value.trim()
      const capacidad = parseInt(modalBody.querySelector('#modal-capacidad').value)
      const piso = modalBody.querySelector('#modal-piso').value
      const condicion = modalBody.querySelector('#modal-condicion').value
      const esActivo = modalBody.querySelector('#modal-esActivo').value === 'true'
      const equipamiento = modalBody.querySelector('#modal-equipamiento').value.trim()
      const descripcion = modalBody.querySelector('#modal-descripcion').value.trim()

      if (!nombre || !capacidad || !piso) {
        AppToast.error('Por favor complete los campos obligatorios')
        return false
      }

      await salonesApi.crearSalon({
        nombre, capacidad, piso, condicion_fisica: condicion,
        is_active: esActivo, equipamiento, descripcion
      })
      useSalones.fetchSalones()
      AppToast.success('Salón creado correctamente')
    }
  })
}

function openEditModal(id) {
  const salon = useSalones.salones.find(s => s.id === id)
  if (!salon) {
    AppToast.error('Salón no encontrado')
    return
  }

  state.editandoId = id
  AppModal.open({
    title: 'Editar Salón',
    body: `<form class="row g-2" id="formSalon">
      <div class="col-12">
        <label class="form-label-compact">Nombre *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required value="${escapeHTML(salon.nombre || '')}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Capacidad *</label>
        <input type="number" class="form-control input-dense" id="modal-capacidad" required value="${salon.capacidad || ''}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Piso *</label>
        <select class="form-select input-dense" id="modal-piso" required>
          <option value="">Seleccionar</option>
          <option value="0" ${String(salon.piso) === '0' ? 'selected' : ''}>Planta Baja</option>
          <option value="1" ${String(salon.piso) === '1' ? 'selected' : ''}>Piso 1</option>
          <option value="2" ${String(salon.piso) === '2' ? 'selected' : ''}>Piso 2</option>
          <option value="3" ${String(salon.piso) === '3' ? 'selected' : ''}>Piso 3</option>
          <option value="4" ${String(salon.piso) === '4' ? 'selected' : ''}>Piso 4</option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Condición</label>
        <select class="form-select input-dense" id="modal-condicion">
          <option value="excelente" ${salon.condicion === 'excelente' ? 'selected' : ''}>Excelente</option>
          <option value="buena" ${salon.condicion === 'buena' ? 'selected' : ''}>Buena</option>
          <option value="regular" ${salon.condicion === 'regular' ? 'selected' : ''}>Regular</option>
          <option value="mala" ${salon.condicion === 'mala' ? 'selected' : ''}>Mala</option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Estado</label>
        <select class="form-select input-dense" id="modal-esActivo">
          <option value="true" ${salon.is_active !== false ? 'selected' : ''}>Activo</option>
          <option value="false" ${salon.is_active === false ? 'selected' : ''}>Inactivo</option>
        </select>
      </div>
      <div class="col-12">
        <label class="form-label-compact">Equipamiento</label>
        <textarea class="form-control input-dense" id="modal-equipamiento" rows="2">${escapeHTML(salon.equipamiento || '')}</textarea>
      </div>
      <div class="col-12">
        <label class="form-label-compact">Descripción</label>
        <textarea class="form-control input-dense" id="modal-descripcion" rows="2">${escapeHTML(salon.descripcion || '')}</textarea>
      </div>
    </form>`,
    saveText: 'Guardar cambios',
    onSave: async (modalBody) => {
      try {
        const nombre = modalBody.querySelector('#modal-nombre').value.trim()
        const capacidad = parseInt(modalBody.querySelector('#modal-capacidad').value)
        const piso = modalBody.querySelector('#modal-piso').value
        const condicion = modalBody.querySelector('#modal-condicion').value
        const esActivo = modalBody.querySelector('#modal-esActivo').value === 'true'
        const equipamiento = modalBody.querySelector('#modal-equipamiento').value.trim()
        const descripcion = modalBody.querySelector('#modal-descripcion').value.trim()

        if (!nombre || !capacidad || !piso) {
          AppToast.error('Por favor complete los campos obligatorios')
          return false
        }

        await salonesApi.actualizarSalon(id, {
          nombre, 
          capacidad, 
          piso, 
          condicion_fisica: condicion,
          is_active: esActivo, 
          equipamiento, 
          descripcion
        })

        await useSalones.fetchSalones()
        AppToast.success('Salón actualizado correctamente')
        return true
      } catch (error) {
        console.error('Error al actualizar salón:', error)
        AppToast.error(error.message || 'Error al actualizar el salón')
        return false // Evita que el modal se cierre y detiene el spinner de carga
      }
    }
  })
}

function openViewModal(id) {
  const salon = useSalones.salones.find(s => s.id === id)
  if (!salon) {
    showToast('Salón no encontrado', 'error')
    return
  }

  const ubicacionPiso = (salon.piso === 0 || salon.piso === '0') ? 'Planta Baja' : `Piso ${salon.piso}`
  const condicionLabel = { excelente: 'Excelente', buena: 'Buena', regular: 'Regular', mala: 'Mala' }[salon.condicion] || '-'
  const estadoLabel = salon.is_active !== false ? 'Activo' : 'Inactivo'
  const estadoClass = salon.is_active !== false ? 'bg-success' : 'bg-secondary'

  AppModal.open({
    title: escapeHTML(salon.nombre || 'Salón'),
    hideSave: true,
    cancelText: 'Cerrar',
    onShow: (modalBody) => {
      modalBody.querySelector('#modal-view-btn-edit')?.addEventListener('click', () => {
        AppModal.close()
        setTimeout(() => openEditModal(id), 300)
      })
      modalBody.querySelector('#modal-view-btn-delete')?.addEventListener('click', () => {
        AppModal.close()
        setTimeout(() => openDeleteModal(id), 300)
      })
    },
    body: `
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Código</label>
            <p class="form-control-plaintext"><code>${escapeHTML(salon.codigo || '-')}</code></p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Nombre</label>
            <p class="form-control-plaintext">${escapeHTML(salon.nombre || '-')}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Capacidad</label>
            <p class="form-control-plaintext">${salon.capacidad || '-'} personas</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Ubicación</label>
            <p class="form-control-plaintext">${escapeHTML(ubicacionPiso)}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Condición</label>
            <p class="form-control-plaintext">
              <span class="badge ${salon.condicion === 'excelente' ? 'bg-success' : salon.condicion === 'buena' ? 'bg-primary' : salon.condicion === 'regular' ? 'bg-warning' : 'bg-danger'}">${condicionLabel}</span>
            </p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Estado</label>
            <p class="form-control-plaintext">
              <span class="badge ${estadoClass}">${estadoLabel}</span>
            </p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Equipamiento</label>
            <p class="form-control-plaintext">${escapeHTML(salon.equipamiento || 'Sin equipamiento registrado')}</p>
          </div>
        </div>
      </div>
      ${salon.descripcion ? `
      <hr>
      <div class="row">
        <div class="col-12">
          <div class="mb-3">
            <label class="form-label fw-bold">Descripción</label>
            <p class="form-control-plaintext">${escapeHTML(salon.descripcion)}</p>
          </div>
        </div>
      </div>
      ` : ''}
      
      <div class="d-flex justify-content-end gap-2 pt-3 border-top mt-4">
        <button class="btn btn-outline-danger" id="modal-view-btn-delete">
          <i class="bi bi-trash me-1"></i> Inactivar
        </button>
        <button class="btn btn-primary" id="modal-view-btn-edit">
          <i class="bi bi-pencil me-1"></i> Editar
        </button>
      </div>
    `
  })
}

function openDeleteModal(id) {
  const salon = useSalones.salones.find(s => s.id === id)
  if (!salon) {
    AppToast.error('Salón no encontrado')
    return
  }

  AppModal.open({
    title: '⚠️ Inactivar Salón',
    size: 'sm',
    saveText: 'Inactivar',
    body: `<p>¿Inactivar el salón <strong>${escapeHTML(salon.nombre)}</strong>?</p>
           <p class="text-muted small mb-0">Esta acción lo ocultará de las asignaciones de clases.</p>`,
    onSave: async () => {
      await salonesApi.eliminarSalon(id)
      useSalones.fetchSalones()
      AppToast.success('Salón inactivado correctamente')
    }
  })
}
