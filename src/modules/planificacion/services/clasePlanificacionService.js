/**
 * clasePlanificacionService.js — Service layer for class_curriculum_plan CRUD
 *
 * Manages the bridge between clases and route_versions. Each class can have
 * exactly ONE active route (estado='activo'). Assigning a new route archives
 * the previous active one.
 *
 * Pattern: pure service functions using Supabase client directly.
 * Follows DataAdapter conventions — this is the Supabase implementation.
 */

import { supabase } from '../../../lib/supabaseClient.js'

const ESTADOS_VALIDOS = ['borrador', 'activo', 'archivado']

/**
 * Asigna una ruta curricular a una clase. Si ya existe una ruta activa,
 * la archiva antes de crear la nueva.
 *
 * @param {string} claseId - ID de la clase
 * @param {string} routeVersionId - ID de la versión de ruta
 * @returns {Promise<object>} El registro creado en class_curriculum_plan
 */
export async function asignarRutaAClase(claseId, routeVersionId) {
  if (!claseId || !routeVersionId) {
    throw new Error('claseId y routeVersionId son requeridos')
  }

  // Archivar ruta activa anterior si existe
  const { data: existing } = await supabase
    .from('class_curriculum_plan')
    .select('id')
    .eq('clase_id', claseId)
    .eq('estado', 'activo')
    .maybeSingle()

  if (existing?.id) {
    await supabase
      .from('class_curriculum_plan')
      .update({ estado: 'archivado' })
      .eq('id', existing.id)
  }

  // Crear nueva ruta activa
  const { data, error } = await supabase
    .from('class_curriculum_plan')
    .insert({
      clase_id: claseId,
      route_version_id: routeVersionId,
      estado: 'activo',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Obtiene la ruta asignada a una clase (cualquier estado).
 *
 * @param {string} claseId - ID de la clase
 * @returns {Promise<object|null>} Registro de class_curriculum_plan o null
 */
export async function obtenerRutaDeClase(claseId) {
  const { data, error } = await supabase
    .from('class_curriculum_plan')
    .select('*')
    .eq('clase_id', claseId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

/**
 * Obtiene la ruta ACTIVA de una clase.
 *
 * @param {string} claseId - ID de la clase
 * @returns {Promise<object|null>} Registro activo o null
 */
export async function obtenerRutaActivaPorClase(claseId) {
  const { data, error } = await supabase
    .from('class_curriculum_plan')
    .select('*')
    .eq('clase_id', claseId)
    .eq('estado', 'activo')
    .maybeSingle()

  if (error) throw error
  return data
}

/**
 * Cambia el estado de un plan curricular de clase.
 *
 * @param {string} claseId - ID de la clase
 * @param {string} nuevoEstado - Nuevo estado (borrador|activo|archivado)
 * @returns {Promise<object>} Registro actualizado
 */
export async function cambiarEstadoPlan(claseId, nuevoEstado) {
  if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
    throw new Error('Estado no válido')
  }

  const { data, error } = await supabase
    .from('class_curriculum_plan')
    .update({ estado: nuevoEstado })
    .eq('clase_id', claseId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Elimina el plan curricular de una clase.
 *
 * @param {string} claseId - ID de la clase
 * @returns {Promise<void>}
 */
export async function eliminarRutaDeClase(claseId) {
  const { error } = await supabase
    .from('class_curriculum_plan')
    .delete()
    .eq('clase_id', claseId)

  if (error) throw error
}
