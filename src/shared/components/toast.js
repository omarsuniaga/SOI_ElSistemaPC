/**
 * Shared Toast Notification Component
 * Muestra notificaciones tipo toast usando Bootstrap
 */
import { Toast } from 'bootstrap'

export class ToastManager {
  static container = null

  /**
   * Obtiene o crea el contenedor de toasts
   */
  static getContainer() {
    if (!this.container) {
      this.container = document.getElementById('toastContainer')
      if (!this.container) {
        this.container = document.createElement('div')
        this.container.id = 'toastContainer'
        this.container.className = 'toast-container position-fixed top-0 end-0 p-3'
        this.container.style.zIndex = '1055'
        document.body.appendChild(this.container)
      }
    }
    return this.container
  }

  /**
   * Muestra un toast
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - 'success' | 'error' | 'info' | 'warning'
   * @param {number} delay - Duración en ms (default: 3000)
   */
  static show(message, type = 'info', delay = 3000) {
    const container = this.getContainer()
    const id = 'toast-' + Date.now()
    const config = this.getConfig(type)

    const html = `
      <div id="${id}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header ${config.bg} text-white">
          <i class="bi ${config.icon} me-2"></i>
          <strong class="me-auto">${config.title}</strong>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">${this.escape(message)}</div>
      </div>
    `

    const temp = document.createElement('div')
    temp.innerHTML = html
    const el = temp.firstElementChild
    container.appendChild(el)

    const toast = new Toast(el, { autohide: true, delay })
    toast.show()

    el.addEventListener('hidden.bs.toast', () => el.remove())
  }

  /**
   * Atajos por tipo
   */
  static success(message, delay) { this.show(message, 'success', delay) }
  static error(message, delay) { this.show(message, 'error', delay) }
  static info(message, delay) { this.show(message, 'info', delay) }
  static warning(message, delay) { this.show(message, 'warning', delay) }

  static getConfig(type) {
    const configs = {
      success: { bg: 'bg-success', icon: 'bi-check-circle', title: 'Éxito' },
      error:   { bg: 'bg-danger',  icon: 'bi-exclamation-circle', title: 'Error' },
      info:    { bg: 'bg-info',    icon: 'bi-info-circle', title: 'Información' },
      warning: { bg: 'bg-warning', icon: 'bi-exclamation-triangle', title: 'Advertencia' },
    }
    return configs[type] || configs.info
  }

  static escape(str) {
    if (!str) return ''
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]))
  }
}
