import { router } from '../../core/router/router.js'
import { renderPermisosView } from './views/permisosView.js'

export function registerRoutesPermisos() {
  router.register('permisos', renderPermisosView)
}
