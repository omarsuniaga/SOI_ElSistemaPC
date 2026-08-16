/**
 * indiceEnsenanzaGuiadaApi.js — Spec D-01 (openspec/changes/juego-gamificado-planificacion)
 *
 * Consulta fn_get_indice_ensenanza_guiada() vía RPC (no la vista directo —
 * la vista es propiedad de `postgres` y bypassa RLS de las tablas base; la
 * función SECURITY DEFINER valida es_admin()/es_coordinador_acm() antes de
 * devolver datos comparativos de todos los maestros).
 */
import { supabase } from '../../../lib/supabaseClient.js'

/**
 * @returns {Promise<Array<{maestroId: string, nombre: string, totalSesiones: number, sesionesConIndicador: number, indice: number}>>}
 */
export async function getIndiceEnsenanzaGuiada() {
  try {
    const { data, error } = await supabase.rpc('fn_get_indice_ensenanza_guiada')

    if (error) {
      console.warn('[indiceEnsenanzaGuiadaApi] Error consultando el índice:', error.message)
      return []
    }
    if (!data || data.length === 0) return []

    const maestroIds = [...new Set(data.map((d) => d.maestro_id))]
    const { data: maestros } = await supabase.from('maestros').select('id, nombre_completo').in('id', maestroIds)
    const nombrePorId = new Map((maestros || []).map((m) => [m.id, m.nombre_completo]))

    return data.map((d) => ({
      maestroId: d.maestro_id,
      nombre: nombrePorId.get(d.maestro_id) || 'Maestro',
      totalSesiones: d.total_sesiones || 0,
      sesionesConIndicador: d.sesiones_con_indicador || 0,
      indice: d.indice != null ? Number(d.indice) : 0,
    }))
  } catch (err) {
    console.error('[indiceEnsenanzaGuiadaApi] getIndiceEnsenanzaGuiada error:', err)
    return []
  }
}
