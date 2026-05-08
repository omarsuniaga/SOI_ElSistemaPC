/**
 * AppToast - Sistema de notificaciones global
 * Basado en Bootstrap 5 Toasts con esteroides premium.
 */

const CONTAINER_ID = 'app-toast-container'

function ensureContainer() {
  let container = document.getElementById(CONTAINER_ID)
  if (!container) {
    container = document.createElement('div')
    container.id = CONTAINER_ID
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3'
    container.style.zIndex = '1090'
    document.body.appendChild(container)
  }
  return container
}

/**
 * Muestra una notificación tipo Toast
 * @param {string} message - El mensaje a mostrar
 * @param {'success'|'error'|'info'|'warning'} type - El tipo de notificación
 */
export const AppToast = {
  show(message, type = 'info') {
    const container = ensureContainer()
    const id = `toast-${Date.now()}`
    
    const config = {
      success: { bg: 'bg-success', icon: 'bi-check-circle-fill', title: 'Éxito' },
      error:   { bg: 'bg-danger',  icon: 'bi-exclamation-octagon-fill', title: 'Error' },
      warning: { bg: 'bg-warning', icon: 'bi-exclamation-triangle-fill', title: 'Atención' },
      info:    { bg: 'bg-info',    icon: 'bi-info-circle-fill', title: 'Info' }
    }
    
    const { bg, icon, title } = config[type] || config.info

    const html = `
      <div id="${id}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header ${bg} text-white border-0">
          <i class="bi ${icon} me-2"></i>
          <strong class="me-auto">${title}</strong>
          <small class="text-white-50">ahora</small>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body py-3">
          ${message}
        </div>
      </div>
    `

    const wrapper = document.createElement('div')
    wrapper.innerHTML = html
    const toastEl = wrapper.firstElementChild
    container.appendChild(toastEl)

    // Inicializar con Bootstrap
    const bootstrapInstance = window.bootstrap || (typeof bootstrap !== 'undefined' ? bootstrap : null)
    
    if (!bootstrapInstance) {
      console.warn('Bootstrap JS no detectado. El toast se mostrará pero no se auto-ocultará correctamente.')
      // Fallback: auto-ocultar manualmente si no hay bootstrap
      setTimeout(() => {
        toastEl.classList.add('hide')
        setTimeout(() => toastEl.remove(), 500)
      }, 4000)
      return
    }

    const bsToast = new bootstrapInstance.Toast(toastEl, { autohide: true, delay: 4000 })
    bsToast.show()

    // Limpiar el DOM después de ocultar
    toastEl.addEventListener('hidden.bs.toast', () => {
      toastEl.remove()
    })
  },

  success(msg) { this.show(msg, 'success') },
  error(msg)   { this.show(msg, 'error') },
  info(msg)    { this.show(msg, 'info') },
  warning(msg) { this.show(msg, 'warning') }
}
