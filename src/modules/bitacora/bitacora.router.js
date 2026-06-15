import { router } from '../../core/router/router.js'
import { renderBitacoraView } from './views/bitacoraView.js'

export function registerRoutesBitacora() {
  router.register('bitacora-clase', renderBitacoraView)
}
