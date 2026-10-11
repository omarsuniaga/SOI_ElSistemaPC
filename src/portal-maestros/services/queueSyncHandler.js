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
 * @param {{ tabla: string, operacion: 'insert'|'update'|'delete', payload: object }} item
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
    } else if (operacion === 'delete') {
      const { error } = await supabase.from(tabla).delete().eq('id', payload.id)
      if (error) throw error
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
