/**
 * taskAttachmentsPanel.js — Panel de adjuntos de una tarea.
 * SP-0 / R6: lista adjuntos con nombre, subido_por y enlace (vía urlFirmada).
 * Los adjuntos tienen la forma estándar SP-0: { id, nombre, storage_path,
 * mime_type, size_bytes, subido_por, subido_por_nombre, created_at }.
 * La URL firmada se carga asíncronamente al hacer click (no se persiste).
 *
 * Render puro: renderTaskAttachmentsPanel(tareaId, adjuntos) → HTML string.
 * El caller inyecta el HTML y luego puede llamar wireTaskAttachmentsPanel(container)
 * para activar los links firmados.
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
    return new Date(isoString).toLocaleDateString('es-VE', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch {
    return isoString
  }
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getMimeIcon(mimeType) {
  if (!mimeType) return 'bi-file-earmark'
  if (mimeType.startsWith('image/')) return 'bi-file-earmark-image'
  if (mimeType === 'application/pdf') return 'bi-file-earmark-pdf text-danger'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'bi-file-earmark-word text-primary'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'bi-file-earmark-excel text-success'
  return 'bi-file-earmark-text'
}

/**
 * Renders the attachments list panel.
 * Each attachment shows a "Descargar" link that triggers urlFirmada on click.
 *
 * @param {string} tareaId
 * @param {Array<{id:string, nombre:string, storage_path:string, mime_type:string, size_bytes:number, subido_por_nombre:string, created_at:string}>} adjuntos
 * @returns {string} HTML string
 */
export function renderTaskAttachmentsPanel(tareaId, adjuntos = []) {
  const emptyHTML = `<p class="text-muted small text-center py-2"><i class="bi bi-paperclip me-1"></i>Sin adjuntos.</p>`

  const listHTML = adjuntos.length === 0 ? emptyHTML : adjuntos.map((a) => `
    <div class="task-attachment-item d-flex align-items-center gap-3 p-2 rounded border mb-2" data-adj-id="${escapeHTML(a.id)}" data-storage-path="${escapeHTML(a.storage_path)}">
      <div class="flex-shrink-0 text-muted" style="font-size:1.4rem;">
        <i class="bi ${getMimeIcon(a.mime_type)}"></i>
      </div>
      <div class="flex-grow-1 overflow-hidden">
        <div class="fw-semibold small text-truncate" title="${escapeHTML(a.nombre)}">${escapeHTML(a.nombre)}</div>
        <div class="text-muted" style="font-size:0.75rem;">
          ${a.subido_por_nombre ? `<span><i class="bi bi-person me-1"></i>${escapeHTML(a.subido_por_nombre)}</span>` : ''}
          ${a.size_bytes ? `<span class="ms-2">${formatBytes(a.size_bytes)}</span>` : ''}
          ${a.created_at ? `<span class="ms-2"><i class="bi bi-calendar3 me-1"></i>${formatDate(a.created_at)}</span>` : ''}
        </div>
      </div>
      <div class="flex-shrink-0">
        <button class="btn btn-sm btn-outline-secondary task-attachment-download" type="button"
          data-storage-path="${escapeHTML(a.storage_path)}"
          title="Descargar ${escapeHTML(a.nombre)}">
          <i class="bi bi-download"></i>
        </button>
      </div>
    </div>
  `).join('')

  return `
    <div class="task-attachments-panel" data-tarea-id="${escapeHTML(tareaId)}">
      <h6 class="mb-3">
        <i class="bi bi-paperclip me-1 text-primary"></i>Adjuntos
        <span class="badge bg-secondary ms-1">${adjuntos.length}</span>
      </h6>
      <div class="task-attachments-list">
        ${listHTML}
      </div>
    </div>
  `
}

/**
 * Wires download buttons inside a container to call urlFirmada and open the signed URL.
 * Must be called AFTER the panel HTML is injected into the DOM.
 *
 * @param {HTMLElement} container — element containing the rendered panel
 * @param {(storagePath: string) => Promise<string>} urlFirmadaFn — API function
 * @param {AbortSignal} [signal]
 */
export function wireTaskAttachmentsPanel(container, urlFirmadaFn, signal) {
  container.querySelectorAll('.task-attachment-download').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const path = btn.dataset.storagePath
      if (!path) return
      try {
        btn.disabled = true
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>'
        const url = await urlFirmadaFn(path)
        window.open(url, '_blank', 'noopener,noreferrer')
      } catch (err) {
        console.error('[taskAttachmentsPanel] Error al obtener URL firmada:', err.message)
      } finally {
        btn.disabled = false
        btn.innerHTML = '<i class="bi bi-download"></i>'
      }
    }, signal ? { signal } : {})
  })
}
