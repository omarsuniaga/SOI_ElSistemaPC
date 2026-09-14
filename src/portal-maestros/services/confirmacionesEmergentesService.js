import { supabase } from '../../lib/supabaseClient.js'

/**
 * Service to interact with Supabase for institutional activity confirmations.
 * Implements the DataAdapter target layer for "justificacion-actividades-emergentes".
 */

const VALID_RESPUESTAS = ['si', 'no', 'no_aplica', 'no_se']

/**
 * Idempotently saves or updates a maestro confirmation for an institutional activity
 * using the RPC fn_confirmar_actividad_emergente.
 *
 * @param {Object} datos
 * @param {string} datos.actividad_id - UUID of the root session in sesiones_clase (clase_id IS NULL)
 * @param {string} datos.maestro_id - UUID of the confirming maestro
 * @param {string} datos.fecha - Date string (YYYY-MM-DD)
 * @param {'si'|'no'|'no_aplica'|'no_se'} datos.respuesta - Confirmation response
 * @param {string} [datos.observaciones] - Optional remarks
 * @returns {Promise<Object>} The saved confirmaciones_emergentes row
 */
export async function confirmarActividad(datos) {
  const { actividad_id, maestro_id, fecha, respuesta, observaciones } = datos || {}

  if (!actividad_id) throw new Error('confirmarActividad: se requiere actividad_id.')
  if (!maestro_id) throw new Error('confirmarActividad: se requiere maestro_id.')
  if (!fecha) throw new Error('confirmarActividad: se requiere fecha.')
  if (!respuesta) throw new Error('confirmarActividad: se requiere respuesta.')

  if (!VALID_RESPUESTAS.includes(respuesta)) {
    throw new Error(`confirmarActividad: respuesta inválida "${respuesta}". Debe ser una de: ${VALID_RESPUESTAS.join(', ')}`)
  }

  const { data, error } = await supabase.rpc('fn_confirmar_actividad_emergente', {
    p_actividad_id: actividad_id,
    p_maestro_id: maestro_id,
    p_fecha: fecha,
    p_respuesta: respuesta,
    p_observaciones: observaciones || null
  })

  if (error) throw error
  return data
}

/**
 * Fetches pending confirmations for a given maestro.
 * Queries `registros_pendientes` with notification details and associated root session,
 * falling back to or augmenting with activities pending validation.
 *
 * @param {string} maestroId - UUID of the maestro
 * @returns {Promise<Array>} Array of pending confirmation items
 */
export async function obtenerConfirmacionesPendientes(maestroId) {
  if (!maestroId) throw new Error('obtenerConfirmacionesPendientes: se requiere maestroId.')

  // Query registros_pendientes for this maestro
  const { data, error } = await supabase
    .from('registros_pendientes')
    .select(`
      id,
      maestro_id,
      sesion_clase_id,
      tipo,
      estado,
      mensaje,
      deep_link,
      created_at,
      sesion_clase:sesion_clase_id (
        id,
        actividad,
        fecha,
        lugar,
        alcance_tipo,
        alcance_config,
        hora_inicio,
        hora_fin,
        maestro_id
      )
    `)
    .eq('maestro_id', maestroId)
    .in('tipo', ['confirmacion_emergente_pendiente', 'justificacion_pendiente'])
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: false })

  if (error) throw error

  // Normalize shape for consistent consumption by components and views
  return (data || []).map(item => {
    const sesion = item.sesion_clase || {}
    return {
      id: item.id,
      actividad_id: item.sesion_clase_id,
      maestro_id: item.maestro_id,
      fecha: sesion.fecha || null,
      estado: item.estado,
      mensaje: item.mensaje,
      deep_link: item.deep_link,
      created_at: item.created_at,
      actividad_info: sesion,
      sesion_clase: sesion
    }
  })
}

/**
 * Fetches a single institutional activity (root session) by ID.
 *
 * @param {string} actividad_id - UUID of the root session
 * @returns {Promise<Object>} The sesiones_clase record
 */
export async function obtenerActividadPorId(actividad_id) {
  if (!actividad_id) throw new Error('obtenerActividadPorId: se requiere actividad_id.')

  const { data, error } = await supabase
    .from('sesiones_clase')
    .select('*')
    .eq('id', actividad_id)
    .is('clase_id', null)
    .single()

  if (error) throw error
  return data
}

/**
 * Fetches confirmation records for a maestro, optionally filtered by date.
 *
 * @param {string} maestroId - UUID of the maestro
 * @param {string} [fecha] - Date string (YYYY-MM-DD)
 * @returns {Promise<Array>} List of confirmaciones_emergentes records
 */
export async function obtenerActividadesPorAlcance(maestroId, fecha) {
  if (!maestroId) throw new Error('obtenerActividadesPorAlcance: se requiere maestroId.')

  let query = supabase
    .from('confirmaciones_emergentes')
    .select('*')
    .eq('maestro_id', maestroId)

  if (fecha) {
    query = query.eq('fecha', fecha)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Calls RPC fn_maestros_afectados_por_alcance to deterministically retrieve
 * all maestro IDs affected by an institutional activity scope.
 *
 * @param {Object} params
 * @param {string} params.actividad_id - UUID of the institutional activity
 * @param {string} params.alcance_tipo - 'institucion' | 'orquesta' | 'coro' | 'programa' | 'grupo' | 'maestros_especificos'
 * @param {Object} [params.alcance_config] - Configuration JSON object
 * @param {string} params.fecha - Date string (YYYY-MM-DD)
 * @returns {Promise<Array<string>>} Array of maestro UUIDs
 */
export async function obtenerMaestrosAfectadosPorAlcance({
  actividad_id,
  alcance_tipo,
  alcance_config = {},
  fecha
} = {}) {
  const { data, error } = await supabase.rpc('fn_maestros_afectados_por_alcance', {
    p_actividad_id: actividad_id || null,
    p_alcance_tipo: alcance_tipo,
    p_alcance_config: alcance_config || {},
    p_fecha: fecha
  })

  if (error) throw error
  return data || []
}
