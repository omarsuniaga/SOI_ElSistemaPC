import { supabase } from '../../../lib/supabaseClient.js'
import { Planificacion } from '../models/planificacion.model.js'

/**
 * PlanificacionApi - Adaptador para la persistencia de planes curriculares.
 */

export async function obtenerPlanificaciones() {
  const { data, error } = await supabase
    .from('planificaciones')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(p => new Planificacion(p))
}

export async function obtenerPlanificacion(id) {
  const { data, error } = await supabase
    .from('planificaciones')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return new Planificacion(data)
}

/**
 * Obtiene planificaciones enriquecidas con datos de clase y maestro
 */
export async function obtenerPlanificacionesConDetalles() {
  const { data, error } = await supabase
    .from('planificaciones')
    .select(`
      *,
      clase:clases (nombre),
      maestro:maestros (nombre_completo)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error cargando planificaciones:', error.message)
    throw new Error('No se pudieron cargar las planificaciones')
  }

  return data.map(p => new Planificacion({
    ...p,
    clase_nombre: p.clase?.nombre || 'Sin asignar',
    maestro_nombre: p.maestro?.nombre_completo || 'Sin asignar'
  }))
}

export async function crearPlanificacion(planData) {
  const model = new Planificacion(planData)
  const errores = model.validate()
  if (errores.length > 0) throw new Error(errores.join('. '))

  const { data, error } = await supabase
    .from('planificaciones')
    .insert([model.toJSON()])
    .select()

  if (error) throw error
  return new Planificacion(data[0])
}

export async function actualizarPlanificacion(id, actualizaciones) {
  // Para actualización parcial, primero obtenemos el original
  const { data: original } = await supabase.from('planificaciones').select('*').eq('id', id).single()
  const model = new Planificacion({ ...original, ...actualizaciones })
  
  const errores = model.validate()
  if (errores.length > 0) throw new Error(errores.join('. '))

  const { data, error } = await supabase
    .from('planificaciones')
    .update(model.toJSON())
    .eq('id', id)
    .select()

  if (error) throw error
  return new Planificacion(data[0])
}

export async function eliminarPlanificacion(id) {
  const { error } = await supabase
    .from('planificaciones')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function marcarRevisadasMasivo(ids) {
  if (!ids || !ids.length) return []

  const { data, error } = await supabase
    .from('planificaciones')
    .update({ estado: 'revisado' })
    .in('id', ids)
    .select()

  if (error) throw error
  return (data || []).map(p => new Planificacion(p))
}

export async function marcarRevisada(id) {
  return marcarRevisadasMasivo([id])
}

export async function marcarEjecutada(id) {
  return actualizarPlanificacion(id, { estado: 'ejecutado' })
}
