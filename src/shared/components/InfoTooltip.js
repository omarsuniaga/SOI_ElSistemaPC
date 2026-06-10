export function InfoTooltip(term, options = {}) {
  const { placement = 'top', className = '' } = options

  return `
    <span
      class="info-tooltip ${className}"
      data-term="${term}"
      data-placement="${placement}"
      title="Click para más info"
      role="button"
      tabindex="0"
    >
      <i class="bi bi-info-circle-fill"></i>
    </span>
  `
}

export function attachInfoTooltipEvents(container) {
  if (!container) return

  const tooltips = container.querySelectorAll('.info-tooltip')

  tooltips.forEach((tooltip) => {
    const term = tooltip.dataset.term
    if (!term) return

    const handleClick = (e) => {
      e.stopPropagation()
      showInfoModal(term)
    }

    const handleKeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        showInfoModal(term)
      }
    }

    tooltip.addEventListener('click', handleClick)
    tooltip.addEventListener('keydown', handleKeydown)
  })
}

function showInfoModal(term) {
  const { glossary } = require('./metrics-glossary.js')
  const definition = glossary[term]

  if (!definition) return

  // Remover modal anterior si existe
  const existingModal = document.getElementById('infoModalBackdrop')
  if (existingModal) existingModal.remove()

  const backdrop = document.createElement('div')
  backdrop.id = 'infoModalBackdrop'
  backdrop.className = 'info-modal-backdrop'
  backdrop.innerHTML = `
    <div class="info-modal-content">
      <div class="info-modal-header">
        <h5>${escapeHTML(definition.title)}</h5>
        <button class="info-modal-close" aria-label="Cerrar">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="info-modal-body">
        <p>${escapeHTML(definition.description)}</p>
        ${definition.example ? `<p class="text-muted"><small><strong>Ej:</strong> ${escapeHTML(definition.example)}</small></p>` : ''}
      </div>
    </div>
  `

  document.body.appendChild(backdrop)

  const closeBtn = backdrop.querySelector('.info-modal-close')
  closeBtn.addEventListener('click', () => backdrop.remove())
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.remove()
  })
}

function escapeHTML(str) {
  if (typeof str !== 'string') return ''
  return str.replace(/[&<>]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[m])
}

// Estilos inyectados
export function injectInfoTooltipStyles() {
  const styleId = 'info-tooltip-styles'
  if (document.getElementById(styleId)) return

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    .info-tooltip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      margin-left: 0.4rem;
      color: var(--bs-info, #0dcaf0);
      cursor: pointer;
      font-size: 0.9rem;
      vertical-align: middle;
      transition: color 0.2s;
    }

    .info-tooltip:hover {
      color: var(--bs-info-focus, #0ab8e6);
      opacity: 0.8;
    }

    .info-tooltip:focus {
      outline: 2px solid var(--bs-info);
      outline-offset: 2px;
      border-radius: 50%;
    }

    .info-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .info-modal-content {
      background: var(--bs-body-bg);
      border-radius: 0.5rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      width: 90%;
      overflow: hidden;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .info-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid var(--bs-border-color);
      background: var(--bs-secondary-bg);
    }

    .info-modal-header h5 {
      margin: 0;
      font-weight: 600;
      color: var(--bs-body-color);
    }

    .info-modal-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--bs-secondary);
      transition: color 0.2s;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.25rem;
    }

    .info-modal-close:hover {
      color: var(--bs-body-color);
      background: var(--bs-border-color);
    }

    .info-modal-body {
      padding: 1rem;
      font-size: 0.95rem;
      line-height: 1.5;
      color: var(--bs-body-color);
    }

    .info-modal-body p {
      margin-bottom: 0.75rem;
    }

    .info-modal-body p:last-child {
      margin-bottom: 0;
    }
  `
  document.head.appendChild(style)
}
