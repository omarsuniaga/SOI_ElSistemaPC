import { router } from '../../core/router/router.js'
import { renderClasesView } from './views/clasesView.js'
import { renderClasesHoyView } from './views/clasesHoyView.js'

export function registerRoutesClases() {
  router.register('clases', renderClasesView)
  router.register('clases-hoy', renderClasesHoyView)
}

