import { supabase } from '../../lib/supabaseClient.js';
import { getMaestroLocal } from '../auth/maestroAuth.js';
import { getMisClases, getHorariosClases, getSesiones } from './maestroDataService.js';
import { onPushReceived } from './pushService.js';

// -- Register Push Notification Handler --
onPushReceived((event) => {
  if (event.event === 'subscriptionChanged') {
    console.log('[Notif] Push subscription changed:', event.subscribed);
  } else if (event.event === 'notificationReceived') {
    console.log('[Notif] Real-time push received:', event.notification);
    
    // RECORD: Mark as received to prevent polling duplicate
    _recordNotificationReceived(event.notification);
    
    // ADD to cache if not already there
    const exists = notificacionesCache.some(n => n.id === event.notification.id);
    if (!exists) {
      notificacionesCache.unshift({
        ...event.notification,
        created_at: event.notification.created_at || new Date().toISOString()
      });
      notifyListeners();
    }
  }
});

// -- Deduplication Configuration --
// Realtime es la fuente primaria. Polling cada 5 min es el fallback.
export const POLL_INTERVAL_MS = 30 * 1000;  // 30 segundos (NOTIF-04)
export const DEDUP_WINDOW_MS  = 60 * 1000;        // 1 minuto
export const DEDUP_EXPIRY_MS  = 120 * 1000;        // 2 minutos

// -- Deduplication State --
const _recentNotificationKeys = new Map(); // Map<key, expiryTime>

export function _generateDeduplicationKey(notification) {
  const tipo = notification.tipo || 'unknown';
  const relatedId = notification.clase_id || notification.alumno_id || notification.id || 'generic';
  const minuteBucket = Math.floor(Date.now() / DEDUP_WINDOW_MS);
  return `${tipo}:${relatedId}:${minuteBucket}`;
}

function _cleanExpiredDeduplicationKeys() {
  const now = Date.now();
  for (const [key, expiryTime] of _recentNotificationKeys.entries()) {
    if (now > expiryTime) {
      _recentNotificationKeys.delete(key);
    }
  }
}

export function _isDuplicateNotification(notification) {
  _cleanExpiredDeduplicationKeys();
  const key = _generateDeduplicationKey(notification);
  return _recentNotificationKeys.has(key);
}

export function _recordNotificationReceived(notification) {
  const key = _generateDeduplicationKey(notification);
  const expiryTime = Date.now() + DEDUP_EXPIRY_MS;
  _recentNotificationKeys.set(key, expiryTime);
}

/**
 * Returns the count of deduplicated notifications in the current dedup window.
 * Used by the UI to show a badge indicating how many duplicates were filtered.
 * @returns {number}
 */
export function getDedupCount() {
  _cleanExpiredDeduplicationKeys();
  return _recentNotificationKeys.size;
}

// -- Persistencia del inbox en localStorage ----------------------------------
// El inbox sobrevive F5 sin necesidad de un fetch extra al arrancar.

function _cacheKey(maestroId) {
  return `notif_cache_${maestroId}`;
}

function _persistCache(maestroId) {
  try {
    // Solo persistir las últimas 30 y no las locales efimeras
    const toSave = notificacionesCache
      .filter(n => !String(n.id).startsWith('local_'))
      .slice(0, 30);
    localStorage.setItem(_cacheKey(maestroId), JSON.stringify(toSave));
  } catch { /* storage lleno: silenciar */ }
}

function _loadCachedNotifs(maestroId) {
  try {
    const raw = localStorage.getItem(_cacheKey(maestroId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

let notificacionesCache = [];
let listeners = [];

/**
 * Suscribe un callback a los cambios en las notificaciones
 */
export function onNotificacionesChange(callback) {
  listeners.push(callback);
  callback(notificacionesCache);
  return () => {
    listeners = listeners.filter(cb => cb !== callback);
  };
}

function notifyListeners() {
  listeners.forEach(cb => cb([...notificacionesCache]));
}

/**
 * Carga las notificaciones desde Supabase + genera alertas locales del cache.
 */
export async function fetchNotificaciones() {
  const maestro = getMaestroLocal();
  if (!maestro) return [];

  // Pre-cargar desde localStorage para respuesta instantánea
  if (notificacionesCache.length === 0) {
    notificacionesCache = _loadCachedNotifs(maestro.id);
    if (notificacionesCache.length > 0) notifyListeners();
  }

  try {
    const { data, error } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('profile_id', maestro.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.warn('[NotifService] Error fetch:', error);
      return notificacionesCache;
    }

    const newNotifications = (data || []).map(n => ({
      ...n,
      created_at: n.created_at || new Date().toISOString(),
    }));

    // Merge: las notificaciones del servidor son la fuente de verdad,
    // pero conservamos las alertas locales generadas en el cliente.
    const localAlerts = notificacionesCache.filter(n => String(n.id).startsWith('local_'));
    notificacionesCache = [...newNotifications, ...localAlerts];

    await _checkLocalAlerts(maestro.id);
    _persistCache(maestro.id);
    notifyListeners();
    return notificacionesCache;

  } catch (err) {
    console.error('[NotifService]', err);
    return notificacionesCache;
  }
}

/**
 * Genera alertas locales usando datos del prefetch mensual.
 * NO hace queries propias — usa getMisClases, getHorariosClases, getSesiones del cache.
 */
async function _checkLocalAlerts(maestroId) {
  try {
    const hoy = new Date()
    const fechaHoy = hoy.toISOString().split('T')[0]
    const diaHoy = hoy.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase()

    // Datos del cache (instantáneo si prefetchMonthData ya corrió)
    const [clases, sesiones] = await Promise.all([
      getMisClases(),
      getSesiones(maestroId, fechaHoy, fechaHoy),
    ])
    const claseIds = clases.map(c => c.id)
    const clasesMap = Object.fromEntries(clases.map(c => [c.id, c]))

    const horarios = await getHorariosClases(claseIds)
    const horariosHoy = horarios.filter(h => h.dia?.toLowerCase() === diaHoy)

    // Sesiones pendientes/borrador de hoy
    const sesionesPendientes = sesiones.filter(s =>
      s.estado === 'pendiente' || s.estado === 'borrador' || s.borrador === true
    )
    const sesionesRegistradas = new Set(
      sesiones.filter(s => s.borrador === false || s.estado === 'registrada').map(s => s.clase_id)
    )

    const ahora = new Date()

    // Alerta: clases que ya terminaron y no se registraron
    for (const h of horariosHoy) {
      if (!h.hora_fin || sesionesRegistradas.has(h.clase_id)) continue

      const [hh, mm] = h.hora_fin.split(':')
      const finClase = new Date()
      finClase.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0)

      const minutosDesdeElFin = (ahora - finClase) / 60000
      if (minutosDesdeElFin < 30) continue

      const clase = clasesMap[h.clase_id]
      const refId = `${h.clase_id}_${fechaHoy}`
      const exists = notificacionesCache.some(n => n.referencia_id === refId && n.tipo === 'in_app')
      if (exists) continue

      notificacionesCache.unshift({
        id: 'local_' + refId,
        tipo: 'in_app',
        titulo: 'Clase sin registrar',
        mensaje: `${clase?.nombre || 'Tu clase'} terminó hace ${Math.round(minutosDesdeElFin)} min y no registraste asistencia.`,
        estado: 'pendiente',
        created_at: new Date().toISOString(),
        referencia_id: refId,
      })
    }

    // Alerta: clase por empezar (próximos 15 minutos)
    for (const h of horariosHoy) {
      if (!h.hora_inicio) continue
      const [hh, mm] = h.hora_inicio.split(':')
      const inicioClase = new Date()
      inicioClase.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0)

      const minutosParaInicio = (inicioClase - ahora) / 60000
      if (minutosParaInicio < 0 || minutosParaInicio > 15) continue

      const clase = clasesMap[h.clase_id]
      const refId = `prox_${h.clase_id}_${fechaHoy}`
      const exists = notificacionesCache.some(n => n.referencia_id === refId)
      if (exists) continue

      notificacionesCache.unshift({
        id: 'local_' + refId,
        tipo: 'recordatorio_clase',
        titulo: 'Clase por empezar',
        mensaje: `${clase?.nombre || 'Tu clase'} empieza en ${Math.round(minutosParaInicio)} minutos.`,
        estado: 'pendiente',
        created_at: new Date().toISOString(),
        referencia_id: refId,
      })
    }

  } catch (e) {
    console.warn('[NotifService] Error local alerts:', e);
  }
}

export async function marcarLeida(id) {
  const maestro = getMaestroLocal();
  const notif = notificacionesCache.find(n => n.id === id);
  if (notif) notif.estado = 'leida';
  notifyListeners();
  if (maestro) _persistCache(maestro.id);

  if (String(id).startsWith('local_')) return;

  try {
    await supabase.from('notificaciones')
      .update({ estado: 'leida', leida_en: new Date().toISOString() })
      .eq('id', id);
  } catch (e) {
    console.warn('[NotifService] Error al marcar leída', e);
  }
}

export async function marcarTodasLeidas() {
  const maestro = getMaestroLocal();
  notificacionesCache.forEach(n => { if (n.estado !== 'leida') n.estado = 'leida'; });
  notifyListeners();
  if (maestro) _persistCache(maestro.id);

  if (!maestro) return;

  try {
    await supabase
      .from('notificaciones')
      .update({ estado: 'leida', leida_en: new Date().toISOString() })
      .eq('profile_id', maestro.id)
      .neq('estado', 'leida');
  } catch (e) {
    console.warn('[NotifService] Error al marcar todas', e);
  }
}

export function getUnreadCount() {
  return notificacionesCache.filter(n => n.estado === 'pendiente' || n.estado === 'enviada').length;
}

// ── Supabase Realtime ───────────────────────────────────────────────────────────────
// Canal de escucha en tiempo real de cambios en la tabla `notificaciones`.
// Esto reemplaza al polling como fuente primaria; el polling queda como fallback.

let _realtimeChannel = null;

/**
 * Inicia el canal Supabase Realtime para notificaciones del maestro actual.
 * Llamar una vez después del login, desde main-maestros.js.
 */
export function startRealtime() {
  const maestro = getMaestroLocal();
  if (!maestro) return;

  // No abrir dos canales para el mismo maestro
  if (_realtimeChannel) return;

  _realtimeChannel = supabase
    .channel(`notificaciones:${maestro.id}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notificaciones',
        filter: `profile_id=eq.${maestro.id}`,
      },
      (payload) => {
        const notif = {
          ...payload.new,
          created_at: payload.new.created_at || new Date().toISOString(),
        };

        // Evitar duplicado si el polling ya trajo esta notif
        const exists = notificacionesCache.some(n => n.id === notif.id);
        if (exists) return;

        // Insertar al inicio del inbox
        notificacionesCache.unshift(notif);
        _persistCache(maestro.id);
        notifyListeners();

        // Toast in-app: avisa sin necesidad de abrir el panel
        _showInAppToast(notif);

        console.log('[Realtime] Nueva notificación recibida:', notif.titulo);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'notificaciones',
        filter: `profile_id=eq.${maestro.id}`,
      },
      (payload) => {
        // Actualizar en cache (ej: estado = 'leida' hecho desde otro dispositivo)
        const idx = notificacionesCache.findIndex(n => n.id === payload.new.id);
        if (idx !== -1) {
          notificacionesCache[idx] = { ...notificacionesCache[idx], ...payload.new };
          _persistCache(maestro.id);
          notifyListeners();
        }
      }
    )
    .subscribe((status) => {
      console.log(`[Realtime] Canal notificaciones: ${status}`);
      if (status === 'CHANNEL_ERROR') {
        // Si el canal falla, el polling de 5 min lo cubre
        console.warn('[Realtime] Canal cerrado, el polling de fallback sigue activo.');
        _realtimeChannel = null;
      }
    });
}

/**
 * Cierra el canal Realtime. Llamar al hacer logout.
 */
export function stopRealtime() {
  if (_realtimeChannel) {
    supabase.removeChannel(_realtimeChannel);
    _realtimeChannel = null;
  }
}

// -- Toast in-app ------------------------------------------------------------------
// Notificación flotante in-app que aparece cuando llega un evento Realtime
// y el panel de notificaciones NO está abierto.

function _showInAppToast(notif) {
  // Si el panel está abierto, no hace falta el toast
  if (document.getElementById('pm-notificaciones-drawer-overlay')?.classList.contains('open')) return;

  const existing = document.getElementById('pm-notif-inapp-toast');
  if (existing) existing.remove();

  const icon = _toastIcon(notif.tipo);
  const toast = document.createElement('div');
  toast.id = 'pm-notif-inapp-toast';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <div class="pm-iat-content">
      <div class="pm-iat-icon">${icon}</div>
      <div class="pm-iat-text">
        <strong class="pm-iat-title">${notif.titulo || 'Nueva notificación'}</strong>
        <span class="pm-iat-msg">${notif.mensaje || ''}</span>
      </div>
      <button class="pm-iat-close" aria-label="Cerrar">×</button>
    </div>
  `;
  document.body.appendChild(toast);
  _injectToastStyles();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('pm-iat-visible'));
  });

  const dismiss = () => {
    toast.classList.remove('pm-iat-visible');
    setTimeout(() => toast.remove(), 350);
  };

  toast.querySelector('.pm-iat-close').addEventListener('click', dismiss);
  toast.addEventListener('click', (e) => {
    if (!e.target.classList.contains('pm-iat-close')) {
      // Abrir panel de notificaciones al hacer clic en el toast
      document.getElementById('pm-bell-btn')?.click();
      dismiss();
    }
  });

  // Auto-dismiss en 6 segundos
  setTimeout(dismiss, 6000);
}

function _toastIcon(tipo) {
  const map = {
    sesion_sin_registrar: '⚠️',
    recordatorio_clase:   '⏰',
    mensaje_admin:        '📣',
    tarea_vencida:        '📕',
    in_app:               '🔔',
  };
  return map[tipo] || '🔔';
}

let _toastStylesInjected = false;
function _injectToastStyles() {
  if (_toastStylesInjected) return;
  _toastStylesInjected = true;
  const s = document.createElement('style');
  s.textContent = `
    #pm-notif-inapp-toast {
      position: fixed;
      top: 72px;
      right: 16px;
      z-index: 10002;
      max-width: 340px;
      width: calc(100vw - 32px);
      opacity: 0;
      transform: translateY(-12px);
      transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1);
      cursor: pointer;
    }
    #pm-notif-inapp-toast.pm-iat-visible {
      opacity: 1;
      transform: translateY(0);
    }
    .pm-iat-content {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: rgba(22, 22, 30, 0.96);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 12px 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.35);
    }
    .pm-iat-icon { font-size: 22px; flex-shrink: 0; line-height: 1.4; }
    .pm-iat-text { flex: 1; min-width: 0; }
    .pm-iat-title {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 2px;
    }
    .pm-iat-msg {
      display: block;
      font-size: 12px;
      color: rgba(255,255,255,0.6);
      line-height: 1.4;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .pm-iat-close {
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.35);
      font-size: 18px;
      cursor: pointer;
      padding: 0 2px;
      line-height: 1;
      flex-shrink: 0;
      transition: color 0.2s;
    }
    .pm-iat-close:hover { color: #fff; }
    @media (max-width: 400px) {
      #pm-notif-inapp-toast { right: 8px; max-width: calc(100vw - 16px); }
    }
  `;
  document.head.appendChild(s);
}

// ── Polling controlado ──────────────────────────────────────────────────────
let _pollIntervalId = null;

function _startPolling() {
  if (_pollIntervalId !== null) return;
  _pollIntervalId = setInterval(() => {
    if (document.visibilityState === 'hidden') return;
    fetchNotificaciones();
  }, POLL_INTERVAL_MS);
}

function _stopPolling() {
  if (_pollIntervalId !== null) {
    clearInterval(_pollIntervalId);
    _pollIntervalId = null;
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    fetchNotificaciones();
    _startPolling();
  } else {
    _stopPolling();
  }
});

function _cleanStaleLocalAlerts() {
  const todayPrefix = new Date().toISOString().split('T')[0];
  notificacionesCache = notificacionesCache.filter(n => {
    if (!String(n.id).startsWith('local_')) return true;
    return n.referencia_id?.includes(todayPrefix);
  });
}

_cleanStaleLocalAlerts();

if (document.visibilityState !== 'hidden') {
  _startPolling();
}
