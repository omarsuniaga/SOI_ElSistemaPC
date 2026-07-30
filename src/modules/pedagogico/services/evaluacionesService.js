/**
 * evaluacionesService.js — Read evaluation data for the pedagogical dashboard.
 * Uses view_evaluaciones_pedagogicas and fn_evaluacion_cobertura RPC.
 */
import { supabase } from '../../../lib/supabaseClient.js'

const escapeHTML = (s) =>
  String(s || '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  )

/**
 * Fetch all evaluations for a specific class.
 * @param {string} claseId
 * @returns {Promise<Array>} rows from view_evaluaciones_pedagogicas
 */
export async function fetchEvaluacionesPorClase(claseId) {
  const { data, error } = await supabase
    .from('view_evaluaciones_pedagogicas')
    .select('*')
    .eq('clase_id', claseId)
    .order('covered_date', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Fetch evaluations created by a specific teacher.
 * @param {string} maestroId — auth.uid() of the teacher
 * @param {object} [opts] — { dateFrom, dateTo, claseId }
 * @returns {Promise<Array>}
 */
export async function fetchEvaluacionesPorMaestro(maestroId, opts = {}) {
  let query = supabase
    .from('view_evaluaciones_pedagogicas')
    .select('*')
    .eq('maestro_id', maestroId)
    .order('covered_date', { ascending: false })

  if (opts.dateFrom) query = query.gte('covered_date', opts.dateFrom)
  if (opts.dateTo) query = query.lte('covered_date', opts.dateTo)
  if (opts.claseId) query = query.eq('clase_id', opts.claseId)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

/**
 * Get evaluation coverage for a class via RPC.
 * @param {string} claseId
 * @returns {Promise<object>} coverage stats
 */
export async function fetchCoberturaEvaluacion(claseId) {
  const { data, error } = await supabase.rpc('fn_evaluacion_cobertura', {
    p_clase_id: claseId,
  })

  if (error) throw error
  return data || { total_indicators: 0, evaluated_indicators: 0, coverage_pct: 0, by_teacher: [] }
}

/**
 * Fetch per-student evaluation detail for a specific class.
 * Groups indicator attempts by student with their scores.
 * @param {string} claseId
 * @returns {Promise<Array>} [{ student_id, student_name, evaluations: [{ indicator_name, result, nota, ... }] }]
 */
export async function fetchDetalleAlumnosPorClase(claseId) {
  const rows = await fetchEvaluacionesPorClase(claseId)

  const byStudent = {}
  rows.forEach((r) => {
    if (!byStudent[r.student_id]) {
      byStudent[r.student_id] = {
        student_id: r.student_id,
        student_name: r.student_name,
        evaluations: [],
      }
    }
    byStudent[r.student_id].evaluations.push({
      indicator_id: r.indicator_id,
      indicator_name: r.indicator_name || r.indicator_description,
      node_name: r.node_name,
      level_name: r.level_name,
      result: r.result,
      nota: r.nota,
      observations: r.observations,
      maestro_name: r.maestro_name,
      covered_date: r.covered_date,
    })
  })

  return Object.values(byStudent)
}

/**
 * Fetch evaluation summary across all classes for a teacher.
 * @param {string} maestroId
 * @returns {Promise<object>} { total_evaluations, unique_students, unique_indicators, by_clase: [...] }
 */
export async function fetchResumenEvaluaciones(maestroId) {
  const rows = await fetchEvaluacionesPorMaestro(maestroId)

  const uniqueStudents = new Set(rows.map((r) => r.student_id))
  const uniqueIndicators = new Set(rows.map((r) => r.indicator_id))

  const byClase = {}
  rows.forEach((r) => {
    if (!byClase[r.clase_id]) {
      byClase[r.clase_id] = { clase_id: r.clase_id, clase_name: r.clase_name, count: 0, students: new Set() }
    }
    byClase[r.clase_id].count++
    byClase[r.clase_id].students.add(r.student_id)
  })

  return {
    total_evaluations: rows.length,
    unique_students: uniqueStudents.size,
    unique_indicators: uniqueIndicators.size,
    by_clase: Object.values(byClase).map((c) => ({
      ...c,
      students: c.students.size,
    })),
  }
}

export { escapeHTML }
