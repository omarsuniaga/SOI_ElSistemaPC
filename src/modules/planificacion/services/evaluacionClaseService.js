/**
 * evaluacionClaseService.js — Service layer for evaluacion_indicador CRUD + RPCs
 *
 * Manages per-indicator, per-student evaluation tracking. Supports both
 * evaluation sources per migration #3 (Decisión 2, design.md):
 *   - `indicator_id`        — global catalog indicator (legacy curriculum-route flow)
 *   - `clase_indicador_id`  — class-owned indicator from the new mapa gamificado (REQ-14)
 * `ei_una_sola_fuente` (a Postgres CHECK) requires exactly one of the two to
 * be non-null; this service enforces the same rule client-side before
 * hitting the DB.
 *
 * REQ-05: a nota >= 3 (on the 1-5 scale) is considered "superado" for a
 * single indicator. `esNotaSuperada` is the one, exported, canonical place
 * that rule lives in JS — it does NOT write anything (the derived
 * objective-level "superador"/estrellas logic itself is a SQL view,
 * mirrored in `domain/EstrellasObjetivo.js#esAlumnoSuperador`, Decisión 5:
 * estrellas nunca se escriben).
 *
 * Pattern: pure service functions using Supabase client directly.
 */

import { supabase } from '../../../lib/supabaseClient.js'

const ESTADOS_VALIDOS = ['sin_evaluar', 'inicia', 'en_progreso', 'avanzado', 'dominado']
const NOTA_SUPERACION = 3

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function _isUuid(value) {
  return typeof value === 'string' && UUID_REGEX.test(value)
}

/**
 * Matches locally-generated demo/preview placeholder IDs (e.g. `obj-1`,
 * `nd-3`, `obj-demo-1`) that the app creates client-side before a real
 * Supabase UUID exists — see DisenadorCurricularView.js, RutaPedagogicaView.js,
 * aiEvaluacionService.js. These are always HYPHEN-separated in this
 * codebase; the separator here is deliberately `-` only, NOT `[-_]`.
 *
 * ⚠️ Bugfix (Tarea 2.4, batch 4): the previous version of this regex also
 * matched `_` as a separator, which collided with this codebase's own test
 * fixture convention (`alu_001`, `ind_001`, `clase_001` — used consistently
 * across every planificacion test file, e.g. claseObjetivosService.test.js's
 * `plan_001`/`ccp_001`/`node_001`). That false positive made
 * `registrarEvaluacion` silently `return null` for entirely realistic
 * fixture data instead of running its real validation/write logic — the
 * actual root cause of the "6 pre-existing failures" documented in prior
 * batches (evaluacionClaseService.test.js + planificacion-rediseño.integration.test.js),
 * misattributed there to "the mock's upsert().select().single() chain".
 * Verified via `grep` across src/modules/planificacion that every real
 * demo-ID generator in the app uses `-`, never `_`.
 */
function _isVirtualLikeId(value) {
  return typeof value === 'string' && /^(nd|demo|local|obj|ind|al|clase|nodo|alu|mae|stu|ses|plan|route|node|tarea|item|preview|temp)-/i.test(value)
}

function _shouldSkipRemoteWrite(values) {
  return values.some((value) => typeof value === 'string' && !_isUuid(value) && _isVirtualLikeId(value))
}

/**
 * REQ-05: a nota >= 3 (1-5 scale) is "superado" for a single indicator.
 * A missing nota (null/undefined — not yet evaluated) is never superado.
 *
 * @param {number|null|undefined} nota
 * @returns {boolean}
 */
export function esNotaSuperada(nota) {
  return nota != null && nota >= NOTA_SUPERACION
}

/**
 * Register or update an evaluation for a student on a specific indicator.
 * Exactly one of `indicator_id` (global catalog) or `clase_indicador_id`
 * (class-owned, new mapa) must be provided — mirrors the DB's
 * `ei_una_sola_fuente` CHECK (Decisión 2).
 *
 * Uses UPSERT on the matching partial unique index:
 *   - `indicator_id` path       → UNIQUE(alumno_id, indicator_id, clase_id)
 *   - `clase_indicador_id` path → UNIQUE(alumno_id, clase_indicador_id)
 *
 * @param {object} data - { alumno_id, indicator_id?, clase_indicador_id?, clase_id, nota?, estado?, observaciones?, evaluado_por? }
 * @returns {Promise<object|null>} The upserted evaluation record, or null if the write was skipped for a virtual/demo ID
 */
export async function registrarEvaluacion(data) {
  if (!data.alumno_id) {
    throw new Error('alumno_id es requerido')
  }
  if (!data.clase_id) {
    throw new Error('clase_id es requerido')
  }

  const tieneIndicatorGlobal = data.indicator_id !== undefined && data.indicator_id !== null
  const tieneIndicadorClase = data.clase_indicador_id !== undefined && data.clase_indicador_id !== null

  if (!tieneIndicatorGlobal && !tieneIndicadorClase) {
    throw new Error('Se requiere indicator_id o clase_indicador_id')
  }
  if (tieneIndicatorGlobal && tieneIndicadorClase) {
    throw new Error('Se requiere exactamente uno de indicator_id o clase_indicador_id, no ambos (ei_una_sola_fuente)')
  }

  const idsAValidar = [data.alumno_id, data.clase_id, data.indicator_id, data.clase_indicador_id]
  if (_shouldSkipRemoteWrite(idsAValidar)) {
    console.warn('[registrarEvaluacion] Se omite la escritura remota para IDs virtuales/no UUID:', data)
    return null
  }

  if (data.nota !== null && data.nota !== undefined) {
    if (data.nota < 1 || data.nota > 5) {
      throw new Error('La nota debe estar entre 1 y 5')
    }
  }

  const row = {
    alumno_id: data.alumno_id,
    clase_id: data.clase_id,
    indicator_id: tieneIndicatorGlobal ? data.indicator_id : null,
    clase_indicador_id: tieneIndicadorClase ? data.clase_indicador_id : null,
    nota: data.nota ?? null,
    estado: data.estado || 'sin_evaluar',
    observaciones: data.observaciones || null,
    evaluado_por: data.evaluado_por || null,
    fecha_evaluacion: new Date().toISOString(),
  }

  const onConflict = tieneIndicadorClase
    ? 'alumno_id,clase_indicador_id'
    : 'alumno_id,indicator_id,clase_id'

  const { data: result, error } = await supabase
    .from('evaluacion_indicador')
    .upsert(row, { onConflict })
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
  const { data, error } = await supabase
    .from('evaluacion_indicador')
    .select('*')
    .eq('clase_id', claseId)
    .order('created_at', { ascending: false })

  if (error) throw error
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
 * Get evaluations for a specific (global catalog) indicator across all
 * students in a class.
 *
 * @param {string} indicatorId - ID of the global indicator
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

/**
 * Get evaluations for a specific class-owned indicator (new mapa
 * gamificado, REQ-14) across all students in a class.
 *
 * @param {string} claseIndicadorId - ID of the clase_mapa_indicadores record
 * @param {string} claseId - ID of the class
 * @returns {Promise<Array<object>>} All student evaluations for this indicator
 */
export async function obtenerProgresoPorIndicadorClase(claseIndicadorId, claseId) {
  const { data, error } = await supabase
    .from('evaluacion_indicador')
    .select('*')
    .eq('clase_indicador_id', claseIndicadorId)
    .eq('clase_id', claseId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
