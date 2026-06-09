import { router } from '../../core/router/router.js'
import { renderGestionUsuariosView } from './views/gestionUsuariosView.js'

/**
 * Registra la ruta de Gestión de Usuarios (creación de admins/maestros por un admin).
 */
export function registerRoutesAdminUsuarios() {
  router.register('gestion-usuarios', async (container) => {
    try {
      await renderGestionUsuariosView(container)
    } catch (error) {
      console.error('[gestion-usuarios] Error al renderizar la vista:', error)
      container.innerHTML = `
        <div class="pm-placeholder">
          <i class="bi bi-exclamation-triangle"></i>
          <p>Error al cargar la gestión de usuarios: ${error.message}</p>
        </div>
      `
    }
  })
}
