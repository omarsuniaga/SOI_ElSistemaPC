/**
 * PushService — Gestión de Web Push para el Portal Maestros.
 * Suscripción, permisos, preferencias y scheduling de alertas locales.
 */

import { openDB } from 'idb'
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

// ── Auth bridge (IndexedDB) para el Service Worker ──────────────────
// El SW no tiene localStorage ni import.meta.env: necesita el JWT de sesión y la
// VAPID key persistidos aquí para poder autenticar llamadas en background
// (pushsubscriptionchange, botones de acción) con el teléfono bloqueado.
const BRIDGE_DB_NAME = 'soi-push-bridge'
const BRIDGE_DB_VERSION = 1
const BRIDGE_STORE = 'kv'

async function _getBridgeDB() {
  return openDB(BRIDGE_DB_NAME, BRIDGE_DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(BRIDGE_STORE)) {
        db.createObjectStore(BRIDGE_STORE, { keyPath: 'key' })
      }
    },
  })
}

async function _syncAuthBridge(session) {
  try {
    const db = await _getBridgeDB()
    const tx = db.transaction(BRIDGE_STORE, 'readwrite')
    await Promise.all([
      tx.store.put({ key: 'access_token', value: session?.access_token || null }),
      tx.store.put({ key: 'refresh_token', value: session?.refresh_token || null }),
      tx.store.put({ key: 'supabase_url', value: import.meta.env.VITE_SUPABASE_URL || null }),
      tx.store.put({
        key: 'supabase_anon_key',
        value: import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_KEY ?? null,
      }),
      tx.store.put({ key: 'vapid_public_key', value: import.meta.env.VITE_VAPID_PUBLIC_KEY || null }),
    ])
    await tx.done
  } catch (err) {
    console.warn('[Push] No se pudo sincronizar el bridge de autenticación del SW:', err.message)
  }
}

function _decodeJwtIat(token) {
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    )
    return JSON.parse(json).iat || 0
  } catch {
    return 0
  }
}

/**
 * Los refresh_token de Supabase son de un solo uso (rotan al canjearse). El SW puede
 * refrescar la sesión en background (teléfono bloqueado, sin este hilo vivo) para poder
 * ejecutar acciones autenticadas; si esta pestaña luego intenta refrescar con su propio
 * refresh_token ya rotado, Supabase lo rechaza y desloguea al maestro sin motivo aparente.
 * Por eso, al iniciar, se adopta la sesión del bridge si es más nueva que la propia.
 */
async function _reconcileSessionFromBridge() {
  try {
    const db = await _getBridgeDB()
    const [accessRec, refreshRec] = await Promise.all([
      db.get(BRIDGE_STORE, 'access_token'),
      db.get(BRIDGE_STORE, 'refresh_token'),
    ])
    const bridgeAccessToken = accessRec?.value
    const bridgeRefreshToken = refreshRec?.value
    if (!bridgeAccessToken || !bridgeRefreshToken) return

    const { data: { session } = {} } = await supabase.auth.getSession()
    const currentAccessToken = session?.access_token
    if (currentAccessToken === bridgeAccessToken) return

    const bridgeIsNewer = _decodeJwtIat(bridgeAccessToken) > (currentAccessToken ? _decodeJwtIat(currentAccessToken) : 0)
    if (!bridgeIsNewer) return

    const { error } = await supabase.auth.setSession({
      access_token: bridgeAccessToken,
      refresh_token: bridgeRefreshToken,
    })
    if (error) {
      console.warn('[Push] No se pudo adoptar la sesión refrescada en background por el SW:', error.message)
    }
  } catch (err) {
    console.warn('[Push] Error reconciliando sesión con el bridge:', err.message)
  }
}

// Mantener el bridge al día ante login, refresh de token y logout. Al cargar, primero se
// reconcilia con lo que el SW haya refrescado en background (ver _reconcileSessionFromBridge).
if (supabase?.auth?.onAuthStateChange) {
  _reconcileSessionFromBridge().finally(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      _syncAuthBridge(session)
    })
  })
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

    // Asegurar que el SW tenga credenciales frescas para re-suscripción/acciones en background
    const { data: { session } = {} } = await supabase.auth.getSession()
    await _syncAuthBridge(session)

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
