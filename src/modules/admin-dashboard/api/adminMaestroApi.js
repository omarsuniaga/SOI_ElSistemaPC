/**
 * Admin API for maestro compliance tracking
 * Queries maestro_desempeño and registros_pendientes for dashboard reporting
 */

import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Get all maestros with their compliance status
 * Includes: current state, days overdue, category, pending session count
 */
export async function getMaestrosComplianceStatus() {
  try {
    const { data, error } = await supabase
      .from('maestro_desempeño')
      .select(
        `
        id,
        maestro_id,
        maestros(id, nombre_completo),
        total_sesiones,
        sesiones_verde,
        sesiones_amarillo,
        sesiones_naranja,
        sesiones_rojo,
        categoria,
        tendencia,
        fecha_ultima_evaluacion,
        updated_at
        `
      )
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[getMaestrosComplianceStatus] Error:', error)
      throw error
    }

    return data || []
  } catch (err) {
    console.error('[getMaestrosComplianceStatus] Exception:', err)
    throw err
  }
}

/**
 * Get pending registros for a specific maestro with current status
 */
export async function getMaestroPendingRegistros(maestroId) {
  try {
    const { data, error } = await supabase
      .from('registros_pendientes')
      .select(
        `
        id,
        created_at,
        notification_state,
        notif_count,
        last_notified_at,
        clases(nombre),
        sesiones_clase(fecha, hora_inicio)
        `
      )
      .eq('maestro_id', maestroId)
      .eq('estado', 'pendiente')
      .in('tipo', ['asistencia_pendiente', 'contenido_pendiente'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[getMaestroPendingRegistros] Error:', error)
      throw error
    }

    return data || []
  } catch (err) {
    console.error('[getMaestroPendingRegistros] Exception:', err)
    throw err
  }
}

/**
 * Get notification history for a specific maestro
 */
export async function getMaestroNotificationHistory(maestroId, limit = 20) {
  try {
    const { data, error } = await supabase
      .from('notificaciones')
      .select(
        `
        id,
        titulo,
        tipo,
        escalation_level,
        created_at,
        registro_pendiente_id,
        registros_pendientes(notification_state, clases(nombre))
        `
      )
      .eq('maestro_id', maestroId)
      .like('tipo', '%escalation%')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[getMaestroNotificationHistory] Error:', error)
      throw error
    }

    return data || []
  } catch (err) {
    console.error('[getMaestroNotificationHistory] Exception:', err)
    throw err
  }
}

/**
 * Get maestros filtered by compliance category
 */
export async function getMaestrosByCategory(categoria) {
  try {
    const { data, error } = await supabase
      .from('maestro_desempeño')
      .select(
        `
        id,
        maestro_id,
        maestros(id, nombre_completo),
        categoria,
        tendencia,
        sesiones_verde,
        sesiones_amarillo,
        sesiones_naranja,
        sesiones_rojo,
        updated_at
        `
      )
      .eq('categoria', categoria)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[getMaestrosByCategory] Error:', error)
      throw error
    }

    return data || []
  } catch (err) {
    console.error('[getMaestrosByCategory] Exception:', err)
    throw err
  }
}

/**
 * Get maestros with critical escalation state (NARANJA or ROJO)
 */
export async function getCriticalMaestros() {
  try {
    const { data: naranja, error: naranjErr } = await supabase
      .from('registros_pendientes')
      .select(
        `
        maestro_id,
        notification_state,
        created_at,
        maestros(nombre_completo, email)
        `
      )
      .eq('notification_state', 'NARANJA')
      .eq('estado', 'pendiente')
      .distinct('maestro_id')

    const { data: rojo, error: rojoErr } = await supabase
      .from('registros_pendientes')
      .select(
        `
        maestro_id,
        notification_state,
        created_at,
        maestros(nombre_completo, email)
        `
      )
      .eq('notification_state', 'ROJO')
      .eq('estado', 'pendiente')
      .distinct('maestro_id')

    if (naranjErr || rojoErr) {
      throw naranjErr || rojoErr
    }

    return {
      naranja: naranja || [],
      rojo: rojo || []
    }
  } catch (err) {
    console.error('[getCriticalMaestros] Exception:', err)
    throw err
  }
}

/**
 * Update maestro performance category (for admin manual override if needed)
 */
export async function updateMaestroCategory(maestroId, newCategory) {
  try {
    const { data, error } = await supabase
      .from('maestro_desempeño')
      .update({
        categoria: newCategory,
        fecha_ultima_evaluacion: new Date().toISOString()
      })
      .eq('maestro_id', maestroId)
      .select()

    if (error) {
      console.error('[updateMaestroCategory] Error:', error)
      throw error
    }

    return data?.[0] || null
  } catch (err) {
    console.error('[updateMaestroCategory] Exception:', err)
    throw err
  }
}
