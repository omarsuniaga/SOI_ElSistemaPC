import { router } from '../../core/router/router.js'

/**
 * Registra la ruta del panel de la cartelera (pantalla informativa del vestíbulo).
 * Módulo AISLADO: solo signage_pantallas / signage_media / bucket 'signage'.
 */
export function registerRoutesSignageAdmin() {
  const renderStudio = async (container, params) => {
    try {
      container.innerHTML = '<div class="p-4 text-center text-muted"><i class="bi bi-tv fs-3 d-block mb-2"></i>Cargando el Estudio de la cartelera…</div>'
      const { renderSignageStudioView } = await import('./views/signageStudioView.js')
      await renderSignageStudioView(container, params)
    } catch (error) {
      console.error('[cartelera] Error:', error)
      container.innerHTML = `<div class="pm-placeholder p-4 text-center text-muted">
        <i class="bi bi-exclamation-triangle fs-3 d-block mb-2"></i>
        <p>Error al cargar el panel de la cartelera: ${error.message}</p>
      </div>`
    }
  }

  const renderSlideEditor = async (container, params = {}) => {
    try {
      container.innerHTML = '<div class="p-4 text-center text-muted"><i class="bi bi-easel2 fs-3 d-block mb-2"></i>Cargando editor de diapositivas…</div>'
      const { renderSignageSlideEditorView } = await import('./views/signageSlideEditorView.js')
      await renderSignageSlideEditorView(container, params)
    } catch (error) {
      console.error('[cartelera/diapositiva] Error:', error)
      container.innerHTML = `<div class="pm-placeholder p-4 text-center text-muted">
        <i class="bi bi-exclamation-triangle fs-3 d-block mb-2"></i>
        <p>Error al cargar el editor de diapositivas: ${error.message}</p>
      </div>`
    }
  }

  // Rutas canónicas semánticas
  router.register('cartelera', renderStudio)
  router.register('cartelera/diapositiva', renderSlideEditor)
  router.register('cartelera/diapositiva/:id', renderSlideEditor)
  router.register('cartelera-diapositiva', renderSlideEditor)
  router.register('cartelera-diapositiva/:id', renderSlideEditor)

  // Alias retrocompatibles
  router.register('signage-pantalla', renderStudio)
  router.register('signage-slide', renderSlideEditor)
  router.register('signage-slide/:id', renderSlideEditor)
  router.register('signage-diapositiva', renderSlideEditor)
  router.register('signage-diapositiva/:id', renderSlideEditor)
}

