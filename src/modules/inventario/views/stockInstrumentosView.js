import { Modal } from 'bootstrap'
import {
  obtenerActivos,
  crearActivo,
  actualizarActivo,
} from '../api/inventarioApi.js'
import {
  estadoUsoBadgeClass,
  estadoConservacionBadgeClass,
} from '../domain/comodato.js'
import { calcularAntiguedad, badgeEstadoUso, badgeEstadoConservacion } from '../domain/activo.js'

const PAGE_SIZE = 20

export async function renderStockInstrumentosView(container) {
  const _ac = new AbortController()
  let currentPage = 1
  let currentFilters = {}

  container.innerHTML = '<p class="p-4">Cargando inventario...</p>'

  await render()

  async function render() {
    const params = new URLSearchParams(window.location.search)
    const filters = {
      tipo_instrumento: params.get('tipo') || '',
      estado_uso: params.get('uso') || '',
      estado_conservacion: params.get('conservacion') || '',
      q: params.get('q') || '',
      page: parseInt(params.get('page'), 10) || 1,
    }
    currentFilters = filters
    currentPage = filters.page

    const apiFilters = { ...filters, pageSize: PAGE_SIZE }
    Object.keys(apiFilters).forEach(k => {
      if (!apiFilters[k]) delete apiFilters[k]
    })

    const response = await obtenerActivos(apiFilters)
    if (response.error) {
      container.innerHTML = `<div class="alert alert-danger m-4">Error: ${response.error.message}</div>`
      return
    }

    const activos = response.data || []
    const total = response.total || 0
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1

    const tipos = [...new Set(activos.map(a => a.tipo_instrumento).filter(Boolean))].sort()

    const rows = activos.map(a => {
      const antiguedad = calcularAntiguedad(a)
      const antiguedadStr = antiguedad !== null ? `${antiguedad} años` : '—'
      return `
        <tr>
          <td class="font-monospace small">${a.codigo_inventario}</td>
          <td>${a.tipo_instrumento}</td>
          <td class="text-muted">${[a.marca, a.modelo].filter(Boolean).join(' ')}</td>
          <td><span class="${badgeEstadoConservacion(a.estado_conservacion)}">${a.estado_conservacion}</span></td>
          <td><span class="${badgeEstadoUso(a.estado_uso)}">${a.estado_uso}</span></td>
          <td>${a.ubicacion}</td>
          <td>${antiguedadStr}</td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-info btn-view" data-id="${a.id}">
                <i class="bi bi-eye"></i>
              </button>
              <button class="btn btn-outline-secondary btn-editar"
                data-id="${a.id}"
                data-codigo="${a.codigo_inventario}"
                data-tipo="${a.tipo_instrumento}"
                data-marca="${a.marca || ''}"
                data-modelo="${a.modelo || ''}"
                data-serie="${a.numero_serie || ''}"
                data-conservacion="${a.estado_conservacion}"
                data-uso="${a.estado_uso}"
                data-ubicacion="${a.ubicacion}"
                data-adquisicion="${a.fecha_adquisicion || ''}"
                data-valor="${a.valor_adquisicion || ''}"
                data-proveedor="${a.proveedor || ''}"
                data-foto="${a.foto_url || ''}"
                data-notas="${(a.notas || '').replace(/"/g, '&quot;')}">
                <i class="bi bi-pencil"></i>
              </button>
            </div>
          </td>
        </tr>
      `
    }).join('')

    const pageStart = (currentPage - 1) * PAGE_SIZE + 1
    const pageEnd = Math.min(currentPage * PAGE_SIZE, total)

    container.innerHTML = `
      <div class="container-fluid p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h4 class="mb-0"><i class="bi bi-music-note-list me-2"></i>Inventario de Instrumentos</h4>
          <button id="btn-nuevo" class="btn btn-primary btn-sm">
            <i class="bi bi-plus-lg me-1"></i> Nuevo instrumento
          </button>
        </div>

        <div class="card shadow-sm mb-3">
          <div class="card-body py-2">
            <form id="filter-form" class="row g-2 align-items-end">
              <div class="col-md-2">
                <label class="form-label small mb-0">Tipo</label>
                <select id="filter-tipo" class="form-select form-select-sm">
                  <option value="">Todos</option>
                  ${tipos.map(t => `<option value="${t}" ${filters.tipo_instrumento === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
              </div>
              <div class="col-md-2">
                <label class="form-label small mb-0">Estado uso</label>
                <select id="filter-estado-uso" class="form-select form-select-sm">
                  <option value="">Todos</option>
                  <option value="disponible" ${filters.estado_uso === 'disponible' ? 'selected' : ''}>Disponible</option>
                  <option value="prestado" ${filters.estado_uso === 'prestado' ? 'selected' : ''}>Prestado</option>
                  <option value="en_mantenimiento" ${filters.estado_uso === 'en_mantenimiento' ? 'selected' : ''}>En mantenimiento</option>
                  <option value="en_reparacion" ${filters.estado_uso === 'en_reparacion' ? 'selected' : ''}>En reparación</option>
                  <option value="de_baja" ${filters.estado_uso === 'de_baja' ? 'selected' : ''}>De baja</option>
                </select>
              </div>
              <div class="col-md-2">
                <label class="form-label small mb-0">Conservación</label>
                <select id="filter-estado-conservacion" class="form-select form-select-sm">
                  <option value="">Todos</option>
                  <option value="excelente" ${filters.estado_conservacion === 'excelente' ? 'selected' : ''}>Excelente</option>
                  <option value="bueno" ${filters.estado_conservacion === 'bueno' ? 'selected' : ''}>Bueno</option>
                  <option value="regular" ${filters.estado_conservacion === 'regular' ? 'selected' : ''}>Regular</option>
                  <option value="mantenimiento" ${filters.estado_conservacion === 'mantenimiento' ? 'selected' : ''}>Mantenimiento</option>
                  <option value="de_baja" ${filters.estado_conservacion === 'de_baja' ? 'selected' : ''}>De baja</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label small mb-0">Buscar</label>
                <input id="search-input" type="text" class="form-control form-control-sm" placeholder="Código, tipo, marca..." value="${filters.q || ''}">
              </div>
              <div class="col-md-1">
                <button id="btn-buscar" type="submit" class="btn btn-sm btn-outline-primary w-100">
                  <i class="bi bi-search"></i>
                </button>
              </div>
              <div class="col-md-1">
                <button id="btn-limpiar" type="button" class="btn btn-sm btn-outline-secondary w-100">
                  <i class="bi bi-x-circle"></i>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div class="card shadow-sm">
          <div class="card-body p-0">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Código</th>
                  <th>Tipo</th>
                  <th>Marca / Modelo</th>
                  <th>Conservación</th>
                  <th>Uso</th>
                  <th>Ubicación</th>
                  <th>Antigüedad</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody id="tbody-activos">
                ${rows || '<tr><td colspan="8" class="text-center text-muted py-4">Sin instrumentos registrados</td></tr>'}
              </tbody>
            </table>
          </div>
          ${totalPages > 1 ? `
          <div class="card-footer d-flex justify-content-between align-items-center">
            <small class="text-muted">Mostrando ${pageStart}-${pageEnd} de ${total}</small>
            <nav>
              <ul class="pagination pagination-sm mb-0" id="pagination">
                <li class="page-item ${currentPage <= 1 ? 'disabled' : ''}">
                  <button class="page-link" data-page="${currentPage - 1}">&laquo;</button>
                </li>
                ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
                  <li class="page-item ${p === currentPage ? 'active' : ''}">
                    <button class="page-link" data-page="${p}">${p}</button>
                  </li>
                `).join('')}
                <li class="page-item ${currentPage >= totalPages ? 'disabled' : ''}">
                  <button class="page-link" data-page="${currentPage + 1}">&raquo;</button>
                </li>
              </ul>
            </nav>
          </div>
          ` : ''}
        </div>

        <!-- Modal nuevo/editar instrumento -->
        <div class="modal fade" id="modal-instrumento" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="modal-titulo">Nuevo instrumento</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <form id="form-instrumento" novalidate>
                  <input type="hidden" name="id" />
                  <div class="row g-3 mb-3">
                    <div class="col-6">
                      <label class="form-label fw-semibold">Tipo de instrumento</label>
                      <input type="text" class="form-control" name="tipo_instrumento" required placeholder="Violín, Cello, Flauta...">
                    </div>
                    <div class="col-6">
                      <label class="form-label fw-semibold">Código inventario</label>
                      <input type="text" class="form-control" name="codigo_instrumento" required placeholder="V8-VIO-001">
                    </div>
                  </div>
                  <div class="row g-3 mb-3">
                    <div class="col-4">
                      <label class="form-label fw-semibold">Marca</label>
                      <input type="text" class="form-control" name="marca">
                    </div>
                    <div class="col-4">
                      <label class="form-label fw-semibold">Modelo</label>
                      <input type="text" class="form-control" name="modelo">
                    </div>
                    <div class="col-4">
                      <label class="form-label fw-semibold">N° de serie</label>
                      <input type="text" class="form-control" name="numero_serie">
                    </div>
                  </div>
                  <div class="row g-3 mb-3">
                    <div class="col-4">
                      <label class="form-label fw-semibold">Estado conservación</label>
                      <select class="form-select" name="estado_conservacion" required>
                        <option value="excelente">Excelente</option>
                        <option value="bueno" selected>Bueno</option>
                        <option value="regular">Regular</option>
                        <option value="mantenimiento">En mantenimiento</option>
                        <option value="de_baja">De baja</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label class="form-label fw-semibold">Estado uso</label>
                      <select class="form-select" name="estado_uso">
                        <option value="disponible" selected>Disponible</option>
                        <option value="prestado">Prestado</option>
                        <option value="en_mantenimiento">En mantenimiento</option>
                        <option value="en_reparacion">En reparación</option>
                        <option value="de_baja">De baja</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label class="form-label fw-semibold">Ubicación</label>
                      <input type="text" class="form-control" name="ubicacion" value="Sede Principal">
                    </div>
                  </div>
                  <div class="row g-3 mb-3">
                    <div class="col-4">
                      <label class="form-label fw-semibold">Fecha de adquisición</label>
                      <input type="date" class="form-control" name="fecha_adquisicion">
                    </div>
                    <div class="col-4">
                      <label class="form-label fw-semibold">Valor de adquisición</label>
                      <input type="number" class="form-control" name="valor_adquisicion" min="0" step="0.01" placeholder="RD$">
                    </div>
                    <div class="col-4">
                      <label class="form-label fw-semibold">Proveedor</label>
                      <input type="text" class="form-control" name="proveedor" placeholder="Nombre del proveedor">
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-semibold">URL de foto</label>
                    <input type="url" class="form-control" name="foto_url" placeholder="https://...">
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Notas</label>
                    <textarea class="form-control" name="notas" rows="2"></textarea>
                  </div>
                  <div id="modal-error" class="alert alert-danger d-none"></div>
                </form>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button id="btn-guardar-instrumento" class="btn btn-primary">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `

    bindEvents()
  }

  function bindEvents() {
    container.querySelector('#filter-form')?.addEventListener('submit', (e) => {
      e.preventDefault()
      applyFilters()
    }, { signal: _ac.signal })

    container.querySelector('#btn-buscar')?.addEventListener('click', () => {
      applyFilters()
    }, { signal: _ac.signal })

    container.querySelector('#btn-limpiar')?.addEventListener('click', () => {
      clearFilters()
    }, { signal: _ac.signal })

    container.querySelector('#pagination')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.page-link')
      if (!btn) return
      const page = parseInt(btn.dataset.page, 10)
      if (!page) return
      updateURL({ page })
      render()
    }, { signal: _ac.signal })

    container.querySelector('#btn-nuevo')?.addEventListener('click', () => {
      editingId = null
      container.querySelector('#modal-titulo').textContent = 'Nuevo instrumento'
      container.querySelector('#form-instrumento').reset()
      container.querySelector('[name="id"]').value = ''
      container.querySelector('#modal-error').classList.add('d-none')
      getModal()?.show()
    }, { signal: _ac.signal })

    container.querySelector('#tbody-activos')?.addEventListener('click', (e) => {
      const viewBtn = e.target.closest('.btn-view')
      if (viewBtn) {
        const id = viewBtn.dataset.id
        if (window.router) {
          window.router.navigate('inventario-detalle', { activoId: id })
        }
        return
      }

      const btn = e.target.closest('.btn-editar')
      if (!btn) return
      editingId = btn.dataset.id
      const form = container.querySelector('#form-instrumento')
      form.querySelector('[name="id"]').value = btn.dataset.id
      form.querySelector('[name="tipo_instrumento"]').value = btn.dataset.tipo
      form.querySelector('[name="marca"]').value = btn.dataset.marca
      form.querySelector('[name="modelo"]').value = btn.dataset.modelo
      form.querySelector('[name="numero_serie"]').value = btn.dataset.serie
      form.querySelector('[name="codigo_instrumento"]').value = btn.dataset.codigo
      form.querySelector('[name="estado_conservacion"]').value = btn.dataset.conservacion
      form.querySelector('[name="estado_uso"]').value = btn.dataset.uso
      form.querySelector('[name="ubicacion"]').value = btn.dataset.ubicacion
      form.querySelector('[name="fecha_adquisicion"]').value = btn.dataset.adquisicion
      form.querySelector('[name="valor_adquisicion"]').value = btn.dataset.valor
      form.querySelector('[name="proveedor"]').value = btn.dataset.proveedor
      form.querySelector('[name="foto_url"]').value = btn.dataset.foto
      form.querySelector('[name="notas"]').value = btn.dataset.notas || ''
      container.querySelector('#modal-titulo').textContent = 'Editar instrumento'
      container.querySelector('#modal-error').classList.add('d-none')
      getModal()?.show()
    }, { signal: _ac.signal })

    container.querySelector('#btn-guardar-instrumento')?.addEventListener('click', async () => {
      const form = container.querySelector('#form-instrumento')
      const errEl = container.querySelector('#modal-error')
      const fd = new FormData(form)
      const payload = Object.fromEntries(fd.entries())
      delete payload.id

      if (!payload.marca) delete payload.marca
      if (!payload.modelo) delete payload.modelo
      if (!payload.numero_serie) delete payload.numero_serie
      if (!payload.fecha_adquisicion) delete payload.fecha_adquisicion
      if (!payload.valor_adquisicion) delete payload.valor_adquisicion
      if (!payload.proveedor) delete payload.proveedor
      if (!payload.foto_url) delete payload.foto_url
      if (!payload.notas) delete payload.notas

      const btn = container.querySelector('#btn-guardar-instrumento')
      btn.disabled = true

      const { error } = editingId
        ? await actualizarActivo(editingId, payload)
        : await crearActivo(payload)

      btn.disabled = false

      if (error) {
        errEl.textContent = error.message
        errEl.classList.remove('d-none')
      } else {
        getModal()?.hide()
        render()
      }
    }, { signal: _ac.signal })
  }

  function applyFilters() {
    const filters = {
      tipo_instrumento: container.querySelector('#filter-tipo')?.value || '',
      estado_uso: container.querySelector('#filter-estado-uso')?.value || '',
      estado_conservacion: container.querySelector('#filter-estado-conservacion')?.value || '',
      q: container.querySelector('#search-input')?.value || '',
    }
    updateURL({ ...filters, page: 1 })
    currentPage = 1
    render()
  }

  function clearFilters() {
    const input = container.querySelector('#search-input')
    if (input) input.value = ''
    container.querySelector('#filter-tipo').value = ''
    container.querySelector('#filter-estado-uso').value = ''
    container.querySelector('#filter-estado-conservacion').value = ''
    updateURL({ page: 1 })
    currentPage = 1
    render()
  }

  function updateURL(params) {
    const url = new URL(window.location)
    Object.entries(params).forEach(([k, v]) => {
      if (v && v !== '') {
        url.searchParams.set(k, v)
      } else {
        url.searchParams.delete(k)
      }
    })
    window.history.replaceState({}, '', url)
  }

  let editingId = null

  function getModal() {
    const el = container.querySelector('#modal-instrumento')
    if (!el) return null
    return new Modal(el)
  }

  return { teardown: () => _ac.abort() }
}
