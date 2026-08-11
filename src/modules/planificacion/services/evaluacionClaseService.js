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
 *
 * ⚠️  DB NOTE: The original `.upsert(..., { onConflict: 'alumno_id,indicator_id,clase_id' })`
 * requires a UNIQUE constraint on those three columns in `evaluacion_indicador`.
 * Until that migration is applied (see migration file needed below), we use a
 * manual SELECT → UPDATE / INSERT pattern that is functionally identical.
 *
 * Run this migration in Supabase SQL Editor to restore the simpler upsert:
 *   ALTER TABLE evaluacion_indicador
 *     ADD CONSTRAINT evaluacion_indicador_alumno_indicator_clase_unique
 *     UNIQUE (alumno_id, indicator_id, clase_id);
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

  if (_shouldSkipRemoteWrite([data.alumno_id, data.indicator_id, data.clase_id])) {
    const key = `${data.alumno_id}:${data.indicator_id}:${data.clase_id}`
    const row = {
      id: key,
      alumno_id: data.alumno_id,
      indicator_id: data.indicator_id,
      clase_id: data.clase_id,
      nota: data.nota ?? null,
      estado: data.estado || 'sin_evaluar',
      observaciones: data.observaciones || null,
      evaluado_por: data.evaluado_por || null,
      fecha_evaluacion: new Date().toISOString(),
    }
    _virtualEvaluaciones.set(key, row)
    return row
  }

  // ── Step 0: Try atomic RPC if deployed ──────────────────────────────────
  try {
    const { data: rpcResult, error: rpcError } = await supabase.rpc('fn_registrar_evaluacion_indicador', {
      p_alumno_id: data.alumno_id,
      p_indicator_id: data.indicator_id,
      p_clase_id: data.clase_id,
      p_nota: data.nota ?? null,
      p_estado: data.estado || 'sin_evaluar',
      p_observaciones: data.observaciones || null,
      p_evaluado_por: data.evaluado_por || null,
    })
    if (!rpcError && rpcResult) {
      return rpcResult
    }
  } catch {
    // Fallback to table queries below if RPC is not available
  }

  // ── Step 1: check for an existing record ──────────────────────────────────
  const { data: existing, error: selectError } = await supabase
    .from('evaluacion_indicador')
    .select('id')
    .eq('alumno_id', data.alumno_id)
    .eq('indicator_id', data.indicator_id)
    .eq('clase_id', data.clase_id)
    .maybeSingle()

  if (selectError) throw selectError

  const updatePayload = {
    nota: data.nota ?? null,
    estado: data.estado || 'sin_evaluar',
    observaciones: data.observaciones || null,
    evaluado_por: data.evaluado_por || null,
    fecha_evaluacion: new Date().toISOString(),
  }

  if (existing?.id) {
    // ── Step 2a: UPDATE existing record ──────────────────────────────────────
    const { data: result, error: updateError } = await supabase
      .from('evaluacion_indicador')
      .update(updatePayload)
      .eq('id', existing.id)
      .select()
      .single()

    if (updateError) throw updateError
    return result
  }

  // ── Step 2b: INSERT new record ─────────────────────────────────────────────
  const insertRow = {
    alumno_id: data.alumno_id,
    indicator_id: data.indicator_id,
    clase_id: data.clase_id,
    ...updatePayload,
  }

  const { data: result, error: insertError } = await supabase
    .from('evaluacion_indicador')
    .insert(insertRow)
    .select()
    .single()

  if (insertError) throw insertError
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
