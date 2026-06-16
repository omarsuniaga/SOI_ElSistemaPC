/**
 * bitacora.router.js — Route registration for the Bitácora module.
 *
 * Pattern: mirrors planificacion.router.js exactly.
 *   import { router } from '../../core/router/router.js'
 *   export function registerRoutesBitacora() { ... }
 */

import { router } from '../../core/router/router.js'
import { renderBitacoraView } from './views/bitacoraView.js'

export function registerRoutesBitacora() {
  // Main bitácora view — receives claseId as URL param
  router.register('bitacora-clase', (container, params = {}) =>
    renderBitacoraView(container, { claseId: params.claseId }),
  )
}
