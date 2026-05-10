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

// ── Push Received Callback ──
let _onPushReceivedCallback = null;

/**
 * Registra un callback que se ejecuta cuando llega una notificación push
 * o cuando cambia el estado de suscripción.
 */
export function onPushReceived(callback) {
  _onPushReceivedCallback = callback;
}

let _prefsCache = null

/**
 * Carga preferencias desde Supabase (o devuelve defaults).
 */
export async function getNotificationPreferences() {
  if (_prefsCache) return _prefsCache

  const maestro = getMaestroLocal()
  if (!maestro) return DEFAULT_PREFS

  try {
    const { data } = await supabase
      .from('configuracion_recordatorios')
      .select('*')
      .eq('profile_id', maestro.id)
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

  const payload = {
    profile_id: maestro.id,
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

  try {
    const { granted } = await requestNotificationPermission()
    if (!granted) return { success: false, error: 'Permiso de notificaciones no otorgado' }

    const vapidKey = await _getVapidPublicKey()
    if (!vapidKey) return { success: false, error: 'VAPID key no configurada en el servidor' }

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: _urlBase64ToUint8Array(vapidKey),
    })

    // Guardar endpoint+keys en Supabase
    const subJSON = subscription.toJSON()
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        profile_id: maestro.id,
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
    if (_onPushReceivedCallback) {
      _onPushReceivedCallback({ event: 'subscriptionChanged', subscribed: true })
    }

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

    if (_onPushReceivedCallback) {
      _onPushReceivedCallback({ event: 'subscriptionChanged', subscribed: false })
    }

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
  const { granted } = await requestNotificationPermission()
  if (!granted) return false

  new Notification('Portal Maestros', {
    body: 'Las notificaciones están funcionando correctamente.',
    icon: '/icons/icon-192.png',
  })
  return true
}

// ── Helpers ──

async function _getVapidPublicKey() {
  try {
    const { data } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'vapid_public_key')
      .maybeSingle()
    return data?.value || null
  } catch {
    return null
  }
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
