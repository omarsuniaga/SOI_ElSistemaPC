import { supabase } from '../../lib/supabaseClient.js';
import { getMaestroLocal } from '../auth/maestroAuth.js';
import { getMisClases, getHorariosClases, getSesiones } from './maestroDataService.js';

// ── Deduplication Configuration ──
const POLL_INTERVAL_MS = 30 * 1000;  // 30 seconds (configurable)
const DEDUP_WINDOW_MS = 60 * 1000;   // 1 minute
const DEDUP_EXPIRY_MS = 120 * 1000;  // 2 minutes

// ── Deduplication State ──
const _recentNotificationKeys = new Map(); // Map<key, expiryTime>

function _generateDeduplicationKey(notification) {
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

  try {
    const { data, error } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('profile_id', maestro.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.warn('[NotifService] Error fetch:', error);
      return notificacionesCache;
    }

    notificacionesCache = data || [];

    // Generar alertas locales usando datos YA CACHEADOS (0 queries extra)
    await _checkLocalAlerts(maestro.id);

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
  // Optimistic UI
  const notif = notificacionesCache.find(n => n.id === id);
  if (notif) notif.estado = 'leida';
  notifyListeners();

  // Si es local, no hacemos nada en DB
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
  notificacionesCache.forEach(n => {
    if (n.estado !== 'leida') n.estado = 'leida';
  });
  notifyListeners();

  const maestro = getMaestroLocal();
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

// Polling suave (cada 30 segundos)
setInterval(fetchNotificaciones, POLL_INTERVAL_MS);
