import { Modal } from 'bootstrap'
import { obtenerHistorialActivo, crearEventoManual } from '../api/inventarioApi.js'
import { TIPOS_EVENTO, ICONOS_EVENTO, lineTime, agruparPorFecha, formatearEvento } from '../domain/historial.js'

export async function renderHistorialInstrumentoView(container, { activoId }) {
  const _ac = new AbortController()
  let activeFilters = new Set(TIPOS_EVENTO)

  container.innerHTML = '<p class="p-4">Cargando historial...</p>'

  await render()

  async function render() {
    const { data: eventos, error } = await obtenerHistorialActivo(activoId)
    if (error) {
      container.innerHTML = `<div class="alert alert-danger m-4">Error: ${error.message}</div>`
      return
    }

    const filtered = (eventos || []).filter(e => activeFilters.has(e.tipo_evento))
    const timeline = lineTime(filtered)
    const grouped = agruparPorFecha(timeline)

    // Sort groups descending
    const sortedGroups = Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a))

    const groupHtml = sortedGroups.map(([monthKey, events]) => {
      const [year, month] = monthKey.split('-')
      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
      const monthLabel = `${monthNames[parseInt(month, 10) - 1]} ${year}`

      const itemsHtml = events.map(evt => `
        <div class="timeline-item d-flex gap-3 mb-3 ps-3 position-relative">
          <div class="timeline-dot position-absolute start-0 top-0 mt-1"
            style="width:12px;height:12px;border-radius:50%;background:var(--bs-primary);border:2px solid var(--bs-primary-bg-subtle)">
          </div>
          <div class="text-center flex-shrink-0" style="width:36px">
            <i class="bi ${evt.icono} fs-5 text-primary"></i>
          </div>
          <div class="flex-grow-1">
            <p class="mb-0 fw-semibold small">${evt.tipo_label}</p>
            <p class="mb-0">${evt.descripcion}</p>
            <small class="text-muted">${evt.fecha_legible}</small>
            ${evt.usuario_id ? `<br><small class="text-muted">Por: ${evt.usuario_id}</small>` : ''}
          </div>
        </div>
      `).join('')

      return `
        <div class="timeline-group mb-4">
          <h6 class="fw-bold text-muted mb-3 border-bottom pb-1">${monthLabel}</h6>
          <div class="ms-2 border-start border-2 ps-3">
            ${itemsHtml}
          </div>
        </div>
      `
    }).join('')

    const checkboxesHtml = TIPOS_EVENTO.map(tipo => {
      const icono = ICONOS_EVENTO[tipo] || 'bi-question-circle'
      const label = tipo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      return `
        <div class="form-check form-check-inline">
          <input class="form-check-input filter-evento" type="checkbox" value="${tipo}"
            ${activeFilters.has(tipo) ? 'checked' : ''}>
          <label class="form-check-label">
            <i class="bi ${icono} me-1"></i>${label}
          </label>
        </div>
      `
    }).join('')

    container.innerHTML = `
      <div class="container-fluid p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h4 class="mb-0"><i class="bi bi-clock-history me-2"></i>Historial del instrumento</h4>
          <div class="d-flex gap-2">
            <button id="btn-volver" class="btn btn-outline-secondary btn-sm">
              <i class="bi bi-arrow-left me-1"></i> Volver
            </button>
            <button id="btn-agregar-evento" class="btn btn-primary btn-sm">
              <i class="bi bi-plus-lg me-1"></i> Agregar evento manual
            </button>
          </div>
        </div>

        <div class="card shadow-sm mb-3">
          <div class="card-body py-2" id="filter-tipo-evento">
            <label class="form-label small fw-semibold mb-2">Filtrar por tipo de evento</label>
            <div class="d-flex flex-wrap gap-1">
              ${checkboxesHtml}
            </div>
          </div>
        </div>

        <div class="card shadow-sm">
          <div class="card-body" id="timeline">
            ${groupHtml || '<p class="text-muted text-center py-4">Sin eventos registrados para este instrumento.</p>'}
          </div>
        </div>

        <!-- Modal agregar evento manual -->
        <div class="modal fade" id="modal-evento-manual" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Agregar evento manual</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <form id="form-evento-manual" novalidate>
                  <input type="hidden" name="activo_id" value="${activoId}">
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Tipo de evento</label>
                    <select class="form-select" name="tipo_evento" required>
                      ${TIPOS_EVENTO.filter(t => t !== 'creacion').map(t => `
                        <option value="${t}">${t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                      `).join('')}
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Descripción</label>
                    <textarea class="form-control" name="descripcion" rows="3" required placeholder="Detalle del evento..."></textarea>
                  </div>
                  <div id="modal-evento-error" class="alert alert-danger d-none"></div>
                </form>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button id="btn-guardar-evento" class="btn btn-primary">
                  <i class="bi bi-save me-1"></i> Guardar evento
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `

    bindEvents()
  }

  function bindEvents() {
    container.querySelector('#filter-tipo-evento')?.addEventListener('change', (e) => {
      const cb = e.target.closest('.filter-evento')
      if (!cb) return
      activeFilters = new Set(
        Array.from(container.querySelectorAll('.filter-evento:checked')).map(el => el.value)
      )
      render()
    }, { signal: _ac.signal })

    container.querySelector('#btn-agregar-evento')?.addEventListener('click', () => {
      container.querySelector('#form-evento-manual').reset()
      container.querySelector('#modal-evento-error').classList.add('d-none')
      getModal()?.show()
    }, { signal: _ac.signal })

    container.querySelector('#btn-guardar-evento')?.addEventListener('click', async () => {
      const form = container.querySelector('#form-evento-manual')
      const errEl = container.querySelector('#modal-evento-error')
      const fd = new FormData(form)
      const payload = {
        activo_id: fd.get('activo_id'),
        tipo_evento: fd.get('tipo_evento'),
        descripcion: fd.get('descripcion'),
      }

      if (!payload.tipo_evento || !payload.descripcion.trim()) {
        errEl.textContent = 'Completá todos los campos requeridos.'
        errEl.classList.remove('d-none')
        return
      }

      const btn = container.querySelector('#btn-guardar-evento')
      btn.disabled = true

      const { error } = await crearEventoManual(payload)

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

  function getModal() {
    const el = container.querySelector('#modal-evento-manual')
    if (!el) return null
    return new Modal(el)
  }

  return { teardown: () => _ac.abort() }
}
