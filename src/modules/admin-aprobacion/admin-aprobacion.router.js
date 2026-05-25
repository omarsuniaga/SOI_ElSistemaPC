import { router } from '../../core/router/router.js'
import { renderAprobacionView } from './views/aprobacionView.js'
import { renderAusenciasAdminView } from './views/ausenciasAdminView.js'

/**
 * Registra las rutas del módulo de Aprobación de Maestros y Gestión de Ausencias para el Administrador
 */
export function registerRoutesAdminAprobacion() {
  router.register('admin-aprobacion', async (container) => {
    try {
      await renderAprobacionView(container)
    } catch (error) {
      console.error('[admin-aprobacion] Error al renderizar la vista de aprobaciones:', error)
      container.innerHTML = `
        <div class="pm-placeholder">
          <i class="bi bi-exclamation-triangle"></i>
          <p>Error al cargar la aprobación de maestros: ${error.message}</p>
        </div>
      `
    }
  })

  router.register('admin-ausencias', async (container) => {
    try {
      await renderAusenciasAdminView(container)
    } catch (error) {
      console.error('[admin-aprobacion] Error al renderizar la vista de ausencias:', error)
      container.innerHTML = `
        <div class="pm-placeholder">
          <i class="bi bi-exclamation-triangle"></i>
          <p>Error al cargar la gestión de ausencias: ${error.message}</p>
        </div>
      `
    }
  })
}
