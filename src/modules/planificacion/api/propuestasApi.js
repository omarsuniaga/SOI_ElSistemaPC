import { supabase } from '../../../lib/supabaseClient.js'

/**
 * API de revisión de propuestas — curriculo-tres-planos WU #6.
 *
 * Flujo bidireccional maestro -> ACM sobre route_versions:
 *   - El maestro INSERTA una propuesta (origen='maestro', status='propuesta')
 *     desde proponerContenidoView.js (WU #7). RLS le impide cambiar status.
 *   - El ACM revisa las propuestas pendientes acá y decide:
 *       publicarPropuesta -> status='published' (valor REAL del enum)
 *       devolverPropuesta -> status='devuelta' + feedback obligatorio
 */

export async function listarPropuestasPendientes() {
  const { data, error } = await supabase
    .from('route_versions')
    .select('*, levels(id, level_number, nodes(id, name, objetivos(id, nombre, indicators(id, description))))')
    .eq('origen', 'maestro')
    .eq('status', 'propuesta')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function publicarPropuesta(routeVersionId) {
  if (!routeVersionId) {
    throw new Error('publicarPropuesta: se requiere routeVersionId.')
  }

  const { data, error } = await supabase
    .from('route_versions')
    .update({ status: 'published', updated_at: new Date().toISOString() })
    .eq('id', routeVersionId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function devolverPropuesta(routeVersionId, feedback) {
  if (!routeVersionId) {
    throw new Error('devolverPropuesta: se requiere routeVersionId.')
  }
  if (!feedback || !feedback.trim()) {
    throw new Error('devolverPropuesta: se requiere feedback para explicar el motivo de la devolución.')
  }

  const { data, error } = await supabase
    .from('route_versions')
    .update({ status: 'devuelta', feedback: feedback.trim(), updated_at: new Date().toISOString() })
    .eq('id', routeVersionId)
    .select()
    .single()

  if (error) throw error
  return data
}
