import { router } from '../../core/router/router.js'
import { init as renderTransicionView } from './views/transicionView.js'

export function registerRoutesTransicionSemestre() {
  router.register('transicion-semestre', renderTransicionView)
}
