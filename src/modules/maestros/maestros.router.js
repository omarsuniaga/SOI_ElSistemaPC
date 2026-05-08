import { router } from '../../core/router/router.js'
import { renderMaestrosView } from './views/maestrosView.js'

export function registerRoutesMaestros() {
  router.register('maestros', renderMaestrosView)
}
