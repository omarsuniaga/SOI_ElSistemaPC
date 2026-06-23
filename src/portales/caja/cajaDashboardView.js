/**
 * cajaDashboardView.js - Portal bridge
 * Delegates to the new modular Caja module.
 */

import { initCajaModule } from '../../modules/caja/index.js'

export function renderCajaPortal(app, session) {
  initCajaModule(app, session)
}
