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

      <div class="table-scroll-container">
        <table class="table table-compact table-hover mb-0" id="salonesTable">
          <thead>
            <tr>
              <th class="d-none d-md-table-cell">Código</th>
              <th>Nombre</th>
              <th class="d-none d-sm-table-cell">Capacidad</th>
              <th>Ubicación</th>
              <th class="d-none d-sm-table-cell">Condición</th>
              <th class="d-none d-md-table-cell">Equipamiento</th>
              <th>Estado</th>
              <th class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody id="salonesTableBody">
            <tr><td colspan="8" class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary" role="status"></div><br><small class="text-muted">Cargando salones...</small></td></tr>
          </tbody>
        </table>
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
      return
    }

    if (useSalones.error) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-3 text-danger"><i class="bi bi-exclamation-triangle"></i> Error: ${escapeHTML(useSalones.error)}</td></tr>`
      return
    }

    if (salones.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-muted">
            <i class="bi bi-inbox fs-4 d-block mb-2"></i>
            No se encontraron salones con esos filtros.
          </td>
        </tr>`
      return
    }

    salonesCount.textContent = salones.length

    tbody.innerHTML = salones.map(salon => {
      const ubicacionPiso = (salon.piso === 0 || salon.piso === '0') ? 'Planta Baja' : `Piso ${salon.piso}`
      const condicionBadge = getCondicionBadge(salon.condicion)
      const estadoBadge = salon.is_active !== false 
        ? '<span class="badge badge-compact bg-success-subtle text-success border border-success-subtle">Activo</span>' 
        : '<span class="badge badge-compact bg-secondary-subtle text-secondary border border-secondary-subtle">Inactivo</span>'
      
      return `
        <tr data-id="${salon.id}" class="align-middle">
          <td class="d-none d-md-table-cell"><code>${escapeHTML(salon.codigo || '-')}</code></td>
          <td class="fw-bold text-truncate" style="max-width: 150px;" title="${escapeHTML(salon.nombre || '')}">${escapeHTML(salon.nombre || '-')}</td>
          <td class="d-none d-sm-table-cell">${salon.capacidad || '-'}</td>
          <td>${escapeHTML(ubicacionPiso)}</td>
          <td class="d-none d-sm-table-cell">${condicionBadge}</td>
          <td class="d-none d-md-table-cell text-truncate text-muted small" style="max-width: 150px;" title="${escapeHTML(salon.equipamiento || '')}">${escapeHTML(salon.equipamiento || '-')}</td>
          <td>${estadoBadge}</td>
          <td class="text-end">
            <div class="quick-actions justify-content-end">
              <button class="btn btn-sm btn-light text-primary border btn-icon-compact" data-action="edit" data-id="${salon.id}" title="Editar">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-light text-danger border btn-icon-compact" data-action="delete" data-id="${salon.id}" title="Inactivar">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
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
    const row = e.target.closest('tr[data-id]')
    if (row && !e.target.closest('[data-action]')) {
      const id = row.dataset.id
      openViewModal(id)
      return
    }
    
    const btn = e.target.closest('[data-action]')
    if (!btn) return
    const id = btn.dataset.id
    if (btn.dataset.action === 'edit') {
      openEditModal(id)
    } else if (btn.dataset.action === 'delete') {
      openDeleteModal(id)
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
