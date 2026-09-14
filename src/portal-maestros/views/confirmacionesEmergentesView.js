import { renderActividadEmergenteBandeja } from '../../shared/components/ActividadEmergenteBandeja.js'

/**
 * View for Portal Maestros: Institutional Activity Confirmations
 * Route: confirmaciones-emergentes
 *
 * @param {HTMLElement} container - DOM element to render the view into
 * @param {Object} options
 * @param {string} options.maestroId - Current logged-in maestro UUID
 * @param {Object} [options.router] - SPA router instance
 */
export function renderConfirmacionesEmergentesView(container, { maestroId, router } = {}) {
  const urlParams = new URLSearchParams(
    window.location.search || (window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '')
  )
  const deepLinkActividadId = urlParams.get('actividad_id')

  return renderActividadEmergenteBandeja(container, {
    maestroId,
    deepLinkActividadId,
    onConfirm: () => {
      // Confirmation registered callback
    }
  })
}
