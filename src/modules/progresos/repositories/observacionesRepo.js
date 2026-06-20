/**
 * Repository for observaciones (session and student observations)
 * Reads from both observaciones_sesion and observaciones_alumnos tables
 * Single responsibility: bulk fetch from Supabase, no business logic
 */

import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Fetches observaciones for multiple students in a date window
 * Merges both observaciones_sesion and observaciones_alumnos
 * @param {Object} options - { alumnoIds, claseId, periodoId, from, to }
 * @returns {Promise<Array>} Rows with { alumno_id, texto, fecha, tipo: 'sesion'|'alumno', ... }
 * @throws {Error} on Supabase error
 */
export async function fetchBulk({ alumnoIds = [], claseId, periodoId, from, to }) {
  // Fetch from observaciones_alumnos (direct student observations)
  let queryAlumnos = supabase
    .from('observaciones_alumnos')
    .select('id, alumno_id, texto, fecha, tipo:created_at, sesion_id')

  if (alumnoIds && alumnoIds.length > 0) {
    queryAlumnos = queryAlumnos.in('alumno_id', alumnoIds)
  }

  if (claseId) {
    queryAlumnos = queryAlumnos.eq('clase_id', claseId)
  }

  if (from && to) {
    queryAlumnos = queryAlumnos.gte('fecha', from).lte('fecha', to)
  }

  const { data: alumnosObs, error: errAlumnos } = await queryAlumnos

  if (errAlumnos) {
    throw new Error(`Failed to fetch observaciones_alumnos: ${errAlumnos.message}`)
  }

  // Map observaciones_alumnos with tipo='alumno'
  const mappedAlumnos = (alumnosObs || []).map(row => ({
    ...row,
    tipo: 'alumno',
  }))

  // Fetch from observaciones_sesion (indirect student observations from session notes)
  let querySesion = supabase
    .from('observaciones_sesion')
    .select('id, alumno_id, texto, fecha, sesion_id')

  if (alumnoIds && alumnoIds.length > 0) {
    querySesion = querySesion.in('alumno_id', alumnoIds)
  }

  if (claseId) {
    querySesion = querySesion.eq('clase_id', claseId)
  }

  if (from && to) {
    querySesion = querySesion.gte('fecha', from).lte('fecha', to)
  }

  const { data: sesionObs, error: errSesion } = await querySesion

  if (errSesion) {
    throw new Error(`Failed to fetch observaciones_sesion: ${errSesion.message}`)
  }

  // Map observaciones_sesion with tipo='sesion'
  const mappedSesion = (sesionObs || []).map(row => ({
    ...row,
    tipo: 'sesion',
  }))

  // Merge both sources
  return [...mappedAlumnos, ...mappedSesion]
}
