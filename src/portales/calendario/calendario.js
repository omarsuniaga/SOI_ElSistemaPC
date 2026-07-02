import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { supabase } from '../../lib/supabaseClient.js'
import { init as renderHorarioBuilderView } from '../../modules/horario-builder/views/horarioBuilderView.js'
import { renderTareasView } from '../../modules/hermes/views/tareasView.js'
import '../../modules/horario-builder/styles/horario-builder.css'

async function hasPortalAccess(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', userId)
    .maybeSingle()
  
  const allowedRoles = ['admin', 'superadmin', 'coordinacion_academica', 'direccion']
  return allowedRoles.includes(data?.rol)
}

function renderLogin(app, errorMsg = null) {
  app.style.background = ''
  app.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)">
      <div style="background:#fff;border-radius:16px;padding:2.5rem;width:100%;max-width:380px;
        box-shadow:0 20px 60px rgba(0,0,0,0.2)">
        <div style="text-align:center;margin-bottom:1.5rem">
          <div style="width:56px;height:56px;background:#e0e7ff;border-radius:50%;
            display:flex;align-items:center;justify-content:center;margin:0 auto 1rem">
            <i class="bi bi-calendar-week" style="font-size:1.5rem;color:#4f46e5"></i>
          </div>
          <h4 style="color:#111;margin:0;font-weight:700">Fechas Globales</h4>
          <p style="color:#6b7280;font-size:0.875rem;margin-top:0.25rem">Gestión de horarios y clases</p>
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
          <button type="submit" id="btn-login" class="btn w-100 text-white fw-semibold"
            style="background:#4f46e5;border:none">
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
    btn.textContent = 'Iniciando...'
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
      renderLogin(app, 'Tu cuenta no tiene permisos para gestionar las fechas.')
      return
    }

    renderCalendarioPortal(app, data.session)
  })
}

function renderCalendarioPortal(app, session) {
  const userEmail = session?.user?.email ?? 'Usuario'

  app.style.background = '#f8fafc'
  app.innerHTML = `
    <nav style="background:linear-gradient(90deg,#4f46e5,#7c3aed);color:#fff;
      padding:0 1.5rem;height:56px;display:flex;align-items:center;
      justify-content:space-between;box-shadow:0 2px 8px rgba(0,0,0,0.15);position:sticky;top:0;z-index:100">
      <div style="display:flex;align-items:center;gap:0.75rem">
        <i class="bi bi-calendar-event-fill" style="font-size:1.25rem"></i>
        <span style="font-weight:700;font-size:1rem;letter-spacing:0.02em">Portal de Fechas Globales</span>
      </div>
      <div style="display:flex;align-items:center;gap:1rem">
        <span style="font-size:0.8125rem;opacity:0.85">${userEmail}</span>
        <button id="btn-logout" style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);
          color:#fff;border-radius:8px;padding:0.25rem 0.75rem;font-size:0.8125rem;cursor:pointer">
          <i class="bi bi-box-arrow-right me-1"></i>Salir
        </button>
      </div>
    </nav>
    <div style="background:#fff;border-bottom:1px solid #e2e8f0;padding:0 1.5rem;display:flex;gap:0">
      <button class="portal-tab active" data-view="horario"
        style="border:none;background:none;padding:0.875rem 1.25rem;font-size:0.875rem;
        cursor:pointer;border-bottom:2px solid transparent;color:#64748b;font-weight:500">
        <i class="bi bi-calendar-week me-1"></i>Horarios
      </button>
      <button class="portal-tab" data-view="tareas"
        style="border:none;background:none;padding:0.875rem 1.25rem;font-size:0.875rem;
        cursor:pointer;border-bottom:2px solid transparent;color:#64748b;font-weight:500">
        <i class="bi bi-list-task me-1"></i>Tareas (Hermes)
      </button>
    </div>
    <div id="portal-content" style="padding: 1.5rem; min-height:calc(100vh - 105px)"></div>
  `

  const content = app.querySelector('#portal-content')
  let _teardown = null

  function showTab(viewName) {
    app.querySelectorAll('.portal-tab').forEach(tab => {
      const isActive = tab.dataset.view === viewName
      tab.style.borderBottomColor = isActive ? '#4f46e5' : 'transparent'
      tab.style.color = isActive ? '#4f46e5' : '#64748b'
    })

    _teardown?.teardown?.()
    if (viewName === 'tareas') {
      renderTareasView(content, { hideCalendarBtn: true }).then(r => { _teardown = r })
    } else {
      renderHorarioBuilderView(content)
      _teardown = null
    }
  }

  app.querySelectorAll('.portal-tab').forEach(tab => {
    tab.addEventListener('click', () => showTab(tab.dataset.view))
  })

  app.querySelector('#btn-logout')?.addEventListener('click', async () => {
    await supabase.auth.signOut()
    window.location.reload()
  })

  // Render the official visual schedule editor
  showTab('horario')
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
    renderLogin(app, 'Tu cuenta no tiene permisos para gestionar las fechas.')
    return
  }

  renderCalendarioPortal(app, session)
}

init()
