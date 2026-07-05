/**
 * realtimeService — Supabase Realtime subscription for admin notifications.
 *
 * Listens to INSERT/UPDATE events on the two main actionable sources:
 *   - ausencias_maestros (estado = 'pendiente')
 *   - profiles           (rol = 'maestro', estado = 'pendiente')
 *
 * On any change it re-fetches the pending count and calls the badge callback.
 * Also shows a native browser Notification when a high-priority event arrives
 * and the admin is NOT on the notifications view.
 */

import { supabase } from '../../lib/supabaseClient.js'
import { fetchAdminPendingCount } from './api/adminNotifApi.js'
import { LifecycleManager } from '../../shared/services/lifecycleManager.js'

const lifecycle = new LifecycleManager('admin-notifications')

let _channel = null
let _badgeCallback = null
let _debounceTimer = null

// Debounce re-fetches so rapid DB writes don't spam queries
function _scheduleFetch() {
  clearTimeout(_debounceTimer)
  _debounceTimer = setTimeout(async () => {
    try {
      const count = await fetchAdminPendingCount()
      _badgeCallback?.(count)
    } catch (err) {
      console.warn('[realtimeService] count fetch failed:', err.message)
    }
  }, 800)
}

function _showBrowserNotification(title, body) {
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return
  // Only notify if admin is not currently on the notifications view
  const currentRoute = localStorage.getItem('current-view') || ''
  if (currentRoute === 'admin-notificaciones') return
  try {
    new Notification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'admin-notif',          // collapses duplicates
      renotify: true,
    })
  } catch { /* ignore — some browsers block programmatic Notification() */ }
}

/**
 * Start the Realtime channel and request browser notification permission.
 * @param {function(number): void} badgeCallback  Called with the new pending count.
 */
export function startAdminRealtimeNotifications(badgeCallback) {
  if (_channel) return   // already running
  _badgeCallback = badgeCallback

  // Request browser notification permission (non-blocking, user can decline)
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {})
  }

  _channel = supabase
    .channel('admin-notif-realtime')

    // New absence request
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'ausencias_maestros' },
      (payload) => {
        _showBrowserNotification(
          '📅 Nueva solicitud de ausencia',
          'Un maestro solicitó una ausencia — revisá el Centro de Actividad.',
        )
        _scheduleFetch()
      },
    )

    // Absence status changed (e.g. re-submitted after rejection)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'ausencias_maestros',
        filter: 'estado=eq.pendiente' },
      () => _scheduleFetch(),
    )

    // New teacher registration pending approval
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'profiles',
        filter: 'rol=eq.maestro' },
      (payload) => {
        const nombre = payload.new?.nombre_completo || 'Un maestro'
        _showBrowserNotification(
          '👤 Nuevo maestro pendiente de aprobación',
          `${nombre} se registró y está esperando aprobación.`,
        )
        _scheduleFetch()
      },
    )

    // Teacher profile updated (e.g. estado changed back to 'pendiente')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'profiles',
        filter: 'estado=eq.pendiente' },
      () => _scheduleFetch(),
    )

    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // Fetch initial count once connected
        _scheduleFetch()
      } else if (status === 'CHANNEL_ERROR' || status === 'SUBSCRIPTION_ERROR') {
        console.warn('[realtimeService] Channel error, will retry on reconnect')
      }
    })

  // Registrar canal para cleanup
  lifecycle.registerChannel(_channel)
}

/**
 * Tear down the Realtime channel (call on logout).
 */
export function stopAdminRealtimeNotifications() {
  lifecycle.destroy()
  _channel = null
  _badgeCallback = null
  clearTimeout(_debounceTimer)
  _debounceTimer = null
}

/**
 * Reset the badge to 0 — call when the admin enters the notifications view.
 */
export function resetAdminNotifBadge() {
  _badgeCallback?.(0)
}
