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

/**
 * ACM: Creates a new institutional activity in sesiones_clase (root session)
 * and calculates affected maestros via RPC.
 *
 * @param {Object} datos
 * @returns {Promise<Object>} { actividad, maestros_notificados }
 */
export async function crearActividadInstitucional(datos) {
  const { actividad, fecha, lugar, alcance_tipo = 'institucion', alcance_config = {}, maestro_id } = datos || {}
  if (!actividad) throw new Error('crearActividadInstitucional: se requiere nombre de actividad.')
  if (!fecha) throw new Error('crearActividadInstitucional: se requiere fecha.')

  const { data: actData, error: actError } = await supabase
    .from('sesiones_clase')
    .insert({
      actividad,
      fecha,
      lugar: lugar || null,
      alcance_tipo,
      alcance_config,
      maestro_id: maestro_id || null,
      clase_id: null,
      estado: 'pendiente'
    })
    .select()
    .single()

  if (actError) throw actError

  const maestrosNotificados = await obtenerMaestrosAfectadosPorAlcance({
    actividad_id: actData.id,
    alcance_tipo: actData.alcance_tipo,
    alcance_config: actData.alcance_config,
    fecha: actData.fecha
  })

  // BUGFIX: sin esto, "maestros_notificados" era solo un conteo mostrado a
  // ACM — ningún maestro veía nunca la confirmación en su bandeja, porque
  // obtenerConfirmacionesPendientes() lee de registros_pendientes y nadie
  // insertaba ahí. Detectado corriendo el flujo real contra Postgres, no
  // por los tests (que mockean cada función por separado y nunca verifican
  // que "crear actividad" y "ver pendientes" compartan datos reales).
  if (maestrosNotificados && maestrosNotificados.length > 0) {
    const registros = maestrosNotificados.map((maestroId) => ({
      maestro_id: maestroId,
      sesion_clase_id: actData.id,
      tipo: 'confirmacion_emergente_pendiente',
      estado: 'pendiente',
      mensaje: `Actividad institucional "${actData.actividad}" el ${actData.fecha}. Confirmá si te aplicó a tus clases.`,
      deep_link: `#/confirmaciones-emergentes?actividad_id=${actData.id}`
    }))

    const { error: notifError } = await supabase.from('registros_pendientes').insert(registros)
    if (notifError) {
      // La actividad ya quedó creada; no la revertimos por un fallo de
      // notificación, pero sí lo reportamos para que ACM sepa que hay que
      // reintentar la difusión.
      console.error('[crearActividadInstitucional] Error al notificar maestros:', notifError)
    }
  }

  return {
    actividad: actData,
    maestros_notificados: maestrosNotificados || []
  }
}

/**
 * ACM: Updates the validation state of a 'no_se' confirmation.
 * Protected by confirmaciones_update_acm RLS policy.
 *
 * @param {Object} params
 * @param {string} params.confirmacion_id
 * @param {'validado'|'rechazado'} params.estado_validacion
 * @param {string} [params.observaciones]
 * @returns {Promise<Object>}
 */
export async function validarConfirmacionAcm({ confirmacion_id, estado_validacion, observaciones } = {}) {
  if (!confirmacion_id) throw new Error('validarConfirmacionAcm: se requiere confirmacion_id.')
  if (!estado_validacion) throw new Error('validarConfirmacionAcm: se requiere estado_validacion.')

  const updatePayload = {
    estado_validacion,
    updated_at: new Date().toISOString()
  }
  if (observaciones !== undefined) {
    updatePayload.observaciones = observaciones
  }

  const { data, error } = await supabase
    .from('confirmaciones_emergentes')
    .update(updatePayload)
    .eq('id', confirmacion_id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * ACM/ADM: Retrieves all confirmations with optional filters.
 *
 * @param {Object} [filtros]
 * @returns {Promise<Array>}
 */
export async function obtenerTodasLasConfirmaciones(filtros = {}) {
  let query = supabase
    .from('confirmaciones_emergentes')
    .select(`
      *,
      actividad:actividad_id (
        id, actividad, fecha, lugar, alcance_tipo, alcance_config
      ),
      maestro:maestro_id (
        id, nombre, apellido
      )
    `)

  if (filtros.fecha) query = query.eq('fecha', filtros.fecha)
  if (filtros.maestro_id) query = query.eq('maestro_id', filtros.maestro_id)
  if (filtros.estado_validacion) query = query.eq('estado_validacion', filtros.estado_validacion)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error

  return (data || []).map(row => ({
    ...row,
    actividad_info: row.actividad || null
  }))
}

/**
 * Computes aggregated confirmation statistics from confirmation records.
 *
 * @param {Array} confirmaciones
 * @returns {Object}
 */
export function obtenerResumenAgregado(confirmaciones = []) {
  const resumen = {
    total: confirmaciones.length,
    si: 0,
    no: 0,
    no_aplica: 0,
    no_se: 0,
    pendientes_validacion: 0,
    validados: 0,
    rechazados: 0,
    por_maestro: {}
  }

  for (const c of confirmaciones) {
    if (c.respuesta === 'si') resumen.si++
    else if (c.respuesta === 'no') resumen.no++
    else if (c.respuesta === 'no_aplica') resumen.no_aplica++
    else if (c.respuesta === 'no_se') resumen.no_se++

    if (c.estado_validacion === 'pendiente') resumen.pendientes_validacion++
    else if (c.estado_validacion === 'validado') resumen.validados++
    else if (c.estado_validacion === 'rechazado') resumen.rechazados++

    const mId = c.maestro_id || 'sin_maestro'
    if (!resumen.por_maestro[mId]) {
      resumen.por_maestro[mId] = { total: 0, si: 0, no: 0, no_aplica: 0, no_se: 0 }
    }
    resumen.por_maestro[mId].total++
    if (c.respuesta in resumen.por_maestro[mId]) {
      resumen.por_maestro[mId][c.respuesta]++
    }
  }

  return resumen
}

