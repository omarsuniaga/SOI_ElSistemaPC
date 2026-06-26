/**
 * taskCommentsPanel.js — Panel de comentarios internos de una tarea.
 * SP-0 / R4: hilo de comentarios + input para agregar.
 *
 * Render puro: renderTaskCommentsPanel(tareaId, comentarios) → HTML string.
 * El wiring de eventos (submit) lo hace el caller (tareasView.js).
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

/**
 * Renders the comments thread and add-comment form.
 *
 * @param {string} tareaId
 * @param {Array<{id:string, autor_nombre:string, cuerpo:string, created_at:string}>} comentarios
 * @returns {string} HTML string
 */
export function renderTaskCommentsPanel(tareaId, comentarios = []) {
  const hiloHTML = comentarios.length === 0
    ? `<p class="text-muted small text-center py-2"><i class="bi bi-chat-square-dots me-1"></i>Sin comentarios aún.</p>`
    : comentarios.map((c) => `
        <div class="task-comment-item d-flex gap-2 mb-3" data-comment-id="${escapeHTML(c.id)}">
          <div class="task-comment-avatar flex-shrink-0 rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style="width:32px;height:32px;">
            <i class="bi bi-person-fill small"></i>
          </div>
          <div class="flex-grow-1">
            <div class="d-flex align-items-baseline gap-2 mb-1">
              <strong class="small">${escapeHTML(c.autor_nombre || 'Anónimo')}</strong>
              <small class="text-muted">${formatDate(c.created_at)}</small>
            </div>
            <p class="mb-0 small">${escapeHTML(c.cuerpo)}</p>
          </div>
        </div>
      `).join('')

  return `
    <div class="task-comments-panel" data-tarea-id="${escapeHTML(tareaId)}">
      <h6 class="mb-3"><i class="bi bi-chat-left-text me-1 text-primary"></i>Comentarios internos
        <span class="badge bg-secondary ms-1">${comentarios.length}</span>
      </h6>
      <div class="task-comments-thread mb-3" style="max-height:260px;overflow-y:auto;">
        ${hiloHTML}
      </div>
      <div class="task-comment-form">
        <label class="form-label small fw-semibold">Agregar comentario</label>
        <textarea class="form-control form-control-sm task-comment-input" id="taskCommentInput"
          rows="2" placeholder="Escribe tu comentario aquí..."></textarea>
        <div class="d-flex justify-content-end mt-2">
          <button class="btn btn-sm btn-primary task-comment-submit" type="button">
            <i class="bi bi-send me-1"></i>Enviar
          </button>
        </div>
      </div>
    </div>
  `
}
