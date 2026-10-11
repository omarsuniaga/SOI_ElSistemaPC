/**
 * Recupera el contenido de clase que quedó en la cola offline.
 *
 * Al reabrir una clase la vista carga `sesiones_clase.contenido` del servidor.
 * Si el maestro escribió sin red, ese texto vive solo en `sync_queue`; sin esta
 * lectura el editor abriría con el texto viejo (o vacío) y el pendiente parecería
 * perdido.
 */

import { getQueue } from './offlineQueue.js'

/**
 * @param {Array<object>} queue - Items de `sync_queue`, en orden FIFO.
 * @param {{ sesionId?: string|null, claseId?: string|null, fecha?: string|null }} target
 * @returns {{ contenido: string, created_at: string, fallido: boolean } | null}
 *   El contenido pendiente más reciente de esa sesión, o null.
 */
export function findPendingSessionContent(queue, { sesionId = null, claseId = null, fecha = null } = {}) {
  let found = null
  for (const item of queue || []) {
    if (item?.tabla !== 'sesiones_clase') continue
    const p = item.payload || {}
    if (!('contenido' in p) && !('contenido_dsl' in p)) continue
    const matchesId = sesionId && p.id === sesionId
    const matchesNatural = claseId && fecha && p.clase_id === claseId && p.fecha === fecha
    if (!matchesId && !matchesNatural) continue
    found = {
      contenido: p.contenido ?? p.contenido_dsl ?? '',
      created_at: item.created_at,
      fallido: Boolean(item.fallido),
    }
  }
  return found
}

/** Lee la cola real y busca el pendiente de la sesión. Nunca lanza. */
export async function loadPendingSessionContent(target) {
  try {
    return findPendingSessionContent(await getQueue(), target)
  } catch (err) {
    console.warn('[pendingSessionContent] No se pudo leer la cola offline:', err)
    return null
  }
}

/**
 * Decide qué texto mostrar al reabrir: el pendiente solo gana si es más reciente
 * que lo que tiene el servidor.
 *
 * @returns {{ content: string, source: 'server'|'queue' }}
 */
export function pickContentToShow({ serverContent = '', serverUpdatedAt = null, pending = null } = {}) {
  if (!pending) return { content: serverContent || '', source: 'server' }
  const serverTime = serverUpdatedAt ? Date.parse(serverUpdatedAt) : 0
  const pendingTime = pending.created_at ? Date.parse(pending.created_at) : Infinity
  if (pendingTime >= serverTime) return { content: pending.contenido, source: 'queue' }
  return { content: serverContent || '', source: 'server' }
}
