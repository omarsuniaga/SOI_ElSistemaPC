/**
 * finDashboardView.js - Portal bridge
 * Delegates to the modular Caja/Fin module.
 */

import { initCajaModule } from '../../modules/caja/index.js'

export function renderFinPortal(app, session) {
  initCajaModule(app, session)
}
