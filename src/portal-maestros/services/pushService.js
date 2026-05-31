/**
 * PushService — Gestión de Web Push para el Portal Maestros.
 * Suscripción, permisos, preferencias y scheduling de alertas locales.
 */

import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'

// ── Preferencias locales (fallback rápido antes de cargar de Supabase) ──

const DEFAULT_PREFS = {
  alerta_pre_clase: true,
  min_antes_clase: 15,
  alerta_post_clase: true,
  min_post_clase_sin_registro: 60,
  alerta_24h: true,
  alerta_48h: true,
  push_activo: false,
  recordatorios_activos: true,
}

// ── Push Received Callbacks ───────────────────────────────────────
// Array de callbacks: múltiples módulos pueden suscribirse sin pisarse.
const _pushCallbacks = [];

function _notifyPushCallbacks(event) {
  _pushCallbacks.forEach(cb => {
    try { cb(event); } catch (e) { console.warn('[Push] callback error:', e); }
  });
}

/**
 * Registra un callback para eventos push. Devuelve una función de desuscripción.
 */
export function onPushReceived(callback) {
  _pushCallbacks.push(callback);
  return () => {
    const idx = _pushCallbacks.indexOf(callback);
    if (idx !== -1) _pushCallbacks.splice(idx, 1);
  };
}

// ── Listen for SW messages ───────────────────────────────────
let _swMessageListener = null;

if ('serviceWorker' in navigator) {
  _swMessageListener = (event) => {
    if (event.data && event.data.type === 'PUSH_RECEIVED') {
      console.log('[Push] Notification received from SW:', event.data.notification);
      if (_pushCallbacks.length) {
        _notifyPushCallbacks({
          event: 'notificationReceived',
          notification: event.data.notification
        });
      }
    }
  };
  navigator.serviceWorker.addEventListener('message', _swMessageListener);
}

let _prefsCache = null

/**
 * Carga preferencias desde Supabase (o devuelve defaults).
 */
export async function getNotificationPreferences() {
  if (_prefsCache) return _prefsCache

  const maestro = getMaestroLocal()
  if (!maestro) return DEFAULT_PREFS

  const profileId = maestro.user_id || maestro.id
  if (!profileId) return DEFAULT_PREFS

  try {
    const { data } = await supabase
      .from('configuracion_recordatorios')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle()

    _prefsCache = data ? { ...DEFAULT_PREFS, ...data } : DEFAULT_PREFS
    return _prefsCache
  } catch {
    return DEFAULT_PREFS
  }
}

/**
 * Guarda preferencias en Supabase (upsert por profile_id).
 */
export async function saveNotificationPreferences(prefs) {
  const maestro = getMaestroLocal()
  if (!maestro) return { error: 'No hay sesión' }

  const profileId = maestro.user_id || maestro.id
  if (!profileId) return { error: 'No hay user_id asociado' }

  const payload = {
    profile_id: profileId,
    ...prefs,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('configuracion_recordatorios')
    .upsert(payload, { onConflict: 'profile_id' })

  if (!error) _prefsCache = { ...DEFAULT_PREFS, ...payload }
  return { error }
}

export function invalidatePrefsCache() {
  _prefsCache = null
}

// ── Permisos y suscripción Push ──

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return { granted: false, error: 'El navegador no soporta notificaciones' }
  }
  if (Notification.permission === 'granted') return { granted: true }
  if (Notification.permission === 'denied') {
    return { granted: false, error: 'Permiso denegado. Habilita en configuración del navegador.' }
  }
  const permission = await Notification.requestPermission()
  return { granted: permission === 'granted' }
}

/**
 * Suscribe al usuario a Web Push y guarda endpoint+keys en Supabase.
 */
export async function subscribeToPush() {
  if (!isPushSupported()) return { success: false, error: 'Push no soportado' }

    const maestro = getMaestroLocal()
    if (!maestro) return { success: false, error: 'No hay sesión' }

    const profileId = maestro.user_id || maestro.id
    if (!profileId) return { success: false, error: 'No hay user_id asociado' }

    try {
      const { granted } = await requestNotificationPermission()
      if (!granted) return { success: false, error: 'Permiso de notificaciones no otorgado' }

      const vapidKey = await _getVapidPublicKey()
      if (!vapidKey) return { success: false, error: 'VAPID key no configurada en el servidor' }

      const registration = await navigator.serviceWorker.ready
      let subscription;
      
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: _urlBase64ToUint8Array(vapidKey),
        })
      } catch (subErr) {
        // Si el navegador tiene una suscripción con una llave vieja, la eliminamos y reintentamos
        if (subErr.name === 'InvalidStateError') {
          console.warn('[Push] Llave VAPID diferente detectada. Eliminando suscripción antigua y reintentando...');
          const oldSub = await registration.pushManager.getSubscription();
          if (oldSub) await oldSub.unsubscribe();
          
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: _urlBase64ToUint8Array(vapidKey),
          });
        } else {
          throw subErr;
        }
      }

      // Guardar endpoint+keys en Supabase
      const subJSON = subscription.toJSON()
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          profile_id: profileId,
          endpoint: subJSON.endpoint,
          p256dh: subJSON.keys.p256dh,
          auth: subJSON.keys.auth,
          user_agent: navigator.userAgent,
          activo: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'endpoint' })

    if (error) {
      console.error('[Push] Error guardando suscripción:', error)
      return { success: false, error: error.message }
    }

    // Marcar push_activo en preferencias
    await saveNotificationPreferences({ push_activo: true })

    // Notificar a servicios de la suscripción exitosa
    _notifyPushCallbacks({ event: 'subscriptionChanged', subscribed: true });

    return { success: true, subscription }
  } catch (err) {
    console.error('[Push] Error:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Cancela la suscripción push.
 */
export async function unsubscribeFromPush() {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      const endpoint = subscription.endpoint
      await subscription.unsubscribe()
      await supabase
        .from('push_subscriptions')
        .update({ activo: false, updated_at: new Date().toISOString() })
        .eq('endpoint', endpoint)
    }
    await saveNotificationPreferences({ push_activo: false })

    _notifyPushCallbacks({ event: 'subscriptionChanged', subscribed: false });

    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Verifica si ya hay una suscripción push activa.
 */
export async function isPushSubscribed() {
  if (!isPushSupported()) return false
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    return !!subscription
  } catch {
    return false
  }
}

/**
 * Obtiene estado detallado de suscripción para UI.
 * @returns {Promise<{ subscribed: boolean, endpoint?: string, error?: string }>}
 */
export async function getSubscriptionStatus() {
  if (!isPushSupported()) {
    return { subscribed: false, error: 'El navegador no soporta push notifications' }
  }
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      return {
        subscribed: true,
        endpoint: subscription.endpoint.substring(0, 50) + '...',
      }
    } else {
      return { subscribed: false }
    }
  } catch (err) {
    return { subscribed: false, error: err.message }
  }
}

// ── Alertas locales (SW scheduler) ──

/**
 * Envía datos de horarios al Service Worker para que programe alertas del día.
 * Llamar después del prefetch mensual.
 */
export async function scheduleLocalAlerts(horariosHoy, sesionesRegistradas) {
  if (!('serviceWorker' in navigator)) return

  const prefs = await getNotificationPreferences()
  if (!prefs.recordatorios_activos) return

  const registration = await navigator.serviceWorker.ready
  registration.active?.postMessage({
    type: 'SCHEDULE_ALERTS',
    horarios: horariosHoy,
    sesionesRegistradas: [...sesionesRegistradas],
    prefs: {
      alerta_pre_clase: prefs.alerta_pre_clase,
      min_antes_clase: prefs.min_antes_clase,
      alerta_post_clase: prefs.alerta_post_clase,
      min_post_clase_sin_registro: prefs.min_post_clase_sin_registro,
    },
  })
}

// ── Test ──

export async function testNotification() {
  // 1. Solicitar permisos si no están otorgados
  const { granted } = await requestNotificationPermission()
  if (!granted) return { success: false, error: 'Permiso de notificaciones no otorgado' }

  // 2. Intentar mostrar notificación via Service Worker (fuera del navegador)
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      
      // Notificación via SW (aparece en sistema operativo)
      await registration.showNotification('🔔 Sistema Académico SOI', {
        body: 'Las notificaciones push están configuradas correctamente.',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-96.png',
        vibrate: [200, 100, 200],
        tag: 'test-notification',
        renotify: true,
        data: { url: '/maestros', timestamp: Date.now() },
        actions: [
          { action: 'open', title: 'Abrir App' },
          { action: 'dismiss', title: 'Cerrar' }
        ]
      })
      
      console.log('[Push] Test notification sent via SW')
      return { success: true, method: 'serviceWorker' }
    }
  } catch (swError) {
    console.warn('[Push] SW notification failed, fallback to local:', swError)
  }

  // 3. Fallback: notificación local del navegador
  try {
    new Notification('🔔 Sistema Académico SOI', {
      body: 'Las notificaciones están funcionando correctamente.',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
    })
    return { success: true, method: 'browser' }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

async function _getVapidPublicKey() {
  // Práctica profesional: La llave pública se inyecta en tiempo de compilación/desarrollo
  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
  
  if (!publicKey || publicKey.includes('TU_LLAVE_PUBLICA')) {
    console.error('❌ VITE_VAPID_PUBLIC_KEY no está configurada en tu archivo .env')
    return null
  }
  
  return publicKey
}

function _urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Cleanup push service: removes SW message listener and clears callbacks.
 * Call on logout.
 */
export function cleanupPushService() {
  if (_swMessageListener && 'serviceWorker' in navigator) {
    navigator.serviceWorker.removeEventListener('message', _swMessageListener)
    _swMessageListener = null
  }
  _pushCallbacks.length = 0
  _prefsCache = null
  console.log('[Push] Cleanup completed')
}
