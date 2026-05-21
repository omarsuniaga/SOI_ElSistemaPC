import { supabase } from '../../lib/supabaseClient.js'

/**
 * Fetch attendance data for a specific class and date.
 * @param {string} claseId - UUID of the class
 * @param {string} fecha - Date in YYYY-MM-DD format
 * @returns {Promise<{clase_id: string, fecha: string, estudiantes: Array}>}
 */
export async function obtenerAsistenciaClase(claseId, fecha) {
  const { data, error } = await supabase
    .from('alumnos_clases')
    .select('alumno_id, alumnos(id, nombre_completo)')
    .eq('clase_id', claseId)

  if (error) throw error

  // Fetch existing attendance records for this session
  const { data: asistencias, error: asistError } = await supabase
    .from('asistencias')
    .select('alumno_id, asistio')
    .eq('clase_id', claseId)
    .eq('fecha', fecha)

  if (asistError) throw asistError

  const asistenciaMap = new Map(
    (asistencias || []).map(a => [a.alumno_id, a.asistio])
  )

  const estudiantes = (data || []).map(insc => ({
    id: insc.alumno_id,
    nombre: insc.alumnos?.nombre_completo ?? insc.alumno_id,
    asistio: asistenciaMap.has(insc.alumno_id) ? asistenciaMap.get(insc.alumno_id) : null,
  }))

  return { clase_id: claseId, fecha, estudiantes }
}
