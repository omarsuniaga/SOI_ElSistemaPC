import '../styles/salones.css'
import { escapeHTML } from '../../../shared/utils/sanitize.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { renderViewInfoButton, attachViewInfoEvents } from '../../../shared/components/ViewInfoModal.js'
import { useSalones } from '../hooks/useSalones.js'
import * as salonesApi from '../api/salonesApi.js'

const state = {
  editandoId: null,
  filtrosAbiertos: false,
  sortBy: 'nombre',
  sortDir: 'asc',
  filtroEstado: 'todos',
}

function getCondicionBadge(condicion) {
  const colors = {
    excelente: 'bg-success-subtle text-success border border-success-subtle',
    buena: 'bg-primary-subtle text-primary border border-primary-subtle',
    regular: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
    mala: 'bg-danger-subtle text-danger border border-danger-subtle',
  }
  const labels = {
    excelente: 'Excelente',
    buena: 'Buena',
    regular: 'Regular',
    mala: 'Mala',
  }
  const colorClass = colors[condicion] || 'bg-secondary-subtle text-secondary border border-secondary-subtle'
  const label = labels[condicion] || '-'
  return `<span class="badge ${colorClass} py-0.5 px-1.5 rounded-2" style="font-size: 0.7rem;">${label}</span>`
}

export function renderSalonesView(container) {
  if (container.cleanup) {
    container.cleanup()
  }

  state.container = container

  renderContent(container)
  attachEvents(container)
  useSalones.fetchSalones()
}

function renderContent(container) {
  const totalSalones = useSalones.salones.length
  const totalActivos = useSalones.salones.filter(s => s.is_active !== false).length
  const totalCapacidad = useSalones.salones.reduce((acc, s) => acc + (Number(s.capacidad) || 0), 0)
  const totalEquipados = useSalones.salones.filter(s => !!s.equipamiento && s.equipamiento.trim() !== '').length

  container.innerHTML = `
    <div class="page-container">
      
      <!-- Header & Toolbar Unificada V2 -->
      <div class="card border-0 shadow-sm rounded-4 p-2 p-md-3 bg-body mb-3 border border-body-tertiary">
        
        <!-- Fila 1: Título, Badges Informativos y Botones de Acción -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-2.5 pb-2 border-bottom border-body-tertiary" style="gap: 0.85rem;">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <div class="p-2 rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
              <i class="bi bi-door-open-fill fs-5"></i>
            </div>
            <div>
              <h5 class="fw-bold mb-0 text-body d-flex align-items-center">Directorio de Salones & Espacios</h5>
              <small class="text-muted d-block" style="font-size:0.75rem;">Gestión de capacidad e infraestructura institucional</small>
            </div>
            
            <!-- Badges de Resumen en Tiempo Real -->
            <div class="d-flex align-items-center gap-1.5 ms-md-2 flex-wrap">
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;" title="Salones operativos">
                <i class="bi bi-door-closed-fill me-1"></i><span id="badgeActivosCount">${totalActivos}/${totalSalones}</span> Activos
              </span>
              <span class="badge bg-success-subtle text-success border border-success-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;" title="Capacidad acumulada">
                <i class="bi bi-people-fill me-1"></i><span id="badgeCapacidadCount">${totalCapacidad}</span> Plazas Totales
              </span>
              <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;" title="Espacios con equipamiento registrado">
                <i class="bi bi-tools me-1"></i><span id="badgeEquipadosCount">${totalEquipados}</span> Equipados
              </span>
            </div>
          </div>

          <!-- Toolbar de Botones con 0.85rem de separación -->
          <div class="d-flex align-items-center flex-wrap" style="gap: 0.85rem;">
            ${renderViewInfoButton('salones')}
            <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnExportarCSVSalones" title="Exportar CSV" style="font-size:0.78rem;">
              <i class="bi bi-file-earmark-spreadsheet"></i>
              <span class="d-none d-sm-inline">CSV</span>
            </button>
            <button class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnCrearSalon" style="font-size:0.78rem;">
              <i class="bi bi-plus-circle-fill"></i>
              <span>Nuevo Salón</span>
            </button>
          </div>
        </div>

        <!-- Fila 2: Búsqueda y Botón Desplegable de Filtros & Orden -->
        <div class="d-flex align-items-center justify-content-between flex-wrap pt-1" style="gap: 0.85rem;">
          <div class="flex-grow-1" style="min-width: 260px;">
            <div class="input-group input-group-sm rounded-3 shadow-xs overflow-hidden">
              <span class="input-group-text bg-body-tertiary border-end-0 py-1.5"><i class="bi bi-search text-muted"></i></span>
              <input type="text" class="form-control border-start-0 py-1.5 fw-medium" id="searchSalon" placeholder="Buscar salón por nombre, código o ubicación..." autocomplete="off" style="font-size:0.8rem;">
            </div>
          </div>

          <div class="d-flex align-items-center" style="gap: 0.85rem;">
            <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnToggleFiltrosSalones" type="button" aria-expanded="false" style="font-size:0.78rem;">
              <i class="bi bi-funnel"></i>
              <span>Filtros & Orden</span>
              <span class="badge bg-primary text-white rounded-pill px-1.5 ms-1 d-none" id="filtrosBadgeCountSalones" style="font-size:0.68rem;">0</span>
            </button>

            <button class="btn btn-sm btn-outline-secondary rounded-3 shadow-xs px-2.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-1" id="btnLimpiarFiltrosSalones" title="Restablecer filtros y búsqueda" style="font-size:0.78rem;">
              <i class="bi bi-arrow-counterclockwise"></i>
              <span>Limpiar</span>
            </button>
          </div>
        </div>

        <!-- Fila 3: Panel Desplegable de Filtros y Ordenamiento -->
        <div class="collapse pt-2.5" id="panelFiltrosSalones">
          <div class="p-3 rounded-4 bg-body-tertiary border border-body-tertiary shadow-xs">
            <div class="row g-2 align-items-center">
              
              <div class="col-12 col-sm-6 col-lg-3">
                <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Condición Física</label>
                <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="filterCondicion" style="font-size:0.8rem;">
                  <option value="">Todas las condiciones</option>
                  <option value="excelente">Excelente</option>
                  <option value="buena">Buena</option>
                  <option value="regular">Regular</option>
                  <option value="mala">Mala</option>
                </select>
              </div>

              <div class="col-12 col-sm-6 col-lg-3">
                <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Ubicación / Piso</label>
                <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="filterPiso" style="font-size:0.8rem;">
                  <option value="">Todos los pisos</option>
                  <option value="0">Planta Baja</option>
                  <option value="1">Piso 1</option>
                  <option value="2">Piso 2</option>
                  <option value="3">Piso 3</option>
                  <option value="4">Piso 4</option>
                </select>
              </div>

              <div class="col-12 col-sm-6 col-lg-3">
                <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Estado Operativo</label>
                <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="filterEstadoSalon" style="font-size:0.8rem;">
                  <option value="todos">Todos los estados</option>
                  <option value="activos">Solo Activos</option>
                  <option value="inactivos">Solo Inactivos</option>
                </select>
              </div>

              <div class="col-12 col-sm-6 col-lg-3">
                <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Criterio de Orden</label>
                <div class="input-group input-group-sm rounded-3 shadow-xs overflow-hidden">
                  <span class="input-group-text bg-body border-end-0 py-1.5 text-muted" style="font-size:0.75rem;"><i class="bi bi-sort-down"></i></span>
                  <select class="form-select form-select-sm border-start-0 py-1.5 fw-semibold text-primary" id="selectOrdenarSalones" style="font-size:0.8rem;">
                    <option value="nombre_asc">Nombre (A-Z)</option>
                    <option value="nombre_desc">Nombre (Z-A)</option>
                    <option value="capacidad_desc">Mayor Capacidad</option>
                    <option value="capacidad_asc">Menor Capacidad</option>
                    <option value="piso_asc">Piso (Ascendente)</option>
                  </select>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      <!-- Contenedor de Cuadrícula de Salones (Hasta 5 por fila responsive) -->
      <div class="w-100">
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-2.5 w-100 m-0" id="salonesTableBody">
          <div class="text-center py-5 text-muted"><div class="spinner-border text-primary mb-3" role="status"></div><br><small class="text-muted">Cargando salones...</small></div>
        </div>
      </div>
    </div>
  `
}

function renderTable() {
  const container = state.container
  if (!container) return
  const tbody = container.querySelector('#salonesTableBody')
  if (!tbody) return

  // Actualizar badges del header
  const totalSalones = useSalones.salones.length
  const totalActivos = useSalones.salones.filter(s => s.is_active !== false).length
  const totalCapacidad = useSalones.salones.reduce((acc, s) => acc + (Number(s.capacidad) || 0), 0)
  const totalEquipados = useSalones.salones.filter(s => !!s.equipamiento && s.equipamiento.trim() !== '').length

  const badgeActivos = container.querySelector('#badgeActivosCount')
  const badgeCapacidad = container.querySelector('#badgeCapacidadCount')
  const badgeEquipados = container.querySelector('#badgeEquipadosCount')
  if (badgeActivos) badgeActivos.textContent = `${totalActivos}/${totalSalones}`
  if (badgeCapacidad) badgeCapacidad.textContent = `${totalCapacidad}`
  if (badgeEquipados) badgeEquipados.textContent = `${totalEquipados}`

  const query = (container.querySelector('#searchSalon')?.value || '').trim()
  const condicion = container.querySelector('#filterCondicion')?.value || ''
  const piso = container.querySelector('#filterPiso')?.value || ''
  const estadoFilter = container.querySelector('#filterEstadoSalon')?.value || 'todos'

  let salones = useSalones.getFiltered(query, piso, condicion)

  if (estadoFilter === 'activos') {
    salones = salones.filter(s => s.is_active !== false)
  } else if (estadoFilter === 'inactivos') {
    salones = salones.filter(s => s.is_active === false)
  }

  // Ordenamiento
  const sortVal = container.querySelector('#selectOrdenarSalones')?.value || 'nombre_asc'
  salones.sort((a, b) => {
    if (sortVal === 'nombre_asc') return (a.nombre || '').localeCompare(b.nombre || '')
    if (sortVal === 'nombre_desc') return (b.nombre || '').localeCompare(a.nombre || '')
    if (sortVal === 'capacidad_desc') return (Number(b.capacidad) || 0) - (Number(a.capacidad) || 0)
    if (sortVal === 'capacidad_asc') return (Number(a.capacidad) || 0) - (Number(b.capacidad) || 0)
    if (sortVal === 'piso_asc') return (Number(a.piso) || 0) - (Number(b.piso) || 0)
    return 0
  })

  // Contador de filtros activos
  let activos = 0
  if (condicion) activos++
  if (piso) activos++
  if (estadoFilter !== 'todos') activos++

  const badgeEl = container.querySelector('#filtrosBadgeCountSalones')
  if (badgeEl) {
    badgeEl.textContent = activos
    badgeEl.classList.toggle('d-none', activos === 0)
  }

  if (useSalones.cargando) {
    tbody.innerHTML = `<div class="col-12 text-center py-5 text-muted"><div class="spinner-border text-primary mb-3" role="status"></div><br><small class="text-muted">Cargando salones...</small></div>`
    return
  }

  if (useSalones.error) {
    tbody.innerHTML = `<div class="col-12 text-center py-5 text-danger"><i class="bi bi-exclamation-triangle fs-3 d-block mb-2"></i> Error: ${escapeHTML(useSalones.error)}</div>`
    return
  }

  if (salones.length === 0) {
    tbody.innerHTML = `
      <div class="col-12 text-center py-5 w-100 text-muted">
        <i class="bi bi-inbox fs-1 d-block mb-3" style="color: var(--bs-secondary);"></i>
        No se encontraron salones con los criterios seleccionados.
      </div>`
    return
  }

  tbody.innerHTML = salones
    .map((salon) => {
      const active = salon.is_active !== false
      const condicionBadge = getCondicionBadge(salon.condicion)
      const ubicacionPiso = salon.piso === 0 || salon.piso === '0' ? 'Planta Baja' : `Piso ${salon.piso ?? '-'}`
      const statusColor = active ? 'success' : 'secondary'

      return `
        <div class="col p-1">
          <div class="list-group-item card h-100 rounded-4 border bg-body shadow-xs hover-shadow transition-all d-flex flex-column justify-content-between position-relative overflow-hidden" data-id="${salon.id}" style="cursor: pointer; padding: 0.85rem 0.85rem 1.05rem 0.85rem !important;">
            
            <!-- Parte Superior: Nombre, Piso, Capacidad y Condición -->
            <div class="mb-2">
              
              <!-- Nombre del Salón -->
              <strong class="text-body text-truncate d-block mb-1" style="font-size: 0.92rem;" title="${escapeHTML(salon.nombre || '-')}">
                ${escapeHTML(salon.nombre || '-')}
              </strong>

              <!-- Ubicación / Piso -->
              <div class="mb-2">
                <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle py-1 px-2 text-truncate w-100 text-start d-block rounded-3" style="font-size: 0.72rem;">
                  <i class="bi bi-geo-alt me-1 text-primary"></i>${escapeHTML(ubicacionPiso)}
                </span>
              </div>

              <!-- Capacidad y Condición -->
              <div class="d-flex flex-column gap-1 text-muted small" style="font-size: 0.76rem;">
                <div class="d-flex align-items-center justify-content-between">
                  <span class="text-truncate"><i class="bi bi-people me-1 text-primary"></i>Capacidad:</span>
                  <span class="fw-semibold text-body">${salon.capacidad || 0} pers.</span>
                </div>

                <div class="d-flex align-items-center justify-content-between">
                  <span class="text-truncate"><i class="bi bi-clipboard-check me-1 text-secondary"></i>Condición:</span>
                  ${condicionBadge}
                </div>

                ${salon.equipamiento ? `
                  <div class="text-truncate text-muted fst-italic mt-0.5" style="font-size:0.72rem;" title="${escapeHTML(salon.equipamiento)}">
                    <i class="bi bi-tools me-1"></i>${escapeHTML(salon.equipamiento)}
                  </div>
                ` : '<div class="text-truncate text-muted fst-italic mt-0.5" style="font-size:0.72rem;"><i class="bi bi-tools me-1"></i>Sin equipamiento</div>'}
              </div>
            </div>

            <!-- Barra Inferior de Acciones Contextuales -->
            <div class="pt-2 border-top d-flex align-items-center justify-content-between gap-1.5 mt-auto">
              <button class="btn btn-xs btn-outline-primary rounded-3 shadow-xs d-flex align-items-center justify-content-center flex-grow-1 py-1 px-2 fw-semibold" data-action="edit" data-id="${salon.id}" title="Editar salón" style="font-size:0.75rem;">
                <i class="bi bi-pencil-square me-1"></i>
                <span>Editar</span>
              </button>

              <button class="btn btn-xs btn-outline-danger rounded-3 shadow-xs d-flex align-items-center justify-content-center py-1 px-2" data-action="delete" data-id="${salon.id}" title="${active ? 'Inactivar salón' : 'Eliminar salón'}" style="font-size:0.75rem;">
                <i class="bi bi-trash"></i>
              </button>
            </div>

            <!-- Borde Inferior Sutil como Barra de Estado Operativo -->
            <div class="position-absolute bottom-0 start-0 end-0 bg-body-tertiary" style="height: 3.5px;" title="${active ? 'Salón activo' : 'Salón inactivo'}">
              <div class="h-100 bg-${statusColor}" style="width: 100%;"></div>
            </div>

          </div>
        </div>
      `
    })
    .join('')
}


function exportarSalonesCSV() {
  const salones = useSalones.salones || []
  if (!salones.length) {
    AppToast.warning('No hay salones para exportar')
    return
  }

  const headers = ['Nombre', 'Codigo', 'Piso', 'Capacidad', 'Condicion', 'Estado', 'Equipamiento']
  const rows = salones.map(s => [
    `"${(s.nombre || '').replace(/"/g, '""')}"`,
    `"${(s.codigo || s.codigo_salon || '').replace(/"/g, '""')}"`,
    `"${s.piso === 0 || s.piso === '0' ? 'Planta Baja' : `Piso ${s.piso ?? ''}`}"`,
    s.capacidad || 0,
    `"${s.condicion || ''}"`,
    s.is_active !== false ? 'Activo' : 'Inactivo',
    `"${(s.equipamiento || '').replace(/"/g, '""')}"`,
  ])

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `salones_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  AppToast.success('Listado de salones exportado a CSV')
}

function attachEvents(container) {
  attachViewInfoEvents(container)
  const unsubscribe = useSalones.subscribe(renderTable)

  let debounceTimer
  container.addEventListener('input', (e) => {
    if (e.target.id === 'searchSalon') {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(renderTable, 200)
    }
  })

  container.addEventListener('change', (e) => {
    if (
      e.target.id === 'filterCondicion' ||
      e.target.id === 'filterPiso' ||
      e.target.id === 'filterEstadoSalon' ||
      e.target.id === 'selectOrdenarSalones'
    ) {
      renderTable()
    }
  })

  const btnToggle = container.querySelector('#btnToggleFiltrosSalones')
  const panel = container.querySelector('#panelFiltrosSalones')
  btnToggle?.addEventListener('click', (e) => {
    e.stopPropagation()
    if (panel) {
      panel.classList.toggle('show')
      const isOpen = panel.classList.contains('show')
      btnToggle.setAttribute('aria-expanded', String(isOpen))
      btnToggle.classList.toggle('btn-primary', isOpen)
      btnToggle.classList.toggle('text-white', isOpen)
      btnToggle.classList.toggle('btn-outline-secondary', !isOpen)
    }
  })

  container.querySelector('#btnLimpiarFiltrosSalones')?.addEventListener('click', (e) => {
    e.stopPropagation()
    const search = container.querySelector('#searchSalon')
    const cond = container.querySelector('#filterCondicion')
    const piso = container.querySelector('#filterPiso')
    const estado = container.querySelector('#filterEstadoSalon')
    const orden = container.querySelector('#selectOrdenarSalones')

    if (search) search.value = ''
    if (cond) cond.value = ''
    if (piso) piso.value = ''
    if (estado) estado.value = 'todos'
    if (orden) orden.value = 'nombre_asc'

    renderTable()
  })

  container.querySelector('#btnExportarCSVSalones')?.addEventListener('click', exportarSalonesCSV)

  container.querySelector('#btnCrearSalon')?.addEventListener('click', () => {
    openCreateModal()
  })

  container.querySelector('#salonesTableBody')?.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('[data-action="edit"]')
    if (editBtn) {
      e.stopPropagation()
      openEditModal(editBtn.dataset.id)
      return
    }

    const deleteBtn = e.target.closest('[data-action="delete"]')
    if (deleteBtn) {
      e.stopPropagation()
      openDeleteModal(deleteBtn.dataset.id)
      return
    }

    const item = e.target.closest('.list-group-item[data-id]')
    if (item) {
      openViewModal(item.dataset.id)
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
        <textarea class="form-control input-dense" id="modal-equipamiento" rows="2" placeholder="Piano, atriles, pizarrón, aire acondicionado..."></textarea>
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

      if (!nombre || !capacidad || piso === '') {
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
      return true
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

        if (!nombre || !capacidad || piso === '') {
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
    <div class="salon-profile-container p-1">
      <div class="card border border-body-tertiary rounded-4 p-3 bg-body shadow-xs mb-3">
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2.5">
            <div class="p-2.5 rounded-3 bg-primary-subtle text-primary fs-4">
              <i class="bi bi-door-open"></i>
            </div>
            <div>
              <h5 class="fw-bold mb-0 text-body">${escapeHTML(salon.nombre || 'Salón')}</h5>
              <div class="d-flex align-items-center gap-1.5 mt-1">
                ${getCondicionBadge(salon.condicion)}
                <span class="badge ${salon.is_active !== false ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'} border rounded-2" style="font-size:0.7rem;">${estadoLabel}</span>
              </div>
            </div>
          </div>
          <div class="d-flex align-items-center gap-1.5">
            <button class="btn btn-outline-primary btn-sm rounded-3 px-2.5 py-1.5 btn-profile-edit" data-id="${salon.id}" type="button" title="Editar salón">
              <i class="bi bi-pencil-square me-1"></i>Editar
            </button>
            <button class="btn btn-outline-danger btn-sm rounded-3 px-2.5 py-1.5 btn-profile-delete" data-id="${salon.id}" type="button" title="Inactivar salón">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="row g-2 mb-3">
        <div class="col-6 col-md-3">
          <div class="p-2.5 rounded-3 bg-body-tertiary border text-center">
            <small class="text-muted d-block" style="font-size:0.72rem;">Capacidad</small>
            <strong class="fs-6 text-body">${salon.capacidad || 0} pers.</strong>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="p-2.5 rounded-3 bg-body-tertiary border text-center">
            <small class="text-muted d-block" style="font-size:0.72rem;">Piso</small>
            <strong class="fs-6 text-body">${escapeHTML(ubicacionPiso)}</strong>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="p-2.5 rounded-3 bg-body-tertiary border text-center">
            <small class="text-muted d-block" style="font-size:0.72rem;">Condición</small>
            <strong class="fs-6 text-body text-capitalize">${salon.condicion || '-'}</strong>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="p-2.5 rounded-3 bg-body-tertiary border text-center">
            <small class="text-muted d-block" style="font-size:0.72rem;">Estado</small>
            <strong class="fs-6 text-${salon.is_active !== false ? 'success' : 'secondary'}">${estadoLabel}</strong>
          </div>
        </div>
      </div>

      ${salon.equipamiento ? `
        <div class="p-3 rounded-3 mb-2.5 border bg-body-tertiary">
          <small class="text-muted fw-semibold d-block mb-1" style="font-size:0.75rem;"><i class="bi bi-tools me-1 text-primary"></i>Equipamiento</small>
          <p class="mb-0 text-body small">${escapeHTML(salon.equipamiento)}</p>
        </div>
      ` : ''}

      ${salon.descripcion ? `
        <div class="p-3 rounded-3 mb-2 border bg-body-tertiary">
          <small class="text-muted fw-semibold d-block mb-1" style="font-size:0.75rem;"><i class="bi bi-file-earmark-text me-1 text-secondary"></i>Descripción Adicional</small>
          <p class="mb-0 text-muted small" style="white-space: pre-line; line-height: 1.4;">${escapeHTML(salon.descripcion)}</p>
        </div>
      ` : ''}
    </div>
  `

  AppModal.open({
    title: `Detalle del Salón: ${escapeHTML(salon.nombre || 'Salón')}`,
    hideSave: true,
    size: 'md',
    body: bodyHTML,
    onShow: (modalBody) => {
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
