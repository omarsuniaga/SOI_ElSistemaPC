import { supabase } from '../../lib/supabaseClient.js'

/**
 * Get list of students who worked on a specific node
 * @param {string} nodeId
 * @returns {Promise<Array>} [{studentId, nombre, lastAttemptDate, attemptCount}]
 */
export async function getStudentsPerNode(nodeId) {
  const { data, error } = await supabase
    .from('node_student_coverage') // View created in migration
    .select('student_id, nombre_completo, last_attempt_date, attempt_count')
    .eq('node_id', nodeId)
    .order('last_attempt_date', { ascending: false })

  if (error) {
    console.error('[rutaGameificadaService] getStudentsPerNode error:', error)
    return []
  }

  return (data || []).map(row => ({
    studentId: row.student_id,
    nombre: row.nombre_completo,
    lastAttemptDate: row.last_attempt_date?.split('T')[0], // YYYY-MM-DD
    attemptCount: row.attempt_count || 0,
  }))
}

/**
 * Mark a node as covered (covered_date set, covered_by_clase_id set)
 * Called manually or automatically when observations are registered
 * @param {string} nodeId
 * @param {string} claseId
 * @param {string[]} studentIds - Students who participated
 * @returns {Promise<{success: boolean, updatedCount?: number, error?: string}>}
 */
export async function markNodeAsCovered(nodeId, claseId, studentIds = []) {
  if (!nodeId || !claseId) {
    return { success: false, error: 'nodeId and claseId required' }
  }

  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return { success: false, error: 'studentIds array required and cannot be empty' }
  }

  const { data: indicators, error: indError } = await supabase
    .from('indicators')
    .select('id')
    .eq('node_id', nodeId)

  if (indError) {
    console.error('[rutaGameificadaService] Failed to query indicators:', indError)
    return { success: false, error: indError.message }
  }

  if (!indicators?.length) {
    return { success: false, error: 'No indicators found for node' }
  }

  const indicatorIds = indicators.map(i => i.id)
  const coveredDate = new Date().toISOString().split('T')[0]

  const { error: updateError, data } = await supabase
    .from('indicator_attempts')
    .update({ covered_date: coveredDate, covered_by_clase_id: claseId })
    .in('indicator_id', indicatorIds)
    .in('student_id', studentIds)
    .select('id')

  if (updateError) {
    console.error('[rutaGameificadaService] Failed to mark node as covered:', updateError)
    return { success: false, error: updateError.message }
  }

  return { success: true, updatedCount: data?.length || 0 }
}
