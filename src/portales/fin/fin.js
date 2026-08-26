import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './fin-theme.css'
import { supabase } from '../../lib/supabaseClient.js'
import { renderFinPortal } from './finDashboardView.js'

async function hasPortalAccess(userId) {
  const { data } = await supabase.from('profiles').select('rol').eq('id', userId).maybeSingle()
  return data?.rol === 'admin' || data?.rol === 'finanzas'
}

function renderLogin(app, errorMsg = null) {
  app.innerHTML = `
    <div class="fin-login-shell">
      <div class="fin-login-card">
        <div style="text-align:center;margin-bottom:1.5rem">
          <div class="fin-login-mark"><i class="bi bi-cash-coin"></i></div>
          <h4 style="margin:0;font-weight:700">Portal FIN</h4>
          <p style="color:var(--fin-text-muted);font-size:0.875rem;margin-top:0.25rem">El Sistema Punta Cana</p>
        </div>
        ${errorMsg ? `<div class="alert alert-danger py-2 small">${errorMsg}</div>` : ''}
        <form id="login-form">
          <div class="mb-3">
            <input type="email" id="email" class="form-control" placeholder="Correo electrónico" required autofocus />
          </div>
          <div class="mb-4">
            <input type="password" id="password" class="form-control" placeholder="Contraseña" required />
          </div>
          <div id="login-error" class="alert alert-danger d-none small py-2"></div>
          <button type="submit" id="btn-login" class="btn w-100 fw-semibold"
            style="background:#059669;color:#fff;border:none">
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  `

  document.querySelector('#login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.querySelector('#email').value
    const password = document.querySelector('#password').value
    const btn = document.querySelector('#btn-login')
    const errEl = document.querySelector('#login-error')

    btn.disabled = true
    btn.textContent = 'Entrando...'
    errEl.classList.add('d-none')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      errEl.textContent = 'Credenciales incorrectas.'
      errEl.classList.remove('d-none')
      btn.disabled = false
      btn.textContent = 'Iniciar sesión'
      return
    }

    const ok = await hasPortalAccess(data.session.user.id)
    if (!ok) {
      await supabase.auth.signOut()
      renderLogin(app, 'Tu cuenta no tiene acceso a este portal.')
      return
    }

    renderFinPortal(app, data.session)
  })
}

async function init() {
  const app = document.querySelector('#app')
  const savedTheme = localStorage.getItem('fin-theme')
  const isDark =
    savedTheme === 'dark' ||
    (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.setAttribute('data-fin-theme', isDark ? 'dark' : 'light')
  document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light')

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session) {
    renderLogin(app)
    return
  }

  const ok = await hasPortalAccess(session.user.id)
  if (!ok) {
    renderLogin(app, 'Tu cuenta no tiene acceso a este portal.')
    return
  }

  renderFinPortal(app, session)
}

init()
