/**
 * Repository for progresos (grades/evaluations)
 * Single responsibility: bulk fetch from Supabase, no business logic
 */

import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Fetches grade/evaluation records for multiple students in a date window
 * @param {Object} options - { alumnoIds, claseId, periodoId, from, to }
 * @returns {Promise<Array>} Rows with { alumno_id, calificacion, fecha_evaluacion, evaluacion_id, ... }
 * @throws {Error} on Supabase error
 */
export async function fetchBulk({ alumnoIds = [], claseId, periodoId, from, to }) {
  let query = supabase
    .from('progresos')
    .select('*')

  // N+1 guard: use .in() operator for bulk filter
  if (alumnoIds && alumnoIds.length > 0) {
    query = query.in('alumno_id', alumnoIds)
  }

  if (claseId) {
    query = query.eq('clase_id', claseId)
  }

  if (from && to) {
    query = query.gte('fecha_evaluacion', from).lte('fecha_evaluacion', to)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch progresos: ${error.message}`)
  }

  return data || []
}
