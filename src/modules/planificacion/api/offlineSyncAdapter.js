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

const DB_NAME = 'planificacion-eval-queue'
const DB_VERSION = 1
const STORE_NAME = 'evaluaciones'

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

async function _procesarCola(remoteSyncFn) {
  const queue = await OfflineSyncAdapter.obtenerCola()
  if (queue.length === 0) return { synced: 0, failed: 0 }

  let synced = 0
  let failed = 0

  for (const item of queue) {
    try {
      await remoteSyncFn(item)
      await OfflineSyncAdapter.eliminarDeCola(item)
      synced++
    } catch (err) {
      failed++
      console.warn('[OfflineSyncAdapter] Falló la sincronización de un item, se mantiene en cola para reintentar:', err)
    }
  }

  console.log(`[OfflineSyncAdapter] Sincronización offline: ${synced} ok, ${failed} pendiente(s).`)
  return { synced, failed }
}

// ─────────────────────────────────────────────────────────────────────────
// remoteSyncFn por defecto
// ─────────────────────────────────────────────────────────────────────────
//
// TODO(evaluaciones-offline — requiere decisión humana antes de implementar):
//
// Se buscó un adaptador existente para persistir evaluaciones por estrella
// (alumno + clase + nodo) en Supabase, siguiendo el patrón DataAdapter de este
// módulo. El candidato más cercano es
// `registrarEvaluacion()` en `src/modules/planificacion/services/evaluacionClaseService.js`,
// que escribe en la tabla `evaluacion_indicador` con una forma compatible
// (alumno_id/indicator_id/clase_id/nota/estado).
//
// SIN EMBARGO esa tabla está marcada explícitamente como
// "📦 ARCHIVADO / OMITIDO DE DESPLIEGUE" en la cabecera de
// supabase/migrations/20260722000001_planificacion_rediseño_tablas.sql, y
// supabase/migrations/RECONCILIACION_LEDGER.md la confirma NO aplicada en
// producción (fila: "20260722000001_planificacion_rediseño_tablas.sql |
// class_curriculum_plan, clase_objetivos, evaluacion_indicador | archivada, no
// desplegar" — motivos documentados: RLS permisivo sin WITH CHECK, tablas
// pre-creadas vacías, FK NOT NULL bloqueante). Usar `registrarEvaluacion()`
// aquí escribiría silenciosamente contra una tabla que no existe en
// producción, fallando siempre (o peor: funcionando solo en entornos locales
// donde alguien la creó a mano).
//
// El otro candidato con datos reales en producción, `indicator_attempts`
// (ver handler en src/portal-maestros/services/syncManager.js), tiene una
// forma distinta (session_id/indicator_id/student_id vía
// indicator_sessions) que no se puede derivar del payload actual de
// `guardarLocal()` ({ alumnoId, claseId, nodoId, estrellas }) sin inventar un
// mapeo — tampoco es seguro asumirlo.
//
// Antes de reemplazar este stub hace falta decidir:
//   1) Desplegar `evaluacion_indicador` arreglando los motivos de archivo
//      documentados en RECONCILIACION_LEDGER.md, o
//   2) Elegir explícitamente `indicator_attempts` (u otra tabla) y definir
//      cómo mapear alumnoId/claseId/nodoId/estrellas a su forma real.
//
// Nota para quien lo implemente: `estrellas` es 0-5, donde 0 = "sin evaluar".
// Si el destino es `evaluacion_indicador`, su columna `nota` tiene
// `CHECK (nota BETWEEN 1 AND 5)` — estrellas=0 debe mapearse a
// `nota: null, estado: 'sin_evaluar'`, NUNCA a `nota: 0` (violaría el check).
//
// Mientras tanto, este stub falla siempre a propósito: los items quedan en
// cola indefinidamente (no se pierden) y cada intento de sync los reporta
// como "pendiente" en el log, en vez de sincronizar contra un destino
// adivinado.
/**
 * @param {{alumnoId: string, claseId: string, nodoId: string, estrellas: number}} item
 * @returns {Promise<void>}
 */
async function _remoteSyncEvaluacionTODO(item) {
  throw new Error(
    '[OfflineSyncAdapter] remoteSyncFn no implementado todavía: falta decidir la tabla/RPC destino ' +
      '(ver TODO en offlineSyncAdapter.js). Item pendiente: ' +
      JSON.stringify(item),
  )
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
 * @param {(item: object) => Promise<void>} [remoteSyncFn] — por defecto, el
 *   stub `_remoteSyncEvaluacionTODO` (ver TODO arriba) hasta que se decida el
 *   destino real en Supabase.
 */
export function initOfflineSync(remoteSyncFn = _remoteSyncEvaluacionTODO) {
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
