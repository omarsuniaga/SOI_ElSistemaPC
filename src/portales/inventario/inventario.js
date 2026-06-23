import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { supabase } from '../../lib/supabaseClient.js'
import { renderInventarioPortal } from './inventarioDashboardView.js'

async function hasPortalAccess(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', userId)
    .maybeSingle()
  return data?.rol === 'admin' || data?.rol === 'inventarista'
}

function renderLogin(app, errorMsg = null) {
  app.style.background = ''
  app.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:linear-gradient(135deg,#2563eb 0%,#0891b2 100%)">
      <div style="background:#fff;border-radius:16px;padding:2.5rem;width:100%;max-width:380px;
        box-shadow:0 20px 60px rgba(0,0,0,0.2)">
        <div style="text-align:center;margin-bottom:1.5rem">
          <div style="width:56px;height:56px;background:#dbeafe;border-radius:50%;
            display:flex;align-items:center;justify-content:center;margin:0 auto 1rem">
            <i class="bi bi-music-note-list" style="font-size:1.5rem;color:#2563eb"></i>
          </div>
          <h4 style="color:#111;margin:0;font-weight:700">Portal de Inventario</h4>
          <p style="color:#6b7280;font-size:0.875rem;margin-top:0.25rem">El Sistema Punta Cana</p>
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
            style="background:#2563eb;color:#fff;border:none">
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

    renderInventarioPortal(app, data.session)
  })
}

async function init() {
  const app = document.querySelector('#app')
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session) {
    renderLogin(app)
    return
  }

  const ok = await hasPortalAccess(session.user.id)
  if (!ok) {
    renderLogin(app, 'Tu cuenta no tiene acceso a este portal.')
    return
  }

  renderInventarioPortal(app, session)
}

init()
