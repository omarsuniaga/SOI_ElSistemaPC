/**
 * bitacoraSesionService.js — Service layer for sesion_bitacora CRUD
 *
 * Tarea 2.3 (openspec/changes/mapa-gamificado-planificacion): texto libre +
 * 3 toggles independientes (tareas_enviadas / incidencia_comportamiento /
 * clase_no_realizada, cada uno con su campo de detalle opcional) +
 * texto_ia (versión profesionalizada con GROQ — REQ-11).
 *
 * REQ-11: "profesionalizar con IA" MUST mostrar la versión profesionalizada
 * para revisión antes de guardar. `guardarTextoProfesionalizado` enforces
 * that at the service boundary: it refuses to persist `texto_ia` unless the
 * caller explicitly passes `{ aceptadoPorMaestro: true }` — there is no
 * silent auto-save path.
 *
 * REQ-12 (structural isolation, enforced at the DB level too — see
 * migration #6 and its guard test): this file MUST NEVER write to, join
 * against, or otherwise touch `evaluacion_indicador`, `indicators`, or
 * `clase_mapa_indicadores`. The bitácora does not participate in the
 * estrellas calculation under any circumstance.
 *
 * Pattern: pure service functions using the Supabase client directly.
 */

import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Create or update (upsert on the UNIQUE sesion_id) the bitácora for a
 * class session.
 *
 * @param {string} sesionId - ID of the sesiones_clase record
 * @param {object} datos - { clase_id, maestro_id, texto_libre?, tareas_enviadas?, tareas_detalle?, incidencia_comportamiento?, incidencia_detalle?, clase_no_realizada?, motivo_no_realizada? }
 * @returns {Promise<object>} The upserted bitácora record
 */
export async function guardarBitacora(sesionId, datos) {
  if (!sesionId) {
    throw new Error('sesion_id es requerido')
  }

  const row = {
    sesion_id: sesionId,
    clase_id: datos.clase_id,
    maestro_id: datos.maestro_id,
    texto_libre: datos.texto_libre ?? '',
    tareas_enviadas: datos.tareas_enviadas ?? false,
    tareas_detalle: datos.tareas_detalle || null,
    incidencia_comportamiento: datos.incidencia_comportamiento ?? false,
    incidencia_detalle: datos.incidencia_detalle || null,
    clase_no_realizada: datos.clase_no_realizada ?? false,
    motivo_no_realizada: datos.motivo_no_realizada || null,
  }

  const { data, error } = await supabase
    .from('sesion_bitacora')
    .upsert(row, { onConflict: 'sesion_id' })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get the bitácora for a specific session (owner: titular/suplente; ACM:
 * read-only per REQ-16).
 *
 * @param {string} sesionId
 * @returns {Promise<object|null>}
 */
export async function obtenerBitacoraPorSesion(sesionId) {
  const { data, error } = await supabase
    .from('sesion_bitacora')
    .select('*')
    .eq('sesion_id', sesionId)
    .maybeSingle()

  if (error) throw error
  return data || null
}

/**
 * Get all bitácoras for a class, most recent first (REQ-16: ACM read-only
 * history view).
 *
 * @param {string} claseId
 * @returns {Promise<Array<object>>}
 */
export async function obtenerBitacorasPorClase(claseId) {
  const { data, error } = await supabase
    .from('sesion_bitacora')
    .select('*')
    .eq('clase_id', claseId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Persist the GROQ-professionalized version of the bitácora text (REQ-11).
 * MUST NOT be called without the maestro having explicitly reviewed and
 * accepted the AI-generated text — this function refuses to write
 * `texto_ia` unless `aceptadoPorMaestro` is exactly `true`.
 *
 * @param {string} sesionId
 * @param {string} textoIA - the professionalized text
 * @param {object} opts
 * @param {boolean} opts.aceptadoPorMaestro - must be true; enforced acceptance gate
 * @returns {Promise<object>} Updated bitácora record
 */
export async function guardarTextoProfesionalizado(sesionId, textoIA, opts = {}) {
  if (opts.aceptadoPorMaestro !== true) {
    throw new Error(
      'El texto profesionalizado por IA requiere aceptación explícita del maestro antes de guardarse (REQ-11)',
    )
  }

  const { data, error } = await supabase
    .from('sesion_bitacora')
    .update({ texto_ia: textoIA })
    .eq('sesion_id', sesionId)
    .select()
    .single()

  if (error) throw error
  return data
}
