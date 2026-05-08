import { router } from '../../core/router/router.js'
import { renderLoginView } from './views/loginView.js'
import { renderRegisterView } from './views/registerView.js'
import { renderPerfilView } from './views/perfilView.js'

export function registerRoutesAuth() {
  router.register('login', renderLoginView)
  router.register('register', renderRegisterView)
  router.register('perfil', renderPerfilView)
}

registerRoutesAuth()

export { renderLoginView, renderRegisterView, renderPerfilView }