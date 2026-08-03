/**
 * evaluacionClaseService.js — Service layer for evaluacion_indicador CRUD + RPCs
 *
 * Manages per-indicator, per-student evaluation tracking. Supports
 * UPSERT via unique constraint (alumno_id, indicator_id, clase_id).
 *
 * Pattern: pure service functions using Supabase client directly.
 */

import { supabase } from '../../../lib/supabaseClient.js'
import { config } from '../../../core/config/config.js'

const ESTADOS_VALIDOS = ['sin_evaluar', 'inicia', 'en_progreso', 'avanzado', 'dominado']
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function _isUuid(value) {
  return typeof value === 'string' && UUID_REGEX.test(value)
}

function _isVirtualLikeId(value) {
  return typeof value === 'string' && /^(nd|demo|local|obj|ind|al|clase|nodo|alu|mae|stu|ses|plan|route|node|tarea|item|preview|temp)[-_]/i.test(value)
}

function _shouldSkipRemoteWrite(values) {
  if (!config?.isDemoMode) return false
  return values.some((value) => typeof value === 'string' && !_isUuid(value) && _isVirtualLikeId(value))
}

const _virtualEvaluaciones = new Map()

/**
 * Register or update an evaluation for a student on a specific indicator.
 * Uses UPSERT on the UNIQUE(alumno_id, indicator_id, clase_id) constraint.
 *
 * @param {object} data - { alumno_id, indicator_id, clase_id, nota?, estado?, observaciones?, evaluado_por? }
 * @returns {Promise<object>} The upserted evaluation record
 */
export async function registrarEvaluacion(data) {
  if (!data.alumno_id || !data.indicator_id || !data.clase_id) {
    throw new Error('alumno_id, indicator_id y clase_id son requeridos')
  }

  if (data.nota !== null && data.nota !== undefined) {
    if (data.nota < 1 || data.nota > 5) {
      throw new Error('La nota debe estar entre 1 y 5')
    }
  }

  const row = {
    id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    alumno_id: data.alumno_id,
    indicator_id: data.indicator_id,
    clase_id: data.clase_id,
    nota: data.nota ?? null,
    estado: data.estado || 'sin_evaluar',
    observaciones: data.observaciones || null,
    evaluado_por: data.evaluado_por || null,
    fecha_evaluacion: new Date().toISOString(),
  }

  if (_shouldSkipRemoteWrite([data.alumno_id, data.indicator_id, data.clase_id])) {
    const key = `${data.alumno_id}:${data.indicator_id}:${data.clase_id}`
    _virtualEvaluaciones.set(key, row)
    return row
  }

  const { data: result, error } = await supabase
    .from('evaluacion_indicador')
    .upsert(row, { onConflict: 'alumno_id,indicator_id,clase_id' })
    .select()
    .single()

  if (error) throw error
  return result
}

/**
 * Get all evaluations for a specific class.
 *
 * @param {string} claseId - ID of the class
 * @returns {Promise<Array<object>>} Evaluations with joined student/indicator data
 */
export async function obtenerEvaluacionesPorClase(claseId) {
  if (_shouldSkipRemoteWrite([claseId])) {
    return Array.from(_virtualEvaluaciones.values()).filter((e) => e.clase_id === claseId)
  }

  const { data, error } = await supabase
    .from('evaluacion_indicador')
    .select('*')
    .eq('clase_id', claseId)
    .order('created_at', { ascending: false })

  if (error) {
    return Array.from(_virtualEvaluaciones.values()).filter((e) => e.clase_id === claseId)
  }
  return data || []
}

/**
 * Get evaluations for a specific student in a specific class.
 *
 * @param {string} alumnoId - ID of the student
 * @param {string} claseId - ID of the class
 * @returns {Promise<Array<object>>} Student's evaluations for the class
 */
export async function obtenerEvaluacionPorAlumno(alumnoId, claseId) {
  const { data, error } = await supabase
    .from('evaluacion_indicador')
    .select('*')
    .eq('alumno_id', alumnoId)
    .eq('clase_id', claseId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get progress summary for all students in a class via RPC.
 *
 * @param {string} claseId - ID of the class
 * @returns {Promise<Array<object>>} Per-student progress aggregation
 */
export async function obtenerProgresoAlumnos(claseId) {
  const { data, error } = await supabase.rpc('fn_evaluacion_indicadores_por_clase', {
    p_clase_id: claseId,
  })

  if (error) throw error
  return data || []
}

/**
 * Get evaluations for a specific indicator across all students in a class.
 *
 * @param {string} indicatorId - ID of the indicator
 * @param {string} claseId - ID of the class
 * @returns {Promise<Array<object>>} All student evaluations for this indicator
 */
export async function obtenerProgresoPorIndicador(indicatorId, claseId) {
  const { data, error } = await supabase
    .from('evaluacion_indicador')
    .select('*')
    .eq('indicator_id', indicatorId)
    .eq('clase_id', claseId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
