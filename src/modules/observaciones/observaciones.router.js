import { router } from '../../core/router/router.js'
import { renderObservacionesView } from './views/observacionesView.js'

export function registerRoutesObservaciones() {
  router.register('observaciones', renderObservacionesView)
}
