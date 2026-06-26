import { router } from '../../core/router/router.js'
import { renderCampaniasView } from './views/campaniasView.js'

export function registerRoutesCampanias() {
  router.register('campanias', renderCampaniasView)
}
