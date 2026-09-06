/**
 * index.js - Caja module entry point
 * Renders portal shell (navbar + sidebar), wires routing and realtime.
 */

import { supabase } from '../../lib/supabaseClient.js'
import * as cajaApi from './api/cajaApi.js'
import { initRouter, navigate, teardownRouter } from './caja.router.js'
import { escapeHTML } from '../../shared/utils/sanitize.js'

const VERDE = '#059669'
const TEAL = '#0d9488'

function toggleFinTheme() {
  const isDark = document.documentElement.getAttribute('data-fin-theme') === 'dark'
  const next = isDark ? 'light' : 'dark'
  document.documentElement.setAttribute('data-fin-theme', next)
  document.documentElement.setAttribute('data-bs-theme', next)
  localStorage.setItem('fin-theme', next)
  return next
}

// Catálogo completo del menú. `visible: false` lo saca del sidebar pero la ruta
// sigue registrada en caja.router.js (accesible por URL directa; no se rompe nada).
//
// 2026-09-06 — el portal se reduce a lo vital (registrar el pago mensual +
// cuadrar caja) y se reactiva módulo a módulo. Para reactivar un item: poner
// `visible: true`. Estado del cableado de cada uno: docs/PORTAL_FIN_MENU_AUDITORIA.md
// Orden y bloqueos de reactivación: docs/PORTAL_FIN_BACKLOG.md
const NAV_CATALOGO = [
  { hash: '#/pagos/nuevo',    icon: 'bi-plus-circle-fill', label: 'Registrar Pago',      visible: true },
  { hash: '#/cierre',         icon: 'bi-cash-stack',       label: 'Cierre de Caja',      visible: true },
  { hash: '#/dashboard',      icon: 'bi-speedometer2',     label: 'Dashboard',           visible: false },
  { hash: '#/familias',       icon: 'bi-people-fill',      label: 'Familias',            visible: false },
  { hash: '#/cuotas',         icon: 'bi-receipt',          label: 'Cuotas',              visible: false },
  { hash: '#/accesorios',     icon: 'bi-box-seam-fill',    label: 'Tiendita',            visible: false },
  { hash: '#/notificaciones', icon: 'bi-bell-fill',        label: 'Notificaciones',      visible: false, badge: true },
  { hash: '#/hermes',         icon: 'bi-robot',            label: 'Tareas del Director',  visible: false },
  { hash: '#/reportes',       icon: 'bi-bar-chart-fill',   label: 'Reportes',            visible: false },
  { hash: '#/mensajes',       icon: 'bi-chat-dots-fill',   label: 'Mensajes',            visible: false },
  { hash: '#/campanas',       icon: 'bi-megaphone-fill',   label: 'Campañas',            visible: false },
  { hash: '#/score',          icon: 'bi-trophy-fill',      label: 'Score Familias',      visible: false, adminOnly: true },
]

const NAV_ITEMS = NAV_CATALOGO.filter((item) => item.visible)

// ---------------------------------------------------------------------------
// Push Notification setup
// Required env: VITE_VAPID_PUBLIC_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
// ---------------------------------------------------------------------------

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

async function setupPushNotifications(session) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

  try {
    const reg = await navigator.serviceWorker.register('/sw-fin.js', { scope: '/fin.html' })
    await navigator.serviceWorker.ready

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return

    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
    if (!vapidKey) return // env not configured, skip silently

    const existing = await reg.pushManager.getSubscription()
    const sub =
      existing ||
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      }))

    const json = sub.toJSON()
    await cajaApi.savePushSubscription({
      profile_id: session.user.id,
      endpoint: sub.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      user_agent: navigator.userAgent,
    })
  } catch (_err) {
    // Push setup is non-critical — fail silently in dev/mock
  }
}

export function initCajaModule(app, session) {
  const userEmail = session?.user?.email ?? 'Usuario'
  let unreadCount = 0
  let realtimeUnsub = null

  function updateNotifBadge(count) {
    unreadCount = count
    const badge = app.querySelector('#notif-badge')
    if (!badge) return
    badge.textContent = String(count)
    badge.style.display = count > 0 ? 'flex' : 'none'
  }

  const isAdmin = session?.user?.user_metadata?.role === 'admin'

  function renderNavItem(item) {
    // adminOnly items: show for admins with a small label, hide for non-admins
    if (item.adminOnly && !isAdmin) return ''
    return (
      '<button class="caja-nav-btn" data-hash="' +
      item.hash +
      '"' +
      ' style="display:flex;align-items:center;gap:0.625rem;width:100%;border:none;background:none;' +
      'padding:0.625rem 1rem;border-radius:8px;cursor:pointer;font-size:0.875rem;color:#475569;text-align:left;position:relative">' +
      '<i class="' +
      item.icon +
      '" style="font-size:1rem;width:18px;flex-shrink:0"></i>' +
      '<span>' +
      item.label +
      '</span>' +
      (item.adminOnly
        ? '<span style="font-size:0.6rem;font-weight:700;color:#7c3aed;background:#f5f3ff;' +
          'padding:0.05rem 0.3rem;border-radius:3px;margin-left:auto;flex-shrink:0">ADM</span>'
        : '') +
      (item.badge
        ? '<span id="notif-badge" style="display:none;position:absolute;right:0.5rem;top:50%;transform:translateY(-50%);background:#ef4444;color:#fff;font-size:0.65rem;font-weight:700;padding:0.1rem 0.375rem;border-radius:9999px;min-width:18px;justify-content:center;align-items:center"></span>'
        : '') +
      '</button>'
    )
  }

  app.innerHTML =
    '<div class="fin-app-shell" style="display:flex;flex-direction:column">' +
    // Top navbar
    '<nav class="fin-topbar">' +
    '<div class="fin-brand"><i class="bi bi-cash-coin"></i><span>Portal FIN</span>' +
    '</div>' +
    '<div class="fin-topbar-actions">' +
    '<span class="fin-user">' +
    escapeHTML(userEmail) +
    '</span>' +
    '<button id="btn-theme" class="fin-topbar-btn" type="button" title="Cambiar tema" aria-label="Cambiar tema">' +
    '<i class="bi ' +
    (document.documentElement.getAttribute('data-fin-theme') === 'dark'
      ? 'bi-sun-fill'
      : 'bi-moon-stars-fill') +
    '"></i></button>' +
    '<button id="btn-logout" class="fin-topbar-btn fin-logout" type="button"><i class="bi bi-box-arrow-right"></i><span>Salir</span></button>' +
    '</div></nav>' +
    // Body: sidebar + content
    '<div class="fin-body">' +
    // Sidebar
    '<aside class="fin-sidebar">' +
    NAV_ITEMS.map(renderNavItem).join('') +
    '</aside>' +
    // Content
    '<main id="caja-content"></main>' +
    '</div></div>'

  // Active nav style tracking
  function updateActiveNav() {
    const currentHash = window.location.hash || '#/dashboard'
    app.querySelectorAll('.caja-nav-btn').forEach((btn) => {
      const isActive =
        currentHash.startsWith(btn.dataset.hash) ||
        (btn.dataset.hash === '#/familias' && currentHash.startsWith('#/familias/'))
      btn.classList.toggle('fin-nav-active', isActive)
    })
  }

  app.querySelectorAll('.caja-nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      navigate(btn.dataset.hash)
      updateActiveNav()
    })
  })
  window.addEventListener('hashchange', updateActiveNav)
  updateActiveNav()

  app.querySelector('#btn-theme')?.addEventListener('click', () => {
    const next = toggleFinTheme()
    const icon = app.querySelector('#btn-theme i')
    if (icon) icon.className = `bi ${next === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`
  })

  // Logout
  app.querySelector('#btn-logout')?.addEventListener('click', async () => {
    teardownRouter()
    if (realtimeUnsub) {
      try {
        realtimeUnsub()
      } catch (_e) {}
    }
    await supabase.auth.signOut()
    window.location.reload()
  })

  const contentEl = app.querySelector('#caja-content')

  // Init router
  initRouter(contentEl, session, updateNotifBadge)

  // Setup push notifications (non-critical — fails silently if VAPID key not configured)
  setupPushNotifications(session).catch(() => {})

  // Subscribe to realtime notifications
  realtimeUnsub = cajaApi.subscribeNotificaciones(async (newNotif) => {
    if (newNotif && newNotif.estado_portal === 'no_leida') {
      updateNotifBadge(unreadCount + 1)
    }
    // Trigger push for high-priority/critical if browser might be backgrounded
    if (newNotif && (newNotif.prioridad === 'alta' || newNotif.prioridad === 'critica')) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      if (supabaseUrl && supabaseKey) {
        fetch(`${supabaseUrl}/functions/v1/send-push`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${supabaseKey}` },
          body: JSON.stringify({
            profile_id: session.user.id,
            title: newNotif.titulo || 'Portal FIN',
            body: newNotif.cuerpo || '',
            data: { tipo: newNotif.tipo, familia_id: newNotif.familia_id },
          }),
        }).catch(() => {}) // fire-and-forget, non-critical
      }
    }
  })

  // Navigate to default route
  const initialHash = window.location.hash || '#/dashboard'
  navigate(initialHash)
  updateActiveNav()
}
