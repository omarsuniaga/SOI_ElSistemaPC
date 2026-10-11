import { escHTML } from '../utils/portalUtils.js'

let _activeClose = null

/**
 * Muestra un modal de previsualización (lightbox) para fotos o documentos de justificantes.
 * @param {Object} options
 * @param {string} options.url - URL o base64 de la imagen/archivo
 * @param {string} [options.alumnoNombre] - Nombre del alumno
 * @param {string} [options.motivo] - Motivo de la justificación
 * @returns {HTMLElement|null} El elemento modal creado
 */
export function showEvidenciaPreviewModal({ url, alumnoNombre = '', motivo = '' } = {}) {
  if (!url) return null

  // Cerrar/remover si ya existe uno abierto
  if (typeof _activeClose === 'function') {
    _activeClose()
  } else {
    document.getElementById('pm-evidencia-preview-modal')?.remove()
  }

  const isPdf = typeof url === 'string' && (url.toLowerCase().endsWith('.pdf') || url.startsWith('data:application/pdf'))

  const modalEl = document.createElement('div')
  modalEl.id = 'pm-evidencia-preview-modal'
  modalEl.className = 'pm-evidencia-modal-overlay'
  modalEl.setAttribute('role', 'dialog')
  modalEl.setAttribute('aria-modal', 'true')
  modalEl.setAttribute('aria-label', 'Comprobante de Justificación')

  modalEl.innerHTML = `
    <div class="pm-evidencia-backdrop"></div>
    <div class="pm-evidencia-container">
      <div class="pm-evidencia-header">
        <div class="pm-evidencia-info">
          <span class="pm-evidencia-title"><i class="bi bi-image"></i> Comprobante de Justificación</span>
          ${alumnoNombre ? `<span class="pm-evidencia-subtitle"><strong>${escHTML(alumnoNombre)}</strong>${motivo ? ` — ${escHTML(motivo)}` : ''}</span>` : ''}
        </div>
        <div class="pm-evidencia-header-actions">
          <a href="${escHTML(url)}" target="_blank" rel="noopener noreferrer" class="pm-evidencia-btn-link" title="Abrir en pestaña nueva">
            <i class="bi bi-box-arrow-up-right"></i>
          </a>
          <button type="button" class="pm-evidencia-close-btn" id="pm-evidencia-close" aria-label="Cerrar">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
      <div class="pm-evidencia-body">
        ${
          isPdf
            ? `<div class="pm-evidencia-pdf">
                 <i class="bi bi-file-earmark-pdf pm-evidencia-pdf-icon"></i>
                 <p class="pm-evidencia-pdf-text">Documento PDF adjunto</p>
                 <a href="${escHTML(url)}" target="_blank" rel="noopener noreferrer" class="pm-evidencia-btn-primary">
                   <i class="bi bi-box-arrow-up-right"></i> Ver documento PDF
                 </a>
               </div>`
            : `<img src="${escHTML(url)}" alt="Comprobante de justificante de ${escHTML(alumnoNombre)}" class="pm-evidencia-img" />`
        }
      </div>
    </div>
  `

  document.body.appendChild(modalEl)

  // Inyectar estilos una sola vez
  if (!document.getElementById('pm-evidencia-styles')) {
    const style = document.createElement('style')
    style.id = 'pm-evidencia-styles'
    style.textContent = `
      .pm-evidencia-modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 10050;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        animation: pmEvidenciaFadeIn 0.2s ease;
      }
      .pm-evidencia-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(15, 23, 42, 0.82);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      .pm-evidencia-container {
        position: relative;
        z-index: 1;
        background: var(--pm-surface, #ffffff);
        color: var(--pm-text, #1e293b);
        border: 1px solid var(--pm-border, rgba(0, 0, 0, 0.1));
        border-radius: 16px;
        max-width: 92vw;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
        animation: pmEvidenciaScaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .pm-evidencia-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.85rem 1.15rem;
        border-bottom: 1px solid var(--pm-border, #e2e8f0);
        background: var(--pm-surface-2, #f8fafc);
      }
      .pm-evidencia-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .pm-evidencia-title {
        font-size: 0.875rem;
        font-weight: 700;
        color: var(--pm-primary, #0284c7);
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .pm-evidencia-subtitle {
        font-size: 0.775rem;
        color: var(--pm-text-muted, #64748b);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 60vw;
      }
      .pm-evidencia-header-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-shrink: 0;
      }
      .pm-evidencia-btn-link, .pm-evidencia-close-btn {
        background: transparent;
        border: none;
        width: 34px;
        height: 34px;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--pm-text-muted, #64748b);
        cursor: pointer;
        transition: all 0.15s ease;
        text-decoration: none;
        font-size: 1rem;
      }
      .pm-evidencia-btn-link:hover, .pm-evidencia-close-btn:hover {
        background: var(--pm-surface-3, rgba(0, 0, 0, 0.08));
        color: var(--pm-text, #0f172a);
      }
      .pm-evidencia-body {
        padding: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: auto;
        background: rgba(0, 0, 0, 0.04);
        min-height: 200px;
      }
      .pm-evidencia-img {
        max-width: 100%;
        max-height: 75vh;
        object-fit: contain;
        border-radius: 10px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }
      .pm-evidencia-pdf {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 2.5rem 2rem;
        text-align: center;
      }
      .pm-evidencia-pdf-icon {
        font-size: 3.5rem;
        color: #ef4444;
      }
      .pm-evidencia-pdf-text {
        margin: 0;
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--pm-text, #1e293b);
      }
      .pm-evidencia-btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--pm-primary, #0284c7);
        color: white;
        padding: 8px 18px;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 600;
        text-decoration: none;
        transition: opacity 0.15s ease;
      }
      .pm-evidencia-btn-primary:hover {
        opacity: 0.9;
        color: white;
      }
      [data-bs-theme='dark'] .pm-evidencia-container,
      [data-portal-theme='dark'] .pm-evidencia-container {
        background: var(--pm-surface, #1e293b);
        color: var(--pm-text, #f1f5f9);
        border-color: rgba(255, 255, 255, 0.12);
      }
      [data-bs-theme='dark'] .pm-evidencia-header,
      [data-portal-theme='dark'] .pm-evidencia-header {
        background: var(--pm-surface-2, #0f172a);
        border-bottom-color: rgba(255, 255, 255, 0.08);
      }
      [data-bs-theme='dark'] .pm-evidencia-btn-link:hover,
      [data-bs-theme='dark'] .pm-evidencia-close-btn:hover,
      [data-portal-theme='dark'] .pm-evidencia-btn-link:hover,
      [data-portal-theme='dark'] .pm-evidencia-close-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }
      @keyframes pmEvidenciaFadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes pmEvidenciaScaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    `
    document.head.appendChild(style)
  }

  function close() {
    window.removeEventListener('keydown', handleKey)
    modalEl.remove()
    if (_activeClose === close) {
      _activeClose = null
    }
  }

  _activeClose = close

  function handleKey(e) {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      if (typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation()
      }
      close()
    }
  }

  modalEl.querySelector('.pm-evidencia-backdrop')?.addEventListener('click', close)
  modalEl.querySelector('#pm-evidencia-close')?.addEventListener('click', close)
  window.addEventListener('keydown', handleKey)

  return modalEl
}
