/**
 * offlineSyncAdapter.js — Motor de Persistencia Offline-First (IndexedDB / Sync Queue)
 *
 * Cola de evaluaciones por estrellas pendientes de sincronizar con el backend.
 * Persistida en IndexedDB (vía `idb`, ya usado en el proyecto — ver
 * src/portal-maestros/services/offlineQueue.js) en vez de localStorage: soporta
 * una cola que puede crecer, con borrado transaccional por item.
 *
 * ── Bug corregido (C-5) ──
 * `sincronizarEnSegundoPlano()` nunca se invocaba desde ningún lugar del código:
 * las evaluaciones guardadas con `guardarLocal()` quedaban en el navegador para
 * siempre y `limpiarCola()` (que borraba TODA la cola) solo se llamaba desde ese
 * mismo método muerto. Ver `initOfflineSync()` más abajo, que ahora sí dispara la
 * sincronización al arrancar y al recuperar conexión.
 */

import { openDB } from 'idb'
import { supabase } from '../../../lib/supabaseClient.js'
import { registrarEvaluacion } from '../services/evaluacionClaseService.js'

const DB_NAME = 'planificacion-eval-queue'
const DB_VERSION = 1
const STORE_NAME = 'evaluaciones'
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function _isUuid(value) {
  return typeof value === 'string' && UUID_REGEX.test(value)
}

function _isVirtualLikeId(value) {
  return typeof value === 'string' && /^(nd|demo|local|obj|ind|al|clase|nodo|alu|mae|stu|ses|plan|route|node|tarea|item|preview|temp)[-_]/i.test(value)
}

function _shouldSkipItem(item) {
  return [item?.alumnoId, item?.claseId, item?.nodoId].some((value) => {
    return typeof value === 'string' && !_isUuid(value) && _isVirtualLikeId(value)
  })
}

/** @type {Promise<import('idb').IDBPDatabase> | null} */
let _dbPromise = null

async function _getDB() {
  if (!_dbPromise) {
    _dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        }
      },
    })
  }
  return _dbPromise
}

/**
 * Clave estable por combinación alumno+clase+nodo: reevaluar al mismo alumno
 * en el mismo nodo actualiza (put) el registro en cola en vez de acumular
 * entradas duplicadas — esto es lo que evita que la cola crezca sin límite
 * (antes cada tap de estrella agregaba una fila nueva que nunca se limpiaba).
 * @param {{alumnoId?: string, claseId?: string, nodoId?: string}} item
 * @returns {string}
 */
function _claveItem({ alumnoId, claseId, nodoId } = {}) {
  return `${alumnoId ?? ''}::${claseId ?? ''}::${nodoId ?? ''}`
}

export class OfflineSyncAdapter {
  /**
   * Guarda (o actualiza) una evaluación en la cola local si no hay red o para
   * respuesta inmediata. No lanza si IndexedDB falla — es best-effort, igual
   * que el resto de la persistencia offline del proyecto.
   * @param {Object} evaluacionPayload — { alumnoId, claseId, nodoId, estrellas, ... }
   */
  static async guardarLocal(evaluacionPayload) {
    try {
      const db = await _getDB()
      await db.put(STORE_NAME, {
        ...evaluacionPayload,
        id: _claveItem(evaluacionPayload),
        timestamp: new Date().toISOString(),
        pendingSync: true,
      })
    } catch (e) {
      console.warn('[OfflineSyncAdapter] No se pudo guardar en la cola offline:', e)
    }
  }

  /**
   * Obtiene todos los registros pendientes de sincronización.
   * @returns {Promise<Array<Object>>}
   */
  static async obtenerCola() {
    try {
      const db = await _getDB()
      return await db.getAll(STORE_NAME)
    } catch (e) {
      console.warn('[OfflineSyncAdapter] No se pudo leer la cola offline:', e)
      return []
    }
  }

  /**
   * Elimina UN item de la cola (tras sincronizarlo con éxito), en vez de
   * vaciar la cola entera. Acepta el item completo (usa su `id`) o los
   * campos alumnoId/claseId/nodoId para recalcular la clave.
   * @param {Object} item
   */
  static async eliminarDeCola(item) {
    try {
      const db = await _getDB()
      const id = item?.id ?? _claveItem(item)
      await db.delete(STORE_NAME, id)
    } catch (e) {
      console.warn('[OfflineSyncAdapter] No se pudo eliminar un item de la cola offline:', e)
    }
  }

  /**
   * Limpia TODA la cola. Uso: reset manual / tests. La sincronización normal
   * ya no llama esto — usa `eliminarDeCola()` por item (ver `sincronizarEnSegundoPlano`).
   */
  static async limpiarCola() {
    try {
      const db = await _getDB()
      const tx = db.transaction(STORE_NAME, 'readwrite')
      await tx.store.clear()
      await tx.done
    } catch (e) {
      console.warn('[OfflineSyncAdapter] No se pudo limpiar la cola offline:', e)
    }
  }

  /**
   * Ejecuta la sincronización en segundo plano con la API remota.
   *
   * Procesa la cola item por item: si `remoteSyncFn(item)` tiene éxito, ese
   * item (y solo ese) se elimina de la cola; si falla, se deja encolado para
   * el próximo intento — así una falla puntual no descarta el resto de la
   * cola (antes `limpiarCola()` vaciaba todo o nada).
   *
   * Idempotente y segura ante llamadas concurrentes/repetidas: si ya hay una
   * sincronización en curso, las llamadas adicionales reutilizan esa misma
   * promesa en vez de reprocesar la cola en paralelo (evita doble-envío del
   * mismo item).
   *
   * @param {(item: object) => Promise<void>} remoteSyncFn
   * @returns {Promise<{synced: number, failed: number}>}
   */
  static async sincronizarEnSegundoPlano(remoteSyncFn) {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return { synced: 0, failed: 0 }
    }
    if (typeof remoteSyncFn !== 'function') {
      return { synced: 0, failed: 0 }
    }

    if (_syncEnCurso) return _syncEnCurso

    _syncEnCurso = _procesarCola(remoteSyncFn).finally(() => {
      _syncEnCurso = null
    })
    return _syncEnCurso
  }
}

/** Guard anti doble-procesamiento: ver `sincronizarEnSegundoPlano`. */
let _syncEnCurso = null

function _isPermanentSyncError(err) {
  if (!err) return false
  const code = err.code || err?.error?.code
  const msg = (err.message || err?.error?.message || err?.details || String(err)).toLowerCase()

  // Códigos Postgres / PostgREST irrecuperables (foreign key, not null, check constraint, invalid UUID)
  if (['23503', '23502', '23514', '22P02', '42P01', 'PGRST116'].includes(String(code))) {
    return true
  }

  // Patrones textuales de violación de integridad
  if (
    msg.includes('foreign key') ||
    msg.includes('is not present in table') ||
    msg.includes('violates check constraint') ||
    msg.includes('invalid input syntax for type uuid')
  ) {
    return true
  }

  return false
}

async function _procesarCola(remoteSyncFn) {
  const queue = await OfflineSyncAdapter.obtenerCola()
  if (queue.length === 0) return { synced: 0, failed: 0 }

  let synced = 0
  let failed = 0

  for (const item of queue) {
    if (_shouldSkipItem(item)) {
      await OfflineSyncAdapter.eliminarDeCola(item)
      console.warn('[OfflineSyncAdapter] Se omite un item con identificadores virtuales/no UUID:', item)
      continue
    }

    try {
      await remoteSyncFn(item)
      await OfflineSyncAdapter.eliminarDeCola(item)
      synced++
    } catch (err) {
      if (_isPermanentSyncError(err)) {
        await OfflineSyncAdapter.eliminarDeCola(item)
        console.warn('[OfflineSyncAdapter] Se descarta item de la cola por error irrecuperable en base de datos (registro inexistente/FK):', err?.message || err)
      } else {
        failed++
        console.warn('[OfflineSyncAdapter] Falló la sincronización de un item, se mantiene en cola para reintentar:', err)
      }
    }
  }

  console.log(`[OfflineSyncAdapter] Sincronización offline: ${synced} ok, ${failed} pendiente(s).`)
  return { synced, failed }
}

// ─────────────────────────────────────────────────────────────────────────
// remoteSyncFn real — evaluacion_indicador (desplegada vía
// 20260730000001_deploy_evaluacion_indicador.sql con RLS corregido)
// ─────────────────────────────────────────────────────────────────────────
//
// Mapeo del payload offline:
//   alumnoId → alumno_id (FK → public.alumnos)
//   nodoId   → indicator_id (FK → public.indicators)
//   claseId  → clase_id (FK → public.clases)
//   estrellas → nota (1-5) + estado derivado
//
// estrellas=0 se mapea a nota:null, estado:'sin_evaluar' porque la columna
// nota tiene CHECK (nota BETWEEN 1 AND 5) — NUNCA insertar nota:0.

const MAPA_ESTRELLAS_A_ESTADO = {
  0: 'sin_evaluar',
  1: 'inicia',
  2: 'en_progreso',
  3: 'avanzado',
  4: 'avanzado',
  5: 'dominado',
}

/**
 * @param {{alumnoId: string, claseId: string, nodoId: string, estrellas: number}} item
 * @returns {Promise<void>}
 */
async function _remoteSyncEvaluacion(item) {
  if (!item.alumnoId || !item.claseId || !item.nodoId) {
    throw new Error(
      '[OfflineSyncAdapter] Item inválido: faltan campos requeridos: ' +
        JSON.stringify(item),
    )
  }

  const nota = item.estrellas > 0 ? item.estrellas : null
  const estado = MAPA_ESTRELLAS_A_ESTADO[item.estrellas] ?? 'sin_evaluar'

  let evaluadoPor = null
  try {
    const { data: { user } } = await supabase.auth.getUser()
    evaluadoPor = user?.id ?? null
  } catch {
    // Sin sesión detectable: se envía sin evaluado_por (RLS requiere
    // evaluado_por = auth.uid() en INSERT, así que esto fallará si la
    // tabla tiene RLS activo y el usuario no está autenticado — que es
    // exactamente el comportamiento correcto: no sincronizar sin sesión.
  }

  await registrarEvaluacion({
    alumno_id: item.alumnoId,
    indicator_id: item.nodoId,
    clase_id: item.claseId,
    nota,
    estado,
    evaluado_por: evaluadoPor,
  })
}

let _initialized = false

/**
 * Inicializa el motor de sincronización offline-first (fix de C-5):
 *  - Dispara una sincronización inicial en el próximo tick (no bloquea el
 *    render inicial de la vista).
 *  - Reintenta automáticamente cuando el navegador recupera conectividad.
 *
 * Segura de llamar más de una vez (no registra listeners duplicados).
 *
 * @param {(item: object) => Promise<void>} [remoteSyncFn] — por defecto,
 *   `_remoteSyncEvaluacion` que escribe en evaluacion_indicador.
 */
export function initOfflineSync(remoteSyncFn = _remoteSyncEvaluacion) {
  if (_initialized) return
  _initialized = true

  if (typeof window === 'undefined') return

  setTimeout(() => {
    OfflineSyncAdapter.sincronizarEnSegundoPlano(remoteSyncFn)
  }, 0)

  window.addEventListener('online', () => {
    OfflineSyncAdapter.sincronizarEnSegundoPlano(remoteSyncFn)
  })
}
