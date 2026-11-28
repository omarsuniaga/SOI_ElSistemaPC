/**
 * Aplica un item de `sync_queue` contra Supabase (portal de maestros).
 *
 * `sesiones_clase` insert: offline cada autosave de una fecha nueva encola otro
 * `insert` (aún no hay id), y el segundo choca con UNIQUE(clase_id, fecha,
 * maestro_id). En ese caso (23505) se actualiza la fila existente SOLO con
 * contenido y asistencia: un upsert completo podría devolver a borrador una
 * sesión que ya se registró desde otro dispositivo.
 */

import { supabase } from '../../lib/supabaseClient.js'

const UNIQUE_VIOLATION = '23505'

/**
 * Clave de conflicto por tabla para los `upsert` encolados offline. Debe
 * coincidir con una restricción UNIQUE real (verificado en producción el
 * 2026-10-20). `observaciones_sesion` y `observaciones_alumnos` no tienen
 * clave natural única: se escriben por `id` generado en el cliente, que hace
 * el reintento idempotente.
 */
export const UPSERT_KEYS = {
  asistencias: 'clase_id,alumno_id,fecha',
  indicator_attempts: 'session_id,indicator_id,student_id',
  observaciones_sesion: 'id',
  observaciones_alumnos: 'id',
}

/** Error que ningún reintento puede resolver: la cola lo conserva, no lo descarta. */
function permanentError(message) {
  return Object.assign(new Error(message), { permanent: true })
}

function normalizeSesionPayload(payload) {
  const out = { ...payload }
  if (out.contenido_dsl !== undefined) {
    out.contenido = out.contenido_dsl
    delete out.contenido_dsl
  }
  if (out.asistencias !== undefined && out.asistencia === undefined) {
    out.asistencia = out.asistencias
    delete out.asistencias
  }
  return out
}

async function updateExistingSesion({ clase_id, fecha, maestro_id, contenido, asistencia }) {
  const fields = {}
  if (contenido !== undefined) fields.contenido = contenido
  if (asistencia !== undefined) fields.asistencia = asistencia
  const { error } = await supabase
    .from('sesiones_clase')
    .update(fields)
    .eq('clase_id', clase_id)
    .eq('fecha', fecha)
    .eq('maestro_id', maestro_id)
  if (error) throw error
}

/**
 * @param {{ tabla: string, operacion: 'insert'|'update'|'delete'|'upsert', payload: object, onConflict?: string }} item
 */
export async function syncQueueItem(item) {
  const { tabla, operacion } = item
  const payload = tabla === 'sesiones_clase' ? normalizeSesionPayload(item.payload) : { ...item.payload }

  try {
    if (operacion === 'insert') {
      const { error } = await supabase.from(tabla).insert([payload])
      if (error) {
        if (tabla === 'sesiones_clase' && error.code === UNIQUE_VIOLATION) {
          await updateExistingSesion(payload)
        } else {
          throw error
        }
      }
    } else if (operacion === 'update') {
      const { id, ...cleanPayload } = payload
      const { error } = await supabase.from(tabla).update(cleanPayload).eq('id', id)
      if (error) throw error
    } else if (operacion === 'upsert') {
      const onConflict = item.onConflict || UPSERT_KEYS[tabla]
      if (!onConflict) throw permanentError(`[SYNC] upsert sin onConflict conocido para ${tabla}`)
      if (onConflict === 'id' && !payload.id) throw permanentError(`[SYNC] upsert por id sin id en ${tabla}`)
      const { error } = await supabase.from(tabla).upsert(payload, { onConflict })
      if (error) throw error
    } else if (operacion === 'delete') {
      const { error } = await supabase.from(tabla).delete().eq('id', payload.id)
      if (error) throw error
    } else {
      // Antes se daba por sincronizado sin escribir nada: pérdida silenciosa.
      throw permanentError(`[SYNC] operación no soportada: ${operacion} (${tabla})`)
    }
  } catch (err) {
    if (err.code === 'PGRST204') {
      const { data: testData } = await supabase.from(tabla).select().limit(1)
      if (testData?.length > 0) {
        console.warn('[SYNC] Columnas REALES encontradas:', Object.keys(testData[0]))
      } else {
        console.warn('[SYNC] No se pueden leer las columnas. ¿Ejecutaste el SQL en Supabase?')
      }
    }
    console.error('[SYNC] Error crítico:', err)
    throw err
  }
}
