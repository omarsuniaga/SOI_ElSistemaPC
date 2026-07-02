import { createEvaluacionView } from './views/EvaluacionView.js'
import { createResultadosView } from './views/ResultadosView.js'
import adapter from './api/audicionesAdapter.js'
import { renderTareasView } from '../hermes/views/tareasView.js'

let currentView = null

export function initRouter(role) {
  const container = document.getElementById('view-container')
  if (!container) return

  const navigate = async (hash) => {
    if (currentView && currentView.destroy) currentView.destroy()
    currentView = null

    if (hash === '#resultados' && role !== 'admin') {
      window.location.hash = '#evaluacion'
      return
    }

    if (hash === '#tareas') {
      const result = await renderTareasView(container, { hideCalendarBtn: true })
      currentView = { destroy: result?.teardown || (() => {}) }
      return
    }

    if (hash === '#resultados') {
      currentView = createResultadosView(container, adapter)
    } else {
      currentView = createEvaluacionView(container, adapter)
    }
  }

  window.addEventListener('hashchange', () => navigate(window.location.hash))
  navigate(window.location.hash || '#evaluacion')
}
