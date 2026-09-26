import { router } from '../../core/router/router.js'
import { renderLoginView } from './views/loginView.js'
import { renderRegisterView } from './views/registerView.js'
import { renderPerfilView } from './views/perfilView.js'
import { renderPendingApprovalView } from './views/pendingApprovalView.js'
import { renderForgotPasswordView } from './views/forgotPasswordView.js'
import { renderResetPasswordView } from './views/resetPasswordView.js'

export function registerRoutesAuth() {
  router.register('login', renderLoginView)
  router.register('register', renderRegisterView)
  router.register('perfil', renderPerfilView)
  router.register('pending-approval', renderPendingApprovalView)
  router.register('forgot-password', renderForgotPasswordView)
  router.register('reset-password', renderResetPasswordView)
}

registerRoutesAuth()

export {
  renderLoginView,
  renderRegisterView,
  renderPerfilView,
  renderPendingApprovalView,
  renderForgotPasswordView,
  renderResetPasswordView,
}