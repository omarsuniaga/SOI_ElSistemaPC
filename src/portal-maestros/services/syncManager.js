/**
 * syncManager — Sincronización automática de la cola offline
 *
 * Escucha el evento `online` del navegador y procesa la cola FIFO
 * de operaciones pendientes contra Supabase.
 *
 * Uso:
 *   import { initSyncManager } from './services/syncManager.js'
 *   initSyncManager()
 */

import { supabase } from '../../lib/supabaseClient.js'
import { processQueue, getQueueCount, getQueue } from './offlineQueue.js'

/** @type {Set<function>} */
const _listeners = new Set()

/**
 * Registra un callback que se dispara cuando cambia el estado de la cola.
 * @param {(count: number, status: 'idle'|'syncing'|'error') => void} fn
 */
export function onSyncStatusChange(fn) {
  _listeners.add(fn)
  return () => _listeners.delete(fn)
}

function _notify(count, status) {
  for (const fn of _listeners) {
    try {
      fn(count, status)
    } catch (_) {}
  }
}

// ─────────────────────────────────────────────────────────────
// Sync handlers por tabla
// ─────────────────────────────────────────────────────────────

/** Mapa: nombre de tabla → función de sync */
const _syncHandlers = {
  sesiones_clase: async (item) => {
    const { operacion, payload } = item
    if (operacion === 'insert') {
      const { error } = await supabase.from('sesiones_clase').insert(payload)
      if (error) throw error
    } else if (operacion === 'update') {
      const { id, ...data } = payload
      const { error } = await supabase
        .from('sesiones_clase')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id || payload.id)
      if (error) throw error
    } else {
      throw new Error(`Operación no soportada para sesiones_clase: ${operacion}`)
    }
  },

  asistencias: async (item) => {
    const { payload } = item
    const { error } = await supabase
      .from('asistencias')
      .upsert(payload, { onConflict: 'clase_id,alumno_id,fecha' })
    if (error) throw error
  },

  observaciones_sesion: async (item) => {
    const { operacion, payload } = item
    if (operacion === 'insert' || operacion === 'upsert') {
      const { error } = await supabase
        .from('observaciones_sesion')
        .upsert(payload, { onConflict: 'sesion_id,maestro_id' })
      if (error) throw error
    } else {
      throw new Error(`Operación no soportada para observaciones_sesion: ${operacion}`)
    }
  },

  observaciones_alumnos: async (item) => {
    const { operacion, payload } = item
    if (operacion === 'upsert') {
      const { error } = await supabase
        .from('observaciones_alumnos')
        .upsert(payload, { onConflict: 'sesion_clase_id,alumno_id' })
      if (error) throw error
    } else {
      throw new Error(`Operación no soportada para observaciones_alumnos: ${operacion}`)
    }
  },

  indicator_attempts: async (item) => {
    const { operacion, payload } = item
    if (operacion === 'upsert') {
      const { error } = await supabase
        .from('indicator_attempts')
        .upsert(payload, { onConflict: 'session_id,indicator_id,student_id' })
      if (error) throw error
    } else {
      throw new Error(`Operación no soportada para indicator_attempts: ${operacion}`)
    }
  },
}

/**
 * Procesa un item de la cola: lo rutea al handler según su tabla.
 * @param {object} item
 */
async function _syncItem(item) {
  const handler = _syncHandlers[item.tabla]
  if (!handler) {
    console.warn(`[syncManager] No hay handler para tabla: ${item.tabla} — se descarta`)
    return // descarta items de tablas desconocidas
  }
  await handler(item)
}

/**
 * Dispara la sincronización de toda la cola pendiente.
 * Se puede llamar manualmente o se dispara automáticamente al reconectar.
 */
export async function attemptSync() {
  const count = await getQueueCount()
  if (count === 0) return { synced: 0, failed: 0 }

  console.log(`[syncManager] Iniciando sync de ${count} item(s)...`)
  _notify(count, 'syncing')

  let synced = 0
  let failed = 0

  await processQueue(async (item) => {
    try {
      await _syncItem(item)
      synced++
    } catch (err) {
      failed++
      console.error(`[syncManager] Error sync ${item.tabla}#${item.id}:`, err.message)
      throw err // processQueue maneja reintentos
    }
  })

  const remaining = await getQueueCount()
  console.log(`[syncManager] Sync completo: ${synced} ok, ${failed} fail, ${remaining} pendientes`)
  _notify(remaining, remaining > 0 ? 'error' : 'idle')

  return { synced, failed, remaining }
}

/** @type {boolean} */
let _initialized = false

/**
 * Inicializa el sync manager.
 * Escucha el evento `online` y dispara la sincronización automática.
 * También escucha cambios de visibilidad para sync al volver a la pestaña.
 */
export function initSyncManager() {
  if (_initialized) return
  _initialized = true

  // Sync al recuperar conexión
  window.addEventListener('online', () => {
    console.log('[syncManager] Conexión recuperada — sincronizando...')
    attemptSync().catch((err) => console.error('[syncManager] Error en sync automático:', err))
  })

  // Sync al volver a la pestaña (por si recuperó conexión mientras estaba en segundo plano)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && navigator.onLine) {
      attemptSync().catch((err) =>
        console.error('[syncManager] Error en sync por visibility:', err),
      )
    }
  })

  // Notificar estado inicial
  getQueueCount().then((count) => _notify(count, count > 0 ? 'idle' : 'idle'))
  console.log('[syncManager] Inicializado — esperando conexión...')
}
