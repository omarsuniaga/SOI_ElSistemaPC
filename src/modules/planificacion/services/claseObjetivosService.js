/**
 * claseObjetivosService.js — Service layer for clase_objetivos CRUD
 *
 * Links planificaciones with specific nodes and indicators from the
 * curriculum route via class_curriculum_plan bridge.
 *
 * Pattern: pure service functions using Supabase client directly.
 */

import { supabase } from '../../../lib/supabaseClient.js'

const ESTADOS_VALIDOS = ['pendiente', 'en_progreso', 'completado']

/**
 * Bulk insert objectives linking a planificacion to nodes/indicators.
 *
 * @param {Array<object>} objetivos - Array of { planificacion_id, class_curriculum_plan_id, node_id, indicator_id, semana? }
 * @returns {Promise<Array<object>>} Inserted records
 */
export async function agregarObjetivos(objetivos) {
  if (!Array.isArray(objetivos) || objetivos.length === 0) {
    throw new Error('Se requiere al menos un objetivo')
  }

  const rows = objetivos.map((o) => ({
    planificacion_id: o.planificacion_id,
    class_curriculum_plan_id: o.class_curriculum_plan_id,
    node_id: o.node_id,
    indicator_id: o.indicator_id,
    semana: o.semana || null,
    estado: o.estado || 'pendiente',
  }))

  const { data, error } = await supabase
    .from('clase_objetivos')
    .insert(rows)
    .select()

  if (error) throw error
  return data
}

/**
 * Get all objectives for a planificacion, joined with nodes and indicators.
 *
 * @param {string} planificacionId - ID of the planificacion
 * @returns {Promise<Array<object>>} Objectives with node/indicator data
 */
export async function obtenerObjetivosPorPlanificacion(planificacionId) {
  const { data, error } = await supabase
    .from('clase_objetivos')
    .select('*')
    .eq('planificacion_id', planificacionId)
    .order('created_at')

  if (error) throw error
  return data || []
}

/**
 * Update a single objective's fields.
 *
 * @param {string} objetivoId - ID of the clase_objetivos record
 * @param {object} updates - Fields to update (estado, semana, etc.)
 * @returns {Promise<object>} Updated record
 */
export async function actualizarObjetivo(objetivoId, updates) {
  const allowedFields = ['estado', 'semana']
  const sanitized = {}
  for (const key of allowedFields) {
    if (updates[key] !== undefined) sanitized[key] = updates[key]
  }

  const { data, error } = await supabase
    .from('clase_objetivos')
    .update(sanitized)
    .eq('id', objetivoId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Remove all objectives for a planificacion (cascade delete).
 *
 * @param {string} planificacionId - ID of the planificacion
 * @returns {Promise<void>}
 */
export async function eliminarObjetivos(planificacionId) {
  const { error } = await supabase
    .from('clase_objetivos')
    .delete()
    .eq('planificacion_id', planificacionId)

  if (error) throw error
}

/**
 * Reorder objectives by updating their semana values.
 *
 * @param {string} planificacionId - ID of the planificacion
 * @param {Array<{id: string, semana: number}>} orden - New ordering
 * @returns {Promise<boolean>} true on success
 */
export async function reordenarObjetivos(planificacionId, orden) {
  if (!Array.isArray(orden)) return false

  for (const item of orden) {
    const { error } = await supabase
      .from('clase_objetivos')
      .update({ semana: item.semana })
      .eq('id', item.id)
      .eq('planificacion_id', planificacionId)

    if (error) throw error
  }

  return true
}
