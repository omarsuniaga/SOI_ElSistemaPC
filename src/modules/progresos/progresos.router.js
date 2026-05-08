import { router } from '../../core/router/router.js'
import { renderProgresosView } from './views/progresosView.js'

export function registerRoutesProgresos() {
  router.register('progresos', renderProgresosView)
}
