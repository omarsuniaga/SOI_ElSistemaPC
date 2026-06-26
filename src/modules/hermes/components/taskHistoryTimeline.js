/**
 * taskHistoryTimeline.js — Timeline del historial de cambios de una tarea.
 * SP-0 / R5: muestra campo, valor anterior → nuevo, actor real y fecha.
 * tarea_historial es INMUTABLE (sólo lectura para usuarios).
 *
 * Render puro: renderTaskHistoryTimeline(historial) → HTML string.
 */

function escapeHTML(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatDate(isoString) {
  if (!isoString) return ''
  try {
    return new Date(isoString).toLocaleString('es-VE', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return isoString
  }
}

const CAMPO_LABELS = {
  estado:           'Estado',
  asignado_a:       'Asignado a',
  prioridad:        'Prioridad',
  fecha_vencimiento: 'Vencimiento',
  entidad_tipo:     'Tipo de entidad',
  entidad_id:       'ID de entidad',
  correlation_id:   'Correlation ID',
}

/**
 * Renders a timeline of history entries for a task.
 * Entries are shown oldest-first (caller should pass them sorted by created_at ASC).
 *
 * @param {Array<{id:string, campo:string, valor_anterior:string|null, valor_nuevo:string|null, actor_nombre:string|null, created_at:string}>} historial
 * @returns {string} HTML string
 */
export function renderTaskHistoryTimeline(historial = []) {
  if (historial.length === 0) {
    return `
      <div class="task-history-timeline">
        <h6 class="mb-3"><i class="bi bi-clock-history me-1 text-muted"></i>Historial de cambios</h6>
        <p class="text-muted small text-center py-2"><i class="bi bi-journal-x me-1"></i>Sin cambios registrados.</p>
      </div>
    `
  }

  const entriesHTML = historial.map((h) => {
    const campoLabel = CAMPO_LABELS[h.campo] ?? escapeHTML(h.campo)
    const actor = h.actor_nombre ? escapeHTML(h.actor_nombre) : '<em class="text-muted">Sistema</em>'
    const anterior = h.valor_anterior != null ? `<span class="text-danger text-decoration-line-through small">${escapeHTML(h.valor_anterior)}</span>` : '<span class="text-muted small">—</span>'
    const nuevo = h.valor_nuevo != null ? `<span class="text-success fw-semibold small">${escapeHTML(h.valor_nuevo)}</span>` : '<span class="text-muted small">—</span>'

    return `
      <div class="task-history-entry d-flex gap-3 mb-3" data-history-id="${escapeHTML(h.id)}">
        <div class="task-history-dot flex-shrink-0 d-flex flex-column align-items-center">
          <div class="rounded-circle bg-primary bg-opacity-10 border border-primary border-opacity-25 d-flex align-items-center justify-content-center" style="width:28px;height:28px;">
            <i class="bi bi-pencil-fill text-primary" style="font-size:0.6rem;"></i>
          </div>
          <div class="task-history-line flex-grow-1 border-start border-2 border-light" style="min-height:16px;margin-left:1px;"></div>
        </div>
        <div class="flex-grow-1 pb-2">
          <div class="d-flex flex-wrap align-items-baseline gap-2 mb-1">
            <strong class="small">${campoLabel}</strong>
            <span class="small text-muted">cambió de</span>
            ${anterior}
            <i class="bi bi-arrow-right small text-muted"></i>
            ${nuevo}
          </div>
          <div class="d-flex gap-2 small text-muted">
            <span><i class="bi bi-person me-1"></i>${actor}</span>
            <span>·</span>
            <span><i class="bi bi-clock me-1"></i>${formatDate(h.created_at)}</span>
          </div>
        </div>
      </div>
    `
  }).join('')

  return `
    <div class="task-history-timeline">
      <h6 class="mb-3"><i class="bi bi-clock-history me-1 text-primary"></i>Historial de cambios
        <span class="badge bg-secondary ms-1">${historial.length}</span>
      </h6>
      <div class="task-history-entries" style="max-height:280px;overflow-y:auto;">
        ${entriesHTML}
      </div>
    </div>
  `
}
