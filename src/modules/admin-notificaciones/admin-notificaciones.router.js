import { router } from '../../core/router/router.js'
import { renderAdminNotificacionesView } from './views/adminNotificacionesView.js'

/**
 * Registra las rutas del módulo de Notificaciones del Administrador (Centro de Actividad)
 */
export function registerRoutesAdminNotificaciones() {
  router.register('admin-notificaciones', (container) => {
    try {
      renderAdminNotificacionesView(container)
    } catch (error) {
      console.error('[admin-notificaciones] Error al renderizar la vista:', error)
      container.innerHTML = `
        <div class="pm-placeholder">
          <i class="bi bi-exclamation-triangle"></i>
          <p>Error al cargar el Centro de Actividad: ${error.message}</p>
        </div>
      `
    }
  })
}
