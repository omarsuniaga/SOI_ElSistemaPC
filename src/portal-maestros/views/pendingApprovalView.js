/**
 * Renderiza la pantalla de "Registro exitoso, esperá la aprobación del administrador".
 * @param {HTMLElement} container
 * @param {{ onBackToLogin: () => void }} options
 */
export function renderPendingApprovalView(container, { onBackToLogin }) {
  container.innerHTML = `
    <div class="pm-login">
      <div class="pm-login-branding">
        <div class="pm-login-logo"><i class="bi bi-clock"></i></div>
        <h1 class="pm-login-title">Registro exitoso</h1>
        <p class="pm-login-subtitle">Sistema Operativo Institucional — SOI</p>
      </div>

      <div class="pm-login-form">
        <div class="pm-login-card" style="text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 1rem; color: var(--pm-primary, #3b82f6);">
            <i class="bi bi-hourglass-split"></i>
          </div>
          <h2 style="margin-bottom: 1rem; font-size: 1.25rem; font-weight: 600;">
            ¡Registro exitoso!
          </h2>
          <p style="margin-bottom: 1.5rem; color: rgba(255,255,255,0.6); line-height: 1.6;">
            Esperá la aprobación del administrador para poder acceder al sistema.
            Te notificaremos cuando tu cuenta esté activa.
          </p>
          <button type="button" class="pm-btn-primary" data-route="login">
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  `

  const backBtn = container.querySelector('[data-route="login"]')
  backBtn?.addEventListener('click', (e) => {
    e.preventDefault()
    if (onBackToLogin) {
      onBackToLogin()
    } else {
      history.pushState({ route: 'login' }, '', '#/login')
      window.dispatchEvent(new PopStateEvent('popstate', { state: { route: 'login' } }))
    }
  })
}
