/**
 * Componente: structureModal
 * Muestra original vs DSL estructurado lado a lado para que el usuario acepte o rechace.
 * Similar a improveTextModal pero para la conversión a DSL.
 *
 * @param {HTMLElement} parentContainer
 * @param {{ onAccept: Function }} options
 */
export function createStructureModal(parentContainer, { onAccept }) {
  let modalEl = document.getElementById('pm-structure-modal')

  if (!modalEl) {
    modalEl = document.createElement('div')
    modalEl.id = 'pm-structure-modal'
    modalEl.className = 'pm-modal-overlay'
    modalEl.innerHTML = `
      <div class="pm-modal-content pm-structure-content">
        <div class="pm-modal-header" style="background: rgba(99, 102, 241, 0.1);">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--pm-primary);">🚀 Estructurar con IA</h3>
          <button class="pm-modal-close" id="pm-structure-close">&times;</button>
        </div>
        <div class="pm-modal-body pm-structure-body">
          <div class="pm-structure-panels">
            <div class="pm-structure-panel">
              <h4 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: var(--pm-text-muted);">Original</h4>
              <div id="pm-structure-original" class="pm-structure-text" style="background: var(--pm-surface-2); border: 1px solid var(--pm-border); border-radius: var(--pm-radius-sm); padding: 0.75rem; min-height: 150px; overflow-y: auto; color: var(--pm-text);"></div>
            </div>
            <div class="pm-structure-panel">
              <h4 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: var(--pm-text-muted);">Estructura DSL</h4>
              <div id="pm-structure-dsl" class="pm-structure-text" contenteditable="true" style="background: var(--pm-surface); border: 1.5px solid var(--pm-primary); border-radius: var(--pm-radius-sm); padding: 0.75rem; min-height: 150px; overflow-y: auto; color: var(--pm-text); font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.9rem;"></div>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
            <button class="pm-btn" id="pm-structure-reject" style="flex: 1; background: var(--pm-surface); border: 1px solid var(--pm-border);">Descartar</button>
            <button class="pm-btn pm-btn-primary" id="pm-structure-accept" style="flex: 1;">Insertar</button>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(modalEl)

    // Add styles if not present
    if (!document.getElementById('pm-structure-modal-styles')) {
      const style = document.createElement('style')
      style.id = 'pm-structure-modal-styles'
      style.textContent = `
        .pm-structure-content {
          max-width: 900px;
          width: 90vw;
        }

        .pm-structure-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .pm-structure-panels {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .pm-structure-panel {
          display: flex;
          flex-direction: column;
        }

        .pm-structure-text {
          font-size: 0.9rem;
          line-height: 1.5;
          word-wrap: break-word;
          white-space: pre-wrap;
          font-family: inherit;
        }

        @media (max-width: 768px) {
          .pm-structure-panels {
            grid-template-columns: 1fr;
          }
        }
      `
      document.head.appendChild(style)
    }
  }

  const originalEl = modalEl.querySelector('#pm-structure-original')
  const dslEl = modalEl.querySelector('#pm-structure-dsl')

  function open({ original, dsl }) {
    originalEl.textContent = original
    dslEl.textContent = dsl
    modalEl.classList.add('open')
  }

  function close() {
    modalEl.classList.remove('open')
  }

  modalEl.querySelector('#pm-structure-close').onclick = close
  modalEl.querySelector('#pm-structure-reject').onclick = close

  modalEl.querySelector('#pm-structure-accept').onclick = () => {
    if (onAccept) {
      onAccept(dslEl.textContent)
    }
    close()
  }

  return { open, close }
}
