import { supabase } from '../../lib/supabaseClient.js'

/** Include the titular's sessions for assigned substitutes, preserving own emergent sessions.
 * This selects visible records; database RLS remains the authorization boundary.
 */
export async function applySharedSessionAccess(query, maestroId) {
  const { data, error } = await supabase
    .from('clases')
    .select('id')
    .eq('maestro_suplente_id', maestroId)
  if (error) throw error
  const classIds = [...new Set((data || []).map(item => item.id).filter(Boolean))]
  return classIds.length
    ? query.or(`maestro_id.eq.${maestroId},clase_id.in.(${classIds.join(',')})`)
    : query.eq('maestro_id', maestroId)
}
