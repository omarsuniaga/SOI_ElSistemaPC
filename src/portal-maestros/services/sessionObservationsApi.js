import { supabase } from '../../lib/supabaseClient.js'

const demoObservations = []
export function saveDemoSessionObservation(payload) {
  const row = { ...structuredClone(payload), id: crypto.randomUUID(), created_at: new Date().toISOString() }
  demoObservations.push(row)
  return row
}

export async function getSessionObservations(sesionId) {
  if (!sesionId) return []
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return structuredClone(demoObservations.filter(row => row.sesion_id === sesionId))
  }
  const { data, error } = await supabase.from('observaciones_sesion')
    .select('id, sesion_id, contenido_raw, contenido_parsed, created_at')
    .eq('sesion_id', sesionId).eq('es_borrador', false)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}
