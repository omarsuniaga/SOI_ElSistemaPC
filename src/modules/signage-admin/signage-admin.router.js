import { router } from '../../core/router/router.js'

/**
 * Registra la ruta del panel de la cartelera (pantalla informativa del vestíbulo).
 * Módulo AISLADO: solo signage_pantallas / signage_media / bucket 'signage'.
 */
export function registerRoutesSignageAdmin() {
  router.register('signage-pantalla', async (container, params) => {
    try {
      container.innerHTML = '<div class="p-4 text-center text-muted"><i class="bi bi-tv fs-3 d-block mb-2"></i>Cargando panel de la cartelera…</div>'
      const { renderSignagePantallaView } = await import('./views/signagePantallaView.js')
      await renderSignagePantallaView(container, params)
    } catch (error) {
      console.error('[signage-pantalla] Error:', error)
      container.innerHTML = `<div class="pm-placeholder p-4 text-center text-muted">
        <i class="bi bi-exclamation-triangle fs-3 d-block mb-2"></i>
        <p>Error al cargar el panel de la cartelera: ${error.message}</p>
      </div>`
    }
  })
}
