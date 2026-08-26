import { router } from '../../core/router/router.js'

export function registerRoutesHorarioGeneral() {
  router.register('horario-general', async (container) => {
    try {
      container.innerHTML = `<div id="horario-general-container"></div>`
      const { HorarioGeneralWidget } = await import('./views/horarioGeneralView.js')
      const widget = new HorarioGeneralWidget('horario-general-container')
      widget.init()
    } catch (error) {
      console.error('[horario-general] Error:', error)
      container.innerHTML = `<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar el horario general: ${error.message}</p></div>`
    }
  })
}
