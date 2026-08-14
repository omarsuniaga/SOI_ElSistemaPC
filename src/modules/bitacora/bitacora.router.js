import { router } from '../../core/router/router.js'
import { renderBitacoraView } from './views/bitacoraView.js'

export function registerRoutesBitacora() {
  router.register('bitacora-clase', renderBitacoraView)
  router.register('bitacora-suplentes', (mount, params = {}) =>
    renderBitacoraView(mount, { ...params, mode: 'suplentes' }),
  )
}
