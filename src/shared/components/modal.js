import { Modal, Toast } from 'bootstrap';

/**
 * Clase profesional para manejar modales de Bootstrap dinámicamente.
 * Evita contaminar el DOM con HTML estático y maneja el ciclo de vida (creación/destrucción).
 */
export class ModalManager {
  static createModal({ id = 'dynamicModal', title, body, footer, size = '' }) {
    // Eliminar modal previo si existe
    const existing = document.getElementById(id);
    if (existing) {
      existing.remove();
    }

    const modalHTML = `
      <div class="modal fade" id="${id}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog ${size}">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${title}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              ${body}
            </div>
            ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modalElement = document.getElementById(id);

    // Auto-destrucción al cerrar para mantener el DOM limpio
    modalElement.addEventListener('hidden.bs.modal', () => {
      modalElement.remove();
    });

    return {
      element: modalElement,
      instance: new Modal(modalElement, { backdrop: 'static' })
    };
  }

  static confirmDelete({ title = 'Confirmar Eliminación', message, itemName, onConfirm }) {
    const body = `
      <div class="text-center">
        <i class="bi bi-exclamation-triangle text-danger" style="font-size: 3rem;"></i>
        <p class="mt-3">${message}</p>
        <p class="fw-bold mb-0">${itemName}</p>
        <p class="text-danger small mt-2">Esta acción no se puede deshacer.</p>
      </div>
    `;

    const footer = `
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
      <button type="button" class="btn btn-danger" id="btnDynamicConfirm">Eliminar</button>
    `;

    const modal = this.createModal({ id: 'modalDeleteDynamic', title, body, footer });
    
    document.getElementById('btnDynamicConfirm').addEventListener('click', async (e) => {
      const btn = e.target;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Eliminando...';
      
      try {
        await onConfirm();
        modal.instance.hide();
      } catch (error) {
        btn.disabled = false;
        btn.innerHTML = 'Eliminar';
        this.showToast(error.message || 'Error al eliminar', 'error');
      }
    });

    modal.instance.show();
  }

  static showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container position-fixed top-0 end-0 p-3';
      container.style.zIndex = '1055';
      document.body.appendChild(container);
    }

    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-info';
    const iconClass = type === 'success' ? 'bi-check-circle' : type === 'error' ? 'bi-exclamation-circle' : 'bi-info-circle';

    const toastHTML = `
      <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header ${bgClass} text-white">
          <i class="bi ${iconClass} me-2"></i>
          <strong class="me-auto">${type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : 'Información'}</strong>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
          ${this.escapeHTML(message)}
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = document.getElementById(toastId);
    
    const toastInstance = new Toast(toastElement, { autohide: true, delay: 3000 });
    toastInstance.show();

    toastElement.addEventListener('hidden.bs.toast', () => {
      toastElement.remove();
    });
  }

  static escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
  }
}
