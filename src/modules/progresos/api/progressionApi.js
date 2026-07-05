import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Motor de progresión — curriculo-tres-planos WU #5.
 *
 * getObjetivoActual delega toda la lógica de "cuál es el próximo objetivo
 * pendiente de un alumno en una ruta" al RPC de Postgres
 * fn_objetivo_actual_alumno (ver
 * supabase/migrations/20260704_000003_fn_objetivo_actual_alumno.sql).
 * Este módulo es intencionalmente un wrapper delgado: no duplica la lógica
 * de progresión en JS — la fuente de verdad es la base de datos, que ya
 * conoce indicator_attempts y is_required.
 *
 * @param {string} alumnoId - id del alumno (student_id en indicator_attempts)
 * @param {string} routeVersionId - id de la route_version a evaluar
 * @returns {Promise<{
 *   objetivo_actual_id: string|null,
 *   nombre: string|null,
 *   tema_id: string|null,
 *   tema_nombre: string|null,
 *   nivel_id: string|null,
 *   indicadores_pendientes_requeridos: number,
 * }>}
 */
export async function getObjetivoActual(alumnoId, routeVersionId) {
  if (!alumnoId) {
    throw new Error('getObjetivoActual: se requiere alumnoId.')
  }
  if (!routeVersionId) {
    throw new Error('getObjetivoActual: se requiere routeVersionId.')
  }

  const { data, error } = await supabase.rpc('fn_objetivo_actual_alumno', {
    p_student_id: alumnoId,
    p_route_version_id: routeVersionId,
  })

  if (error) {
    throw new Error(`fn_objetivo_actual_alumno falló: ${error.message}`)
  }

  return data
}
