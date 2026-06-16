/**
 * bitacoraSupabase.js — Supabase implementation for the Bitacora module.
 *
 * Mirrors planificacionSupabase.js style: imports supabase client, one exported
 * async function per public adapter API, throws on error.
 */

import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Registers a session and its per-student notes atomically via RPC.
 *
 * @param {{ claseId: string, objetivoId: string, fecha: string,
 *   notas: { alumnoId: string, nota: string, observacion?: string }[] }} payload
 * @returns {Promise<{ sessionId: string }>}
 */
export async function registrarSesion({ claseId, objetivoId, fecha, notas }) {
  const { data, error } = await supabase.rpc('registrar_sesion_bitacora', {
    p_clase_id: claseId,
    p_objetivo_id: objetivoId,
    p_fecha: fecha,
    p_notas: notas.map((n) => ({
      alumno_id: n.alumnoId,
      nota_cualitativa: n.nota,
      observacion: n.observacion || null,
    })),
  })

  if (error) throw error
  return { sessionId: data }
}

/**
 * Queries the v_semaforo_contenidos view for a given clase.
 *
 * @param {string} claseId
 * @returns {Promise<{alumno_id: string, objetivo_id: string, bien_count: number,
 *   regular_count: number, mal_count: number, total_registros: number}[]>}
 */
export async function getSemaforoPorClase(claseId) {
  const { data, error } = await supabase
    .from('v_semaforo_contenidos')
    .select('alumno_id, objetivo_id, bien_count, regular_count, mal_count, total_registros')
    .eq('clase_id', claseId)

  if (error) throw error
  return data || []
}

/**
 * Resolves clases.ruta_id then fetches all ruta_contenido_objetivos for that ruta.
 *
 * @param {string} claseId
 * @returns {Promise<{id: string, descripcion: string, orden: number}[]>}
 */
export async function getContenidosDeClase(claseId) {
  // Step 1: resolve ruta_id from the clase
  const { data: claseData, error: claseError } = await supabase
    .from('clases')
    .select('ruta_id')
    .eq('id', claseId)
    .single()

  if (claseError) throw claseError
  if (!claseData?.ruta_id) return []

  // Step 2: fetch objetivos for that ruta ordered by orden ASC
  const { data, error } = await supabase
    .from('ruta_contenido_objetivos')
    .select('id, descripcion, orden, ruta_id, objetivo_id')
    .eq('ruta_id', claseData.ruta_id)
    .order('orden', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Returns alumnos enrolled in a clase via the inscripciones join table.
 *
 * @param {string} claseId
 * @returns {Promise<{id: string, nombre_completo: string}[]>}
 */
export async function getAlumnosByClase(claseId) {
  const { data, error } = await supabase
    .from('inscripciones')
    .select('alumnos ( id, nombre_completo )')
    .eq('clase_id', claseId)

  if (error) throw error
  return (data || []).map((row) => row.alumnos).filter(Boolean)
}

/**
 * Returns all session notes for (claseId, objetivoId) ordered by fecha DESC.
 * Joins indicator_sessions with indicator_session_students.
 *
 * @param {string} claseId
 * @param {string} objetivoId
 * @returns {Promise<{fecha: string, alumno_id: string, nota_cualitativa: string, observacion: string|null}[]>}
 */
export async function getHistorialContenido(claseId, objetivoId) {
  const { data, error } = await supabase
    .from('indicator_sessions')
    .select(`
      fecha,
      indicator_session_students (
        alumno_id,
        nota_cualitativa,
        observacion
      )
    `)
    .eq('clase_id', claseId)
    .eq('objetivo_id', objetivoId)
    .order('fecha', { ascending: false })

  if (error) throw error

  // Flatten: one row per student note
  const rows = []
  for (const ses of data || []) {
    for (const student of ses.indicator_session_students || []) {
      rows.push({
        fecha: ses.fecha,
        alumno_id: student.alumno_id,
        nota_cualitativa: student.nota_cualitativa,
        observacion: student.observacion || null,
      })
    }
  }

  return rows
}
