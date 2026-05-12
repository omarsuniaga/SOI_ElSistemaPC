import { supabase } from '../../../lib/supabaseClient.js'

export async function obtenerPlanificaciones() {
  const { data, error } = await supabase
    .from('planificaciones')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error cargando planificaciones:', error.message)
    throw new Error('No se pudieron cargar las planificaciones')
  }

  return data
}

export async function obtenerPlanificacion(id) {
  const { data, error } = await supabase
    .from('planificaciones')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error cargando planificación:', error.message)
    throw new Error('Planificación no encontrada')
  }

  return data
}

export async function crearPlanificacion(plan) {
  if (!plan.tema || !plan.tema.trim()) {
    throw new Error('El tema es obligatorio')
  }

  if (!plan.clase_id) {
    throw new Error('La clase es obligatoria')
  }

  const datosLimpios = {
    clase_id: plan.clase_id,
    maestro_id: plan.maestro_id || null,
    fecha_inicio: plan.fecha_inicio || null,
    tema: plan.tema.trim(),
    objetivos: (plan.objetivos || '').trim(),
    contenido: (plan.contenido || '').trim(),
    recursos: Array.isArray(plan.recursos) ? plan.recursos.map(r => r.trim()).filter(r => r) : [],
    evaluacion_metodo: (plan.evaluacion_metodo || '').trim(),
    observaciones: (plan.observaciones || '').trim(),
    instrumento: plan.instrumento ? plan.instrumento.trim() : null,
    estado: plan.estado || 'planificado',
  }

  const { data, error } = await supabase
    .from('planificaciones')
    .insert([datosLimpios])
    .select()

  if (error) {
    console.error('Error creando planificación:', error.message)
    throw new Error('No se pudo crear la planificación')
  }

  return data[0]
}

export async function actualizarPlanificacion(id, actualizaciones) {
  if (actualizaciones.tema !== undefined && !actualizaciones.tema.trim()) {
    throw new Error('El tema no puede estar vacío')
  }

  const datosActualizacion = {}

  if (actualizaciones.clase_id !== undefined) {
    datosActualizacion.clase_id = actualizaciones.clase_id
  }

  if (actualizaciones.maestro_id !== undefined) {
    datosActualizacion.maestro_id = actualizaciones.maestro_id || null
  }

  if (actualizaciones.fecha_inicio !== undefined) {
    datosActualizacion.fecha_inicio = actualizaciones.fecha_inicio
  }

  if (actualizaciones.tema !== undefined) {
    datosActualizacion.tema = actualizaciones.tema.trim()
  }

  if (actualizaciones.objetivos !== undefined) {
    datosActualizacion.objetivos = (actualizaciones.objetivos || '').trim()
  }

  if (actualizaciones.contenido !== undefined) {
    datosActualizacion.contenido = (actualizaciones.contenido || '').trim()
  }

  if (actualizaciones.recursos !== undefined) {
    datosActualizacion.recursos = Array.isArray(actualizaciones.recursos)
      ? actualizaciones.recursos.map(r => r.trim()).filter(r => r)
      : []
  }

  if (actualizaciones.evaluacion_metodo !== undefined) {
    datosActualizacion.evaluacion_metodo = (actualizaciones.evaluacion_metodo || '').trim()
  }

  if (actualizaciones.observaciones !== undefined) {
    datosActualizacion.observaciones = (actualizaciones.observaciones || '').trim()
  }

  if (actualizaciones.instrumento !== undefined) {
    datosActualizacion.instrumento = actualizaciones.instrumento
      ? actualizaciones.instrumento.trim()
      : null
  }

  if (actualizaciones.estado !== undefined) {
    datosActualizacion.estado = actualizaciones.estado
  }

  const { data, error } = await supabase
    .from('planificaciones')
    .update(datosActualizacion)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error actualizando planificación:', error.message)
    throw new Error('No se pudo actualizar la planificación')
  }

  return data[0]
}

export async function eliminarPlanificacion(id) {
  const { error } = await supabase
    .from('planificaciones')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error eliminando planificación:', error.message)
    throw new Error('No se pudo eliminar la planificación')
  }
}

export async function obtenerPlanificacionesPorClase(claseId) {
  const { data, error } = await supabase
    .from('planificaciones')
    .select('*')
    .eq('clase_id', claseId)
    .order('fecha_inicio', { ascending: false })

  if (error) {
    console.error('Error filtrando por clase:', error.message)
    throw new Error('No se pudieron cargar las planificaciones de la clase')
  }

  return data
}

export async function obtenerPlanificacionesPorMaestro(maestroId) {
  const { data, error } = await supabase
    .from('planificaciones')
    .select('*')
    .eq('maestro_id', maestroId)
    .order('fecha_inicio', { ascending: false })

  if (error) {
    console.error('Error filtrando por maestro:', error.message)
    throw new Error('No se pudieron cargar las planificaciones del maestro')
  }

  return data
}

export async function marcarEjecutada(id) {
  const { data, error } = await supabase
    .from('planificaciones')
    .update({ estado: 'ejecutado' })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error marcando como ejecutada:', error.message)
    throw new Error('No se pudo actualizar el estado')
  }

  return data[0]
}

export async function marcarRevisada(id) {
  const { data, error } = await supabase
    .from('planificaciones')
    .update({ estado: 'revisado' })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error marcando como revisada:', error.message)
    throw new Error('No se pudo actualizar el estado')
  }

  return data[0]
}

export async function buscarPlanificaciones(query) {
  if (!query || !query.trim()) {
    return obtenerPlanificaciones()
  }

  const searchTerm = query.trim().toLowerCase()
  const { data, error } = await supabase
    .from('planificaciones')
    .select('*')
    .or(`tema.ilike.%${searchTerm}%,contenido.ilike.%${searchTerm}%,objetivos.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })

  return data
}

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
    console.error('Error cargando planificaciones con detalles:', error.message)
    throw new Error('No se pudieron cargar las planificaciones')
  }

  // Aplanar la estructura para facilitar el uso en la vista
  return data.map(p => ({
    ...p,
    clase_nombre: p.clase?.nombre || 'Sin asignar',
    maestro_nombre: p.maestro?.nombre_completo || 'Sin asignar'
  }))
}

export async function marcarRevisadasMasivo(ids) {
  if (!ids || !ids.length) return []

  const { data, error } = await supabase
    .from('planificaciones')
    .update({ estado: 'revisado' })
    .in('id', ids)
    .select()

  if (error) {
    console.error('Error aprobando planificaciones en masa:', error.message)
    throw new Error('No se pudieron aprobar las planificaciones')
  }

  return data
}
