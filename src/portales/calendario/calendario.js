/**
 * calendario.js — Portal de Fechas Globales / Calendario
 * Lente sobre Horario Builder y Tareas Hermes de Planificación de Calendario.
 * Totalmente adaptado para Dark/Light Mode y 100% Responsivo.
 */

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '../../style.css'
import '../../styles/bootstrap-support.css'
import '../../styles/design-tokens.css'
import '../../styles/dark-mode.css'
import '../../modules/horario-builder/styles/horario-builder.css'
import './calendario.css'

import { supabase } from '../../lib/supabaseClient.js'
import { init as renderHorarioBuilderView } from '../../modules/horario-builder/views/horarioBuilderView.js'
import { renderTareasView } from '../../modules/hermes/views/tareasView.js'
import { renderCalendarioGlobalView } from '../../modules/calendario/views/calendarioGlobalView.js'
import '../../modules/calendario/styles/calendarioGlobal.css'

// ============================================================================
// GESTIÓN DEL TEMA (MODO OSCURO / CLARO)
// ============================================================================
function initializeTheme() {
  const saved = localStorage.getItem('app-theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = saved === 'dark' || (saved === null && prefersDark)
  const theme = isDark ? 'dark' : 'light'
  document.documentElement.setAttribute('data-bs-theme', theme)
  return theme
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-bs-theme') || 'light'
  const next = current === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-bs-theme', next)
  localStorage.setItem('app-theme', next)

  // Actualizar iconos de todos los botones de tema en pantalla
  document.querySelectorAll('.cal-theme-toggle-icon').forEach(icon => {
    icon.className = next === 'dark' ? 'bi bi-sun-fill cal-theme-toggle-icon' : 'bi bi-moon-stars-fill cal-theme-toggle-icon'
  })
}

// ============================================================================
// CONTROL DE ACCESO
// ============================================================================
async function hasPortalAccess(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', userId)
    .maybeSingle()
  
  const allowedRoles = ['admin', 'superadmin', 'coordinacion_academica', 'direccion']
  return allowedRoles.includes(data?.rol)
}

// ============================================================================
// PANTALLA DE LOGIN
// ============================================================================
function renderLogin(app, errorMsg = null) {
  const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark'

  app.innerHTML = `
    <div class="cal-login-backdrop">
      <!-- Botón Flotante de Tema en Login -->
      <div class="cal-login-floating-theme">
        <button id="btn-login-theme" class="cal-nav-btn cal-theme-btn" title="Cambiar modo claro / oscuro" aria-label="Cambiar tema">
          <i class="${isDark ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill'} cal-theme-toggle-icon"></i>
        </button>
      </div>

      <div class="cal-login-card">
        <div class="text-center">
          <div class="cal-login-icon">
            <i class="bi bi-calendar-week"></i>
          </div>
          <h4 class="fw-bold mb-1">Fechas Globales</h4>
          <p class="text-muted small mb-4">Gestión de horarios y clases institucionales</p>
        </div>

        ${errorMsg ? `<div class="alert alert-danger py-2 small mb-3">${errorMsg}</div>` : ''}

        <form id="login-form">
          <div class="mb-3">
            <label class="form-label small fw-semibold">Correo Electrónico</label>
            <input type="email" id="email" class="form-control" placeholder="correo@ejemplo.com" required autofocus />
          </div>
          <div class="mb-4">
            <label class="form-label small fw-semibold">Contraseña</label>
            <input type="password" id="password" class="form-control" placeholder="••••••••" required />
          </div>
          <div id="login-error" class="alert alert-danger d-none small py-2 mb-3"></div>
          <button type="submit" id="btn-login" class="btn btn-primary w-100 fw-semibold py-2">
            <i class="bi bi-box-arrow-in-right me-1"></i> Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  `

  // Evento Theme Toggle en Login
  app.querySelector('#btn-login-theme')?.addEventListener('click', toggleTheme)

  // Evento Submit Login
  app.querySelector('#login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.querySelector('#email').value
    const password = document.querySelector('#password').value
    const btn = document.querySelector('#btn-login')
    const errEl = document.querySelector('#login-error')

    btn.disabled = true
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Iniciando...'
    errEl.classList.add('d-none')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      errEl.textContent = 'Credenciales incorrectas o usuario no encontrado.'
      errEl.classList.remove('d-none')
      btn.disabled = false
      btn.innerHTML = '<i class="bi bi-box-arrow-in-right me-1"></i> Iniciar Sesión'
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

// ============================================================================
// PANTALLA PRINCIPAL DEL PORTAL CALENDARIO
// ============================================================================
function renderCalendarioPortal(app, session) {
  const userEmail = session?.user?.email ?? 'Usuario'
  const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark'

  app.innerHTML = `
    <div class="calendario-portal-root">
      
      <!-- NAVBAR SUPERIOR -->
      <nav class="cal-navbar">
        <div class="cal-navbar-brand">
          <i class="bi bi-calendar-event-fill"></i>
          <div>
            <span>Portal de Fechas Globales</span>
            <span class="cal-navbar-brand-sub">SOI · El Sistema Punta Cana</span>
          </div>
        </div>

        <div class="cal-navbar-actions">
          <div class="cal-user-pill" title="${userEmail}">
            <i class="bi bi-person-circle"></i>
            <span>${userEmail}</span>
          </div>

          <!-- BOTÓN CAMBIO MODO OSCURO / CLARO -->
          <button id="btn-cal-theme-toggle" class="cal-nav-btn cal-theme-btn" title="Cambiar tema claro/oscuro" aria-label="Cambiar tema">
            <i class="${isDark ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill'} cal-theme-toggle-icon"></i>
          </button>

          <!-- BOTÓN SALIR -->
          <button id="btn-cal-logout" class="cal-nav-btn" title="Cerrar Sesión">
            <i class="bi bi-box-arrow-right"></i>
            <span>Salir</span>
          </button>
        </div>
      </nav>

      <!-- BARRA DE PESTAÑAS (TABS RESPONSIVAS) -->
      <div class="cal-tabs-bar">
        <button class="cal-tab-btn active" data-view="calendario-global">
          <i class="bi bi-calendar3"></i>
          <span>Calendario Institucional</span>
        </button>
        <button class="cal-tab-btn" data-view="horario">
          <i class="bi bi-calendar-range"></i>
          <span>Constructor de Horarios</span>
        </button>
        <button class="cal-tab-btn" data-view="tareas">
          <i class="bi bi-check2-square"></i>
          <span>Tareas Hermes (Planificación)</span>
        </button>
      </div>

      <!-- CONTENEDOR PRINCIPAL -->
      <main id="portal-content" class="cal-content-container"></main>

    </div>
  `

  const content = app.querySelector('#portal-content')
  let _currentInstance = null

  async function showTab(viewName) {
    app.querySelectorAll('.cal-tab-btn').forEach(tab => {
      const isActive = tab.dataset.view === viewName
      tab.classList.toggle('active', isActive)
    })

    // Limpiar instancia previa
    if (_currentInstance) {
      if (typeof _currentInstance.destroy === 'function') {
        _currentInstance.destroy()
      } else if (typeof _currentInstance.teardown === 'function') {
        _currentInstance.teardown()
      }
      _currentInstance = null
    }
    content.innerHTML = ''

    if (viewName === 'tareas') {
      const r = await renderTareasView(content, { hideCalendarBtn: true })
      _currentInstance = r
    } else if (viewName === 'horario') {
      renderHorarioBuilderView(content)
      _currentInstance = null
    } else {
      const r = await renderCalendarioGlobalView(content)
      _currentInstance = r
    }
  }

  // Event Listeners de Tabs
  app.querySelectorAll('.cal-tab-btn').forEach(tab => {
    tab.addEventListener('click', () => showTab(tab.dataset.view))
  })

  // Event Listener Theme Toggle
  app.querySelector('#btn-cal-theme-toggle')?.addEventListener('click', toggleTheme)

  // Event Listener Logout
  app.querySelector('#btn-cal-logout')?.addEventListener('click', async () => {
    await supabase.auth.signOut()
    window.location.reload()
  })

  // Vista inicial por defecto
  showTab('calendario-global')
}

// ============================================================================
// BOOTSTRAP DEL PORTAL
// ============================================================================
async function init() {
  initializeTheme()
  const app = document.querySelector('#app')
  if (!app) return

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
