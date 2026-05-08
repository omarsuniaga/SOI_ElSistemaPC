import { router } from '../../core/router/router.js'
import { renderAlumnosView } from './views/alumnosView.js'

export function registerRoutesAlumnos() {
  router.register('alumnos', renderAlumnosView)
}
