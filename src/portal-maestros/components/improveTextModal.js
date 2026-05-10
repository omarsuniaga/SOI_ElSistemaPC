/**
 * Componente: improveTextModal
 * Muestra original vs mejorado lado a lado para que el usuario acepte o rechace.
 *
 * @param {HTMLElement} parentContainer
 * @param {{ onAccept: Function }} options
 */
export function createImproveTextModal(parentContainer, { onAccept }) {
  let modalEl = document.getElementById('pm-improve-text-modal')

  if (!modalEl) {
    modalEl = document.createElement('div')
    modalEl.id = 'pm-improve-text-modal'
    modalEl.className = 'pm-modal-overlay'
    modalEl.innerHTML = `
      <div class="pm-modal-content pm-improve-content">
        <div class="pm-modal-header" style="background: rgba(99, 102, 241, 0.1);">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--pm-primary);">✨ Mejorar Texto</h3>
          <button class="pm-modal-close" id="pm-improve-close">&times;</button>
        </div>
        <div class="pm-modal-body pm-improve-body">
          <div class="pm-improve-panels">
            <div class="pm-improve-panel">
              <h4 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: var(--pm-text-muted);">Original</h4>
              <div id="pm-improve-original" class="pm-improve-text" style="background: var(--pm-surface-2); border: 1px solid var(--pm-border); border-radius: var(--pm-radius-sm); padding: 0.75rem; min-height: 150px; overflow-y: auto; color: var(--pm-text);"></div>
            </div>
            <div class="pm-improve-panel">
              <h4 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: var(--pm-text-muted);">Mejorado</h4>
              <div id="pm-improve-text" class="pm-improve-text" contenteditable="true" style="background: var(--pm-surface); border: 1.5px solid var(--pm-primary); border-radius: var(--pm-radius-sm); padding: 0.75rem; min-height: 150px; overflow-y: auto; color: var(--pm-text);"></div>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
            <button class="pm-btn" id="pm-improve-reject" style="flex: 1; background: var(--pm-surface); border: 1px solid var(--pm-border);">Descartar</button>
            <button class="pm-btn pm-btn-primary" id="pm-improve-accept" style="flex: 1;">Aceptar</button>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(modalEl)

    // Add styles if not present
    if (!document.getElementById('pm-improve-modal-styles')) {
      const style = document.createElement('style')
      style.id = 'pm-improve-modal-styles'
      style.textContent = `
        .pm-improve-content {
          max-width: 900px;
          width: 90vw;
        }

        .pm-improve-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .pm-improve-panels {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .pm-improve-panel {
          display: flex;
          flex-direction: column;
        }

        .pm-improve-text {
          font-size: 0.9rem;
          line-height: 1.5;
          word-wrap: break-word;
          white-space: pre-wrap;
          font-family: inherit;
        }

        @media (max-width: 768px) {
          .pm-improve-panels {
            grid-template-columns: 1fr;
          }
        }
      `
      document.head.appendChild(style)
    }
  }

  const originalEl = modalEl.querySelector('#pm-improve-original')
  const improvedEl = modalEl.querySelector('#pm-improve-text')

  function open({ original, improved }) {
    originalEl.textContent = original
    improvedEl.textContent = improved
    modalEl.classList.add('open')
  }

  function close() {
    modalEl.classList.remove('open')
  }

  modalEl.querySelector('#pm-improve-close').onclick = close
  modalEl.querySelector('#pm-improve-reject').onclick = close

  modalEl.querySelector('#pm-improve-accept').onclick = () => {
    if (onAccept) {
      onAccept(improvedEl.textContent)
    }
    close()
  }

  return { open, close }
}
