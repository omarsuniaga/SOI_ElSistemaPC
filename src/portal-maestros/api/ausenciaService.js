import { supabase } from '../../lib/supabaseClient.js'

/**
 * Generates a ticket number in the format AUS-{year}-{counter padded to 3 digits}
 */
async function generarNumeroTicket() {
  const year = new Date().getFullYear()
  const { data } = await supabase
    .from('ausencias_maestros')
    .select('numero_ticket')
    .order('numero_ticket', { ascending: false })
    .limit(1)

  let counter = 1
  if (data && data.length > 0 && data[0].numero_ticket) {
    const parts = data[0].numero_ticket.split('-')
    const lastCounter = parseInt(parts[2], 10)
    if (!isNaN(lastCounter)) {
      counter = lastCounter + 1
    }
  }

  return `AUS-${year}-${String(counter).padStart(3, '0')}`
}

/**
 * Creates a new absence request with a generated ticket number.
 * @param {Object} payload - Absence data (maestro_id, fecha_inicio, fecha_fin, motivo, etc.)
 * @returns {Promise<Object>} The created absence record
 */
export async function crearSolicitud(payload) {
  const numero_ticket = await generarNumeroTicket()

  const { data, error } = await supabase
    .from('ausencias_maestros')
    .insert([{ ...payload, numero_ticket, estado: 'pendiente' }])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Finds all classes taught by the maestro that overlap with the given date range.
 * @param {string} maestroId
 * @param {string} fechaInicio - ISO date string
 * @param {string} fechaFin - ISO date string
 * @returns {Promise<Array>} List of affected classes
 */
export async function buscarClasesAfectadas(maestroId, fechaInicio, fechaFin) {
  const { data, error } = await supabase
    .from('clases')
    .select('id, nombre, instrumento, maestro_principal_id, maestro_suplente_id')
    .or(`maestro_principal_id.eq.${maestroId},maestro_suplente_id.eq.${maestroId}`)

  if (error) throw error
  return data || []
}

/**
 * Records an audit entry for an absence action.
 * @param {Object} params
 * @param {number} params.ausencia_id
 * @param {string} params.accion - Action performed (e.g. 'creacion', 'aprobacion', 'rechazo')
 * @param {string} params.usuario_id
 * @param {Object} [params.detalle] - Optional additional detail
 * @returns {Promise<Object>} The created audit record
 */
export async function registrarAuditoria({ ausencia_id, accion, usuario_id, detalle = null }) {
  const { data, error } = await supabase
    .from('ausencias_auditoria')
    .insert([{
      ausencia_id,
      accion,
      usuario_id,
      detalle,
      timestamp: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Returns an absence record along with its full audit trail.
 * @param {number} ausenciaId
 * @returns {Promise<{ausencia: Object, auditoria: Array}>}
 */
export async function obtenerAusenciaConAuditoria(ausenciaId) {
  const { data: ausencia, error: ausenciaError } = await supabase
    .from('ausencias_maestros')
    .select('*')
    .eq('id', ausenciaId)
    .single()

  if (ausenciaError) throw ausenciaError

  const { data: auditoria, error: auditoriaError } = await supabase
    .from('ausencias_auditoria')
    .select('*')
    .eq('ausencia_id', ausenciaId)
    .order('timestamp', { ascending: true })

  if (auditoriaError) throw auditoriaError

  return { ausencia, auditoria: auditoria || [] }
}
