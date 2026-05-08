import { router } from '../../core/router/router.js'
import { renderClasesView } from './views/clasesView.js'

export function registerRoutesClases() {
  router.register('clases', renderClasesView)
}
