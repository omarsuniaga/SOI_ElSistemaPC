/**
 * ReportViewerModal.js
 *
 * Visor interactivo en HTML para reportes e informes del Portal de Maestros.
 * Muestra el documento renderizado en HTML dentro de un modal seguro y aislado (iframe),
 * con controles para imprimir/guardar en PDF, descargar HTML o cerrar.
 */

import { downloadReport } from '../services/reportTemplates.js'

let _activeModal = null

/**
 * Inyecta los estilos del visor de reportes una sola vez en el documento.
 */
function _injectStyles() {
  if (document.getElementById('pm-report-viewer-styles')) return

  const style = document.createElement('style')
  style.id = 'pm-report-viewer-styles'
  style.textContent = `
    .pm-report-overlay {
      position: fixed;
      inset: 0;
      z-index: 2100;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      animation: pmReportFadeIn 0.25s ease-out forwards;
    }

    .pm-report-dialog {
      width: min(96vw, 1040px);
      height: min(94vh, 920px);
      display: flex;
      flex-direction: column;
      background: var(--pm-surface, #ffffff);
      color: var(--pm-text, #0f172a);
      border: 1px solid var(--pm-border, rgba(255, 255, 255, 0.12));
      border-radius: 20px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      overflow: hidden;
      animation: pmReportScaleIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .pm-report-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.85rem 1.25rem;
      background: var(--pm-surface, #ffffff);
      border-bottom: 1px solid var(--pm-border, #e2e8f0);
      flex-shrink: 0;
    }

    .pm-report-header-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-width: 0;
    }

    .pm-report-icon-badge {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: rgba(14, 165, 233, 0.12);
      color: #0284c7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .pm-report-titles {
      min-width: 0;
    }

    .pm-report-title {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--pm-text, #0f172a);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .pm-report-subtitle {
      margin: 2px 0 0;
      font-size: 0.75rem;
      color: var(--pm-muted, #64748b);
      font-weight: 500;
    }

    .pm-report-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .pm-report-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.5rem 0.85rem;
      font-size: 0.85rem;
      font-weight: 600;
      border-radius: 10px;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.18s ease;
      white-space: nowrap;
      text-decoration: none;
    }

    .pm-report-btn--primary {
      background: #0284c7;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25);
    }
    .pm-report-btn--primary:hover {
      background: #0369a1;
      transform: translateY(-1px);
    }

    .pm-report-btn--secondary {
      background: var(--pm-surface-2, #f1f5f9);
      color: var(--pm-text, #334155);
      border-color: var(--pm-border, #cbd5e1);
    }
    .pm-report-btn--secondary:hover {
      background: rgba(14, 165, 233, 0.08);
      border-color: #0284c7;
      color: #0284c7;
    }

    .pm-report-btn--close {
      background: transparent;
      color: var(--pm-muted, #64748b);
      padding: 0.5rem;
      min-width: 36px;
      min-height: 36px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid transparent;
    }
    .pm-report-btn--close:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.2);
    }

    .pm-report-body {
      flex: 1;
      background: #f8fafc;
      overflow: hidden;
      position: relative;
    }

    .pm-report-iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
      background: #f8fafc;
    }

    @keyframes pmReportFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes pmReportScaleIn {
      from {
        opacity: 0;
        transform: scale(0.96) translateY(8px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    @media (max-width: 640px) {
      .pm-report-overlay {
        padding: 0;
      }
      .pm-report-dialog {
        width: 100vw;
        height: 100dvh;
        border-radius: 0;
        border: none;
      }
      .pm-report-header {
        padding: 0.75rem 1rem;
      }
      .pm-report-btn span {
        display: none;
      }
      .pm-report-btn {
        padding: 0.5rem 0.65rem;
      }
    }
  `
  document.head.appendChild(style)
}

/**
 * Muestra el modal visor de reportes con el HTML generado.
 *
 * @param {Object} params
 * @param {string} params.html      — Documento HTML completo generado para el reporte
 * @param {string} [params.title]   — Título descriptivo para el encabezado del modal
 * @param {string} [params.filename]— Nombre base de archivo para descargas
 */
export function showReportViewerModal({ html, title = 'Informe Institucional', filename = 'reporte' }) {
  closeReportViewerModal()
  _injectStyles()

  const overlay = document.createElement('div')
  overlay.className = 'pm-report-overlay'
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-modal', 'true')
  overlay.setAttribute('aria-label', title)

  overlay.innerHTML = `
    <div class="pm-report-dialog">
      <header class="pm-report-header">
        <div class="pm-report-header-info">
          <div class="pm-report-icon-badge" aria-hidden="true">
            <i class="bi bi-file-earmark-text"></i>
          </div>
          <div class="pm-report-titles">
            <h3 class="pm-report-title" title="${title}">${title}</h3>
            <p class="pm-report-subtitle">Vista previa interactiva · Documento Institucional</p>
          </div>
        </div>

        <div class="pm-report-actions">
          <button type="button" class="pm-report-btn pm-report-btn--primary" id="btn-pm-modal-pdf" title="Descargar o imprimir documento en formato PDF">
            <i class="bi bi-file-earmark-pdf"></i>
            <span>Descargar / Imprimir PDF</span>
          </button>
          <button type="button" class="pm-report-btn pm-report-btn--secondary" id="btn-pm-modal-html" title="Descargar archivo HTML">
            <i class="bi bi-download"></i>
            <span>Descargar HTML</span>
          </button>
          <button type="button" class="pm-report-btn pm-report-btn--close" id="btn-pm-modal-close" aria-label="Cerrar visor">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </header>

      <div class="pm-report-body">
        <iframe class="pm-report-iframe" title="${title}"></iframe>
      </div>
    </div>
  `

  document.body.appendChild(overlay)
  _activeModal = overlay

  const iframe = overlay.querySelector('.pm-report-iframe')
  if (iframe) {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document
      doc.open()
      doc.write(html)
      doc.close()
    } catch (_) {
      iframe.srcdoc = html
    }
  }

  // Event handlers
  const closeBtn = overlay.querySelector('#btn-pm-modal-close')
  const pdfBtn = overlay.querySelector('#btn-pm-modal-pdf')
  const htmlBtn = overlay.querySelector('#btn-pm-modal-html')

  closeBtn?.addEventListener('click', closeReportViewerModal)

  pdfBtn?.addEventListener('click', () => {
    try {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.focus()
        iframe.contentWindow.print()
      } else {
        window.print()
      }
    } catch (e) {
      console.warn('[ReportViewerModal] Error al invocar print en iframe:', e)
      const w = window.open('', '_blank')
      if (w) {
        w.document.write(html)
        w.document.close()
        w.focus()
        w.print()
      }
    }
  })

  htmlBtn?.addEventListener('click', () => {
    downloadReport(html, filename)
  })

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeReportViewerModal()
    }
  })

  // Close on Escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeReportViewerModal()
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  overlay._cleanupKeyDown = () => window.removeEventListener('keydown', handleKeyDown)

  return overlay
}

/**
 * Cierra el modal visor de reportes activo si existe.
 */
export function closeReportViewerModal() {
  if (_activeModal) {
    _activeModal._cleanupKeyDown?.()
    _activeModal.remove()
    _activeModal = null
  }
}
