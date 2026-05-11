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
