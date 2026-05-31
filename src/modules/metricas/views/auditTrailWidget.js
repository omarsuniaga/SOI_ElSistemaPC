import { getAuditLogs } from '../api/observabilidadApi.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'

/**
 * Widget Premium: Audit Trail (Trazabilidad de Seguridad)
 * @param {string} containerId - ID del contenedor DOM
 */
export function auditTrailWidget(containerId) {
  let container = null
  let auditSearch = ''
  let auditActionFilter = 'ALL'

  async function render() {
    if (!container) return

    container.innerHTML = `
      <div class="row g-3 mb-4 align-items-end">
        <div class="col-12 col-md-5">
          <label class="form-label small fw-semibold text-secondary">Buscar por Actor / Notas / ID</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-search"></i></span>
            <input type="text" class="form-control shadow-sm" id="input-audit-search" placeholder="Correo, UUID, notas..." value="${escapeHTML(auditSearch)}">
          </div>
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label small fw-semibold text-secondary">Acción Transaccional</label>
          <select class="form-select shadow-sm" id="select-audit-action">
            <option value="ALL" ${auditActionFilter === 'ALL' ? 'selected' : ''}>Todas las Acciones</option>
            <option value="APROBACION_FINAL" ${auditActionFilter === 'APROBACION_FINAL' ? 'selected' : ''}>Aprobación Final</option>
            <option value="CREACION" ${auditActionFilter === 'CREACION' ? 'selected' : ''}>Creación</option>
            <option value="RECHAZO" ${auditActionFilter === 'RECHAZO' ? 'selected' : ''}>Rechazo</option>
          </select>
        </div>
        <div class="col-12 col-md-3">
          <button class="btn btn-outline-primary w-100 shadow-sm" id="btn-reset-audit-filters"><i class="bi bi-arrow-counterclockwise me-1"></i>Limpiar Filtros</button>
        </div>
      </div>

      <div class="table-responsive page-glass p-0 overflow-hidden shadow-sm border rounded-3">
        <table class="table table-hover table-striped align-middle mb-0" id="table-audit-trail">
          <thead class="table-light">
            <tr>
              <th class="py-3 px-3" style="font-size: 0.85rem; font-weight: 600;">Fecha y Hora</th>
              <th class="py-3" style="font-size: 0.85rem; font-weight: 600;">Acción</th>
              <th class="py-3" style="font-size: 0.85rem; font-weight: 600;">Usuario Actor</th>
              <th class="py-3" style="font-size: 0.85rem; font-weight: 600;">Notas de Transacción</th>
              <th class="py-3 px-3 text-center" style="font-size: 0.85rem; font-weight: 600;">Detalles</th>
            </tr>
          </thead>
          <tbody class="small" id="audit-trail-tbody">
            <tr>
              <td colspan="5" class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary"></div></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div id="audit-pagination-info" class="text-muted extra-small mt-2 text-end fw-semibold"></div>
    `

    await loadAuditTrail()
    attachEvents()
  }

  async function loadAuditTrail() {
    const tbody = container.querySelector('#audit-trail-tbody')
    const paginationInfo = container.querySelector('#audit-pagination-info')
    if (!tbody) return

    const data = await getAuditLogs()

    // Filtrado en caliente del lado del cliente
    let filtered = data || []

    if (auditSearch.trim() !== '') {
      const q = auditSearch.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          (item.actor_id && item.actor_id.toLowerCase().includes(q)) ||
          (item.usuario_id && item.usuario_id.toLowerCase().includes(q)) ||
          (item.notas && item.notas.toLowerCase().includes(q)) ||
          (item.id && item.id.toLowerCase().includes(q)),
      )
    }

    if (auditActionFilter !== 'ALL') {
      filtered = filtered.filter((item) => item.accion === auditActionFilter)
    }

    // Paginación estricta a un máximo de 50 registros
    const maxRecords = 50
    const paginated = filtered.slice(0, maxRecords)

    if (paginated.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-5"><i class="bi bi-info-circle me-1"></i> No se encontraron registros de auditoría.</td></tr>`
      if (paginationInfo) paginationInfo.textContent = 'Mostrando 0 registros'
      return
    }

    tbody.innerHTML = paginated
      .map((item) => {
        let actionBadge = 'bg-secondary'
        if (item.accion === 'APROBACION_FINAL')
          actionBadge = 'bg-success bg-opacity-10 text-success border border-success-subtle'
        if (item.accion === 'CREACION')
          actionBadge = 'bg-primary bg-opacity-10 text-primary border border-primary-subtle'
        if (item.accion === 'RECHAZO')
          actionBadge = 'bg-danger bg-opacity-10 text-danger border border-danger-subtle'

        const dateStr = item.creado_a
          ? new Date(item.creado_a).toLocaleString('es-ES')
          : 'Fecha no disponible'
        const actorStr = item.usuario_id || item.actor_id || 'Sistema'

        return `
        <tr>
          <td class="text-nowrap px-3 text-secondary">${dateStr}</td>
          <td><span class="badge ${actionBadge} px-2.5 py-1.5 rounded-pill fw-semibold" style="font-size: 0.725rem;">${item.accion}</span></td>
          <td class="fw-semibold text-break" style="max-width: 200px;" title="${actorStr}">${actorStr}</td>
          <td class="text-secondary">${escapeHTML(item.notas || 'Sin comentarios adicionales')}</td>
          <td class="text-center px-3">
            <button class="btn btn-sm btn-outline-secondary btn-audit-detail rounded-circle shadow-sm" data-audit-id="${item.id}" style="width: 32px; height: 32px; padding: 0;">
              <i class="bi bi-info-circle-fill" style="font-size: 0.85rem;"></i>
            </button>
          </td>
        </tr>
      `
      })
      .join('')

    if (paginationInfo) {
      paginationInfo.textContent = `Mostrando ${paginated.length} de ${filtered.length} registros (límite de 50 registros por página)`
    }

    // Registrar botones de detalles
    container.querySelectorAll('.btn-audit-detail').forEach((btn) => {
      btn.addEventListener('click', () => {
        const auditId = btn.dataset.auditId
        const record = paginated.find((r) => r.id === auditId)
        if (record) {
          _openAuditDetailModal(record)
        }
      })
    })
  }

  function _openAuditDetailModal(record) {
    const detailsHtml = record.detalles
      ? Object.keys(record.detalles)
          .map(
            (k) => `
          <div class="col-6 mb-2">
            <span class="d-block extra-small text-muted text-uppercase fw-bold">${k}</span>
            <span class="small fw-semibold text-secondary">${escapeHTML(String(record.detalles[k]))}</span>
          </div>
        `,
          )
          .join('')
      : ''

    const content = `
      <div class="p-3">
        <div class="mb-3">
          <strong class="small text-secondary d-block">ID ÚNICO DE AUDITORÍA:</strong>
          <div class="font-monospace bg-light bg-opacity-50 p-2.5 rounded border text-break extra-small mt-1 text-primary fw-semibold">${record.id}</div>
        </div>
        <div class="row g-2 mb-3 bg-light bg-opacity-25 p-2.5 rounded border">
          <div class="col-6">
            <strong class="extra-small text-secondary d-block text-uppercase">Fecha y Hora:</strong>
            <span class="small fw-semibold">${new Date(record.creado_a).toLocaleString('es-ES')}</span>
          </div>
          <div class="col-6">
            <strong class="extra-small text-secondary d-block text-uppercase">Acción Transaccional:</strong>
            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2.5 py-1 rounded-pill mt-0.5 fw-bold" style="font-size:0.75rem;">${record.accion}</span>
          </div>
        </div>
        <div class="mb-3">
          <strong class="small text-secondary d-block">USUARIO ACTOR RESPONSABLE:</strong>
          <div class="mt-1 small text-dark fw-bold text-break"><i class="bi bi-person-fill me-1 text-secondary"></i> ${record.usuario_id || record.actor_id}</div>
        </div>
        <div class="mb-3">
          <strong class="small text-secondary d-block">NOTAS / OBSERVACIÓN:</strong>
          <div class="mt-1 p-3 bg-light bg-opacity-25 rounded border text-secondary small lh-base italic">"${escapeHTML(record.notas || 'Sin notas registradas en esta transacción')}"</div>
        </div>
        ${
          detailsHtml
            ? `
          <div class="border-top pt-3">
            <strong class="small text-secondary d-block mb-2">METADATOS EN PAYLOAD (JSON):</strong>
            <div class="row g-2 bg-light bg-opacity-10 p-2 rounded border">
              ${detailsHtml}
            </div>
          </div>
        `
            : ''
        }
      </div>
    `

    AppModal.open({
      title: 'Detalles del Audit Trail de Seguridad',
      body: content,
      hideSave: true,
      cancelText: 'Cerrar',
    })
  }

  // Track registered listeners for destroy() cleanup
  let boundListeners = []

  function attachEvents() {
    const searchInput = container.querySelector('#input-audit-search')
    const onSearch = (e) => {
      auditSearch = e.target.value
      loadAuditTrail()
    }
    searchInput?.addEventListener('input', onSearch)
    if (searchInput) boundListeners.push({ el: searchInput, event: 'input', fn: onSearch })

    const actionSelect = container.querySelector('#select-audit-action')
    const onChange = (e) => {
      auditActionFilter = e.target.value
      loadAuditTrail()
    }
    actionSelect?.addEventListener('change', onChange)
    if (actionSelect) boundListeners.push({ el: actionSelect, event: 'change', fn: onChange })

    const resetBtn = container.querySelector('#btn-reset-audit-filters')
    const onReset = () => {
      auditSearch = ''
      auditActionFilter = 'ALL'
      if (searchInput) searchInput.value = ''
      if (actionSelect) actionSelect.value = 'ALL'
      loadAuditTrail()
    }
    resetBtn?.addEventListener('click', onReset)
    if (resetBtn) boundListeners.push({ el: resetBtn, event: 'click', fn: onReset })
  }

  return {
    async init() {
      container = document.getElementById(containerId)
      if (!container) {
        console.error(`[auditTrailWidget] Contenedor #${containerId} no encontrado en el DOM`)
        return
      }

      await render()
    },

    destroy() {
      // Remove all registered event listeners
      boundListeners.forEach(({ el, event, fn }) => {
        el.removeEventListener(event, fn)
      })
      boundListeners = []

      // Nullify DOM references
      container = null
    },
  }
}
