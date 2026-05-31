/**
 * realtimeService — Unified Supabase Realtime for admin notifications.
 *
 * Single channel listening to:
 *   - ausencias_maestros (INSERT/UPDATE) → feeds badge, shows notification, triggers view reload
 *   - profiles (INSERT/UPDATE rol=maestro) → feeds badge, shows notification, triggers view reload
 *   - asistencias (INSERT) → triggers view reload
 *
 * Callbacks:
 *   - badgeCallback: updates pending count in UI
 *   - feedCallback: reloads the notification feed
 *   - statusCallback: updates connection status indicator
 */

import { supabase } from '../../lib/supabaseClient.js'
import { fetchAdminPendingCount } from './api/adminNotifApi.js'
import { LifecycleManager } from '../../shared/services/lifecycleManager.js'

const lifecycle = new LifecycleManager('admin-notifications')

let _channel = null
let _badgeCallback = null
let _feedCallback = null
let _statusCallback = null
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

function _scheduleFeedReload() {
  clearTimeout(_debounceTimer)
  _debounceTimer = setTimeout(async () => {
    _feedCallback?.()
  }, 300)
}

function _showBrowserNotification(title, body) {
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return
  const currentRoute = localStorage.getItem('current-view') || ''
  if (currentRoute === 'admin-notificaciones') return
  try {
    new Notification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'admin-notif',
      renotify: true,
    })
  } catch { /* ignore */ }
}

/**
 * Start unified Realtime channel.
 * @param {function(number): void} badgeCallback - Updates badge with pending count
 * @param {function(): void} feedCallback - Reloads the notification feed
 * @param {function(string): void} statusCallback - Updates connection status (optional)
 */
export function startAdminRealtimeNotifications(badgeCallback, feedCallback, statusCallback) {
  if (_channel) return
  _badgeCallback = badgeCallback
  _feedCallback = feedCallback
  _statusCallback = statusCallback

  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {})
  }

  _channel = supabase
    .channel('admin-realtime-unified')

    // Ausencias: INSERT
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'ausencias_maestros' },
      (payload) => {
        _showBrowserNotification(
          '📅 Nueva solicitud de ausencia',
          'Un maestro solicitó una ausencia — revisá el Centro de Actividad.'
        )
        _scheduleFetch()
        _scheduleFeedReload()
      }
    )

    // Ausencias: UPDATE
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'ausencias_maestros' },
      () => {
        _scheduleFetch()
        _scheduleFeedReload()
      }
    )

    // Profiles: INSERT (new maestro registration)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'profiles' },
      (payload) => {
        if (payload.new?.rol === 'maestro') {
          const nombre = payload.new.nombre_completo || 'Un maestro'
          _showBrowserNotification(
            '👤 Nuevo maestro pendiente de aprobación',
            `${nombre} se registró y está esperando aprobación.`
          )
          _scheduleFetch()
          _scheduleFeedReload()
        }
      }
    )

    // Profiles: UPDATE (maestro status changes)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'profiles' },
      (payload) => {
        if (payload.new?.rol === 'maestro') {
          _scheduleFetch()
          _scheduleFeedReload()
        }
      }
    )

    // Asistencias: INSERT (attendance records)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'asistencias' },
      () => _scheduleFeedReload()
    )

    .subscribe((status) => {
      _statusCallback?.(status)
      if (status === 'SUBSCRIBED') {
        _scheduleFetch()
      } else if (status === 'CHANNEL_ERROR' || status === 'SUBSCRIPTION_ERROR') {
        console.warn('[realtimeService] Channel error, will retry on reconnect')
      }
    })

  lifecycle.registerChannel(_channel)
}

/**
 * Stop the Realtime channel.
 */
export function stopAdminRealtimeNotifications() {
  lifecycle.destroy()
  _channel = null
  _badgeCallback = null
  _feedCallback = null
  _statusCallback = null
  clearTimeout(_debounceTimer)
  _debounceTimer = null
}

/**
 * Reset badge to 0 (call when admin enters notifications view).
 */
export function resetAdminNotifBadge() {
  _badgeCallback?.(0)
}
