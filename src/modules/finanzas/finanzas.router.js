import { router } from '../../core/router/router.js'
import { renderBalanceAlumnosView } from './views/balanceAlumnosView.js'
import { renderRegistroPagosView } from './views/registroPagosView.js'

export function registerRoutesFinanzas() {
  router.register('finanzas-balance', renderBalanceAlumnosView)
  router.register('finanzas-registro', renderRegistroPagosView)
}
