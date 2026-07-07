import '../../../shared/styles/patterns.css'
import '../styles/salones.css'
import { escapeHTML } from '../../../shared/utils/sanitize.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { useSalones } from '../hooks/useSalones.js'
import * as salonesApi from '../api/salonesApi.js'
import { renderFilterPanel } from '../../../shared/components/pageShell.js'
import { renderHeroCard, renderDetailGrid } from '../../../shared/components/profileModal.js'

const state = {
  editandoId: null,
  filtrosAbiertos: typeof window !== 'undefined' ? window.innerWidth >= 992 : true,
}

function getCondicionBadge(condicion) {
  const colors = {
    excelente: 'bg-success',
    buena: 'bg-primary',
    regular: 'bg-warning',
    mala: 'bg-danger',
  }
  const labels = {
    excelente: 'Excelente',
    buena: 'Buena',
    regular: 'Regular',
    mala: 'Mala',
  }
  const color = colors[condicion] || 'bg-secondary'
  const label = labels[condicion] || '-'
  return `<span class="badge badge-compact ${color}">${label}</span>`
}

function getFilterConfigHtml() {
  return `
    <div class="premium-search-container flex-grow-1" style="min-width: 180px;">
      <i class="bi bi-search search-icon-muted"></i>
      <input type="text" class="form-control premium-search-input" placeholder="Buscar por nombre, código o ubicación..." id="searchSalon" autocomplete="off">
    </div>
    <div class="premium-select-container">
      <i class="bi bi-funnel select-icon-muted"></i>
      <select class="form-select premium-filter-select" id="filterCondicion">
        <option value="">Todas las condiciones</option>
        <option value="excelente">Excelente</option>
        <option value="buena">Buena</option>
        <option value="regular">Regular</option>
        <option value="mala">Mala</option>
      </select>
    </div>
    <div class="premium-select-container">
      <i class="bi bi-layers select-icon-muted"></i>
      <select class="form-select premium-filter-select" id="filterPiso">
        <option value="">Todos los pisos</option>
        <option value="0">Planta Baja</option>
        <option value="1">Piso 1</option>
        <option value="2">Piso 2</option>
        <option value="3">Piso 3</option>
        <option value="4">Piso 4</option>
      </select>
    </div>
    <button class="btn btn-outline-secondary btn-sm" id="btnLimpiarFiltrosSalones" type="button" title="Limpiar filtros">
      <i class="bi bi-x-circle me-1"></i>Limpiar
    </button>
  `
}

export function renderSalonesView(container) {
  if (container.cleanup) {
    container.cleanup()
  }

  state.container = container
  if (typeof state.filtrosAbiertos !== 'boolean') {
    state.filtrosAbiertos = window.innerWidth >= 992
  }

  container.innerHTML = `
    <div class="page-container">
      <div class="salones-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-door-open fs-4"></i>
          </div>
          <div>
            <h1 class="salones-title-premium mb-0">Salones</h1>
            <p class="text-muted small mb-0"><span id="salonesCount">0</span> salones en total</p>
          </div>
        </div>

        <div class="salones-header-actions">
          <button class="btn btn-premium-action btn-icon-only" id="btnCrearSalon" title="Nuevo Salón" aria-label="Nuevo Salón">
            <i class="bi bi-plus-lg"></i>
          </button>
        </div>
      </div>

      ${renderFilterPanel({
        isOpen: state.filtrosAbiertos,
        filtersHtml: getFilterConfigHtml(),
        onToggleId: 'btnToggleFiltrosSalones',
      })}

      <div class="page-glass rounded w-100">
        <div class="list-group list-group-flush w-100" id="salonesTableBody">
          <div class="text-center py-5 text-muted"><div class="spinner-border text-primary mb-3" role="status"></div><br><small class="text-muted">Cargando salones...</small></div>
        </div>
      </div>
    </div>
  `

  renderTable()
  attachEvents(container)

  useSalones.fetchSalones()
}

function renderTable() {
  const container = state.container
  const tbody = container.querySelector('#salonesTableBody')
  const salonesCount = container.querySelector('#salonesCount')

  const query = (container.querySelector('#searchSalon')?.value || '').trim()
  const condicion = container.querySelector('#filterCondicion')?.value || ''
  const piso = container.querySelector('#filterPiso')?.value || ''
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

  tbody.innerHTML = salones
    .map((salon) => {
      const active = salon.is_active !== false
      const condicionBadge = getCondicionBadge(salon.condicion)
      const accentClass = `border-accent-${active ? 'success' : 'secondary'}`

      return `
      <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${accentClass}" data-id="${salon.id}" style="cursor: pointer;">
        <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
          <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
            <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${escapeHTML(salon.nombre || '-')}</span>
            <small class="text-muted text-truncate"><i class="bi bi-people me-1"></i>Capacidad: ${salon.capacidad || '-'} personas • Piso: ${salon.piso === 0 || salon.piso === '0' ? 'Planta Baja' : `Piso ${salon.piso}`}</small>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2 flex-shrink-0">
          ${condicionBadge}
          <i class="bi bi-chevron-right text-muted ms-1" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
        </div>
      </div>
    `
    })
    .join('')
}

function attachEvents(container) {
  const unsubscribe = useSalones.subscribe(renderTable)

  let debounceTimer
  container.addEventListener('input', (e) => {
    if (e.target.id === 'searchSalon') {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(renderTable, 300)
    }
  })

  container.addEventListener('change', (e) => {
    if (e.target.id === 'filterCondicion' || e.target.id === 'filterPiso') {
      renderTable()
    }
  })

  container.querySelector('#btnToggleFiltrosSalones')?.addEventListener('click', () => {
    state.filtrosAbiertos = !state.filtrosAbiertos
    renderSalonesView(state.container)
  })

  container.querySelector('#btnLimpiarFiltrosSalones')?.addEventListener('click', () => {
    const ids = ['searchSalon', 'filterCondicion', 'filterPiso']
    ids.forEach(id => {
      const el = container.querySelector(`#${id}`)
      if (!el) return
      if (el.tagName === 'SELECT') el.value = el.options[0]?.value || ''
      else el.value = ''
    })
    renderTable()
  })

  container.querySelector('#btnCrearSalon')?.addEventListener('click', () => {
    openCreateModal()
  })

  container.querySelector('#salonesTableBody')?.addEventListener('click', async (e) => {
    const item = e.target.closest('.list-group-item[data-id]')
    if (item) {
      const id = item.dataset.id
      openViewModal(id)
    }
  })

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
        nombre,
        capacidad,
        piso,
        condicion_fisica: condicion,
        is_active: esActivo,
        equipamiento,
        descripcion,
      })
      useSalones.fetchSalones()
      AppToast.success('Salón creado correctamente')
    },
  })
}

function openEditModal(id) {
  const salon = useSalones.salones.find((s) => s.id === id)
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
          descripcion,
        })

        await useSalones.fetchSalones()
        AppToast.success('Salón actualizado correctamente')
        return true
      } catch (error) {
        console.error('Error al actualizar salón:', error)
        AppToast.error(error.message || 'Error al actualizar el salón')
        return false
      }
    },
  })
}

function openViewModal(id) {
  const salon = useSalones.salones.find((s) => s.id === id)
  if (!salon) {
    AppToast.error('Salón no encontrado')
    return
  }

  const ubicacionPiso =
    salon.piso === 0 || salon.piso === '0' ? 'Planta Baja' : `Piso ${salon.piso}`
  const estadoLabel = salon.is_active !== false ? 'Activo' : 'Inactivo'
  const estadoBadgeClass = salon.is_active !== false ? 'bg-success' : 'bg-secondary'

  const bodyHTML = `
    <div class="salon-profile-container">
      ${renderHeroCard({
        title: salon.nombre || 'Salón',
        badgesHtml: `
          ${getCondicionBadge(salon.condicion)}
          <span class="d-inline-block rounded-circle ${salon.is_active !== false ? 'bg-success' : 'bg-secondary'}" style="width: 10px; height: 10px;" title="${estadoLabel}"></span>
        `,
        actionsHtml: `
          <button class="btn btn-outline-primary btn-sm btn-profile-edit" data-id="${salon.id}" type="button" title="Editar salón">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-outline-danger btn-sm btn-profile-delete" data-id="${salon.id}" type="button" title="Inactivar salón">
            <i class="bi bi-trash"></i>
          </button>
        `,
      })}

      ${renderDetailGrid({
        items: [
          { icon: 'bi-upc-scan', label: 'Código', value: `<code>${escapeHTML(salon.codigo || '-')}</code>` },
          { icon: 'bi-door-open', label: 'Nombre', value: escapeHTML(salon.nombre || '-') },
          { icon: 'bi-people', label: 'Capacidad', value: `${salon.capacidad || '-'} personas` },
          { icon: 'bi-geo-alt', label: 'Ubicación', value: escapeHTML(ubicacionPiso) },
          {
            icon: 'bi-clipboard-check',
            label: 'Condición',
            value: getCondicionBadge(salon.condicion),
          },
          {
            icon: 'bi-toggle-on',
            label: 'Estado',
            value: `<span class="d-inline-block rounded-circle ${estadoBadgeClass} me-1" style="width: 10px; height: 10px;" title="${estadoLabel}"></span> ${estadoLabel}`,
          },
          { icon: 'bi-tools', label: 'Equipamiento', value: escapeHTML(salon.equipamiento || 'Sin equipamiento registrado') },
        ],
      })}

      ${salon.descripcion ? `
        <div class="description-card p-3 rounded mb-4 border bg-body-tertiary">
          <small class="text-muted d-block mb-1"><i class="bi bi-file-earmark-text me-1"></i>Descripción</small>
          <p class="mb-0 text-muted small" style="white-space: pre-line; line-height: 1.5;">${escapeHTML(salon.descripcion)}</p>
        </div>
      ` : ''}
    </div>
  `

  AppModal.open({
    title: `Perfil de Salón: ${escapeHTML(salon.nombre || 'Salón')}`,
    hideSave: true,
    size: 'md',
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

    },
  })
}

function openDeleteModal(id) {
  const salon = useSalones.salones.find((s) => s.id === id)
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
    },
  })
}
