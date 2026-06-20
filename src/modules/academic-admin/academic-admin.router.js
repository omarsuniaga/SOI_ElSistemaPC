import { router } from '../../core/router/router.js'
import { renderAcademicAdminView } from './views/academicAdminView.js'
import { AcademicDashboardView } from './views/AcademicDashboardView.js'

/**
 * Registra las rutas del módulo de Gestión Académica (Curricular)
 */
export function registerRoutesAcademicAdmin() {
  router.register('gestion-curricular', (container) => {
    renderAcademicAdminView(container)
  })
  
  // Alias sugerido por la tarea
  router.register('planificacion-curricular', (container) => {
    renderAcademicAdminView(container)
  })

  // Torre de Control (Dashboard Analítico)
  router.register('torre-de-control', async (container) => {
    container.innerHTML = '<div class="pm-loading"><div class="pm-spinner"></div></div>'
    try {
      const view = await AcademicDashboardView()
      container.innerHTML = view
    } catch (error) {
      container.innerHTML = `<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar el dashboard: ${error.message}</p></div>`
    }
  })
}
