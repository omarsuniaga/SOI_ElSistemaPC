import { highlightDSL } from '../utils/dslParser.js';

/**
 * Componente: IaReviewModal
 * Permite al maestro revisar y editar la propuesta de la IA antes de insertarla.
 * 
 * @param {HTMLElement} parentContainer 
 * @param {{ onAccept: Function }} options
 */
export function createIaReviewModal(parentContainer, { onAccept }) {
  let modalEl = document.getElementById('pm-ia-review-modal');

  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'pm-ia-review-modal';
    modalEl.className = 'pm-modal-overlay';
    modalEl.innerHTML = `
      <div class="pm-modal-content">
        <div class="pm-modal-header" style="background: rgba(99, 102, 241, 0.1);">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--pm-primary);">✨ Propuesta de la IA</h3>
          <button class="pm-modal-close" id="pm-ia-close">&times;</button>
        </div>
        <div class="pm-modal-body">
          <p style="font-size: 0.8rem; color: var(--pm-text-muted); margin-bottom: 1rem;">
            He estructurado tu información en formato DSL. Puedes editarla antes de confirmar.
          </p>
          
          <div 
            id="pm-ia-result" 
            class="pm-dsl-editable" 
            contenteditable="true" 
            style="border: 1.5px solid var(--pm-primary); border-radius: var(--pm-radius-sm); min-height: 100px; padding: 0.75rem;"
          ></div>

          <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
            <button class="pm-btn" id="pm-ia-reject" style="flex: 1; background: var(--pm-surface); border: 1px solid var(--pm-border);">Descartar</button>
            <button class="pm-btn pm-btn-primary" id="pm-ia-accept" style="flex: 1;">Confirmar e Insertar</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);
  }

  const resultEl = modalEl.querySelector('#pm-ia-result');

  function open(proposal) {
    resultEl.innerHTML = highlightDSL(proposal);
    modalEl.classList.add('open');
  }

  function close() {
    modalEl.classList.remove('open');
  }

  modalEl.querySelector('#pm-ia-close').onclick = close;
  modalEl.querySelector('#pm-ia-reject').onclick = close;

  modalEl.querySelector('#pm-ia-accept').onclick = () => {
    if (onAccept) {
      onAccept(resultEl.innerText);
    }
    close();
  };

  return { open, close };
}
