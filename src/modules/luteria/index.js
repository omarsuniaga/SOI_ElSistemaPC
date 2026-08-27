import { router } from '../../core/router/router.js'
import { renderLuteriaDashboardView } from './views/luteriaDashboardView.js'
import { renderLuteriaView } from './views/luteriaView.js'
import { renderLuteriaOrdenesView } from './views/luteriaOrdenesView.js'
import { renderLuteriaInsumosView } from './views/luteriaInsumosView.js'

export function registerRoutesLuteria() {
  router.register('luteria-dashboard', (mount) => renderLuteriaDashboardView(mount))
  router.register('luteria-diagnosticos', (mount) => renderLuteriaView(mount))
  router.register('luteria-ordenes', (mount) => renderLuteriaOrdenesView(mount))
  router.register('luteria-insumos', (mount) => renderLuteriaInsumosView(mount))
}
