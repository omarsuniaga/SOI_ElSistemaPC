import { supabase } from '../../../lib/supabaseClient.js'

export async function obtenerObservaciones() {
  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error cargando observaciones:', error.message)
    throw new Error('No se pudieron cargar las observaciones')
  }

  return data
}

export async function obtenerObservacion(id) {
  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error cargando observación:', error.message)
    throw new Error('Observación no encontrada')
  }

  return data
}

export async function crearObservacion(obs) {
  if (!obs.alumno_id) {
    throw new Error('El alumno es obligatorio')
  }

  if (!obs.titulo || !obs.titulo.trim()) {
    throw new Error('El título es obligatorio')
  }

  if (!obs.descripcion || !obs.descripcion.trim()) {
    throw new Error('La descripción es obligatoria')
  }

  const datosLimpios = {
    alumno_id: obs.alumno_id,
    maestro_id: obs.maestro_id || null,
    tipo: (obs.tipo || 'comportamiento').trim(),
    titulo: obs.titulo.trim(),
    descripcion: obs.descripcion.trim(),
    observacion: obs.descripcion.trim(),
    prioridad: (obs.prioridad || 'media').trim(),
    estado: (obs.estado || 'abierta').trim(),
    fecha: obs.fecha_observacion || obs.fecha || new Date().toISOString().split('T')[0],
    fecha_observacion: obs.fecha_observacion || obs.fecha || new Date().toISOString().split('T')[0],
    requiere_seguimiento: obs.requiere_seguimiento ?? false,
    seguimiento_fecha: obs.seguimiento_fecha || null,
    seguimiento_observacion: (obs.seguimiento_observacion || '').trim() || null,
  }

  if (obs.clase_id) datosLimpios.clase_id = obs.clase_id
  if (obs.sesion_clase_id) datosLimpios.sesion_clase_id = obs.sesion_clase_id

  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .insert([datosLimpios])
    .select()

  if (error) {
    console.error('Error creando observación:', error.message)
    throw new Error('No se pudo crear la observación')
  }

  return data[0]
}

export async function actualizarObservacion(id, actualizaciones) {
  if (actualizaciones.titulo !== undefined && !actualizaciones.titulo.trim()) {
    throw new Error('El título no puede estar vacío')
  }

  if (actualizaciones.descripcion !== undefined && !actualizaciones.descripcion.trim()) {
    throw new Error('La descripción no puede estar vacía')
  }

  const datosActualizacion = {}

  if (actualizaciones.alumno_id !== undefined) datosActualizacion.alumno_id = actualizaciones.alumno_id
  if (actualizaciones.maestro_id !== undefined) datosActualizacion.maestro_id = actualizaciones.maestro_id || null
  if (actualizaciones.tipo !== undefined) datosActualizacion.tipo = actualizaciones.tipo.trim()
  if (actualizaciones.titulo !== undefined) {
    datosActualizacion.titulo = actualizaciones.titulo.trim()
  }
  if (actualizaciones.descripcion !== undefined) {
    datosActualizacion.descripcion = actualizaciones.descripcion.trim()
    datosActualizacion.observacion = actualizaciones.descripcion.trim()
  }
  if (actualizaciones.prioridad !== undefined) datosActualizacion.prioridad = actualizaciones.prioridad.trim()
  if (actualizaciones.estado !== undefined) datosActualizacion.estado = actualizaciones.estado.trim()
  if (actualizaciones.fecha_observacion !== undefined) {
    datosActualizacion.fecha_observacion = actualizaciones.fecha_observacion
    datosActualizacion.fecha = actualizaciones.fecha_observacion
  }
  if (actualizaciones.requiere_seguimiento !== undefined) datosActualizacion.requiere_seguimiento = actualizaciones.requiere_seguimiento
  if (actualizaciones.seguimiento_fecha !== undefined) datosActualizacion.seguimiento_fecha = actualizaciones.seguimiento_fecha
  if (actualizaciones.seguimiento_observacion !== undefined) {
    datosActualizacion.seguimiento_observacion = (actualizaciones.seguimiento_observacion || '').trim() || null
  }
  if (actualizaciones.clase_id !== undefined) datosActualizacion.clase_id = actualizaciones.clase_id

  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .update(datosActualizacion)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error actualizando observación:', error.message)
    throw new Error('No se pudo actualizar la observación')
  }

  return data[0]
}

export async function eliminarObservacion(id) {
  const { error } = await supabase
    .from('observaciones_alumnos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error eliminando observación:', error.message)
    throw new Error('No se pudo eliminar la observación')
  }
}

export async function obtenerObservacionesPorAlumno(alumnoId) {
  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .select('*')
    .eq('alumno_id', alumnoId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error cargando observaciones del alumno:', error.message)
    throw new Error('No se pudieron cargar las observaciones del alumno')
  }

  return data
}

export async function obtenerObservacionesPorTipo(tipo) {
  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .select('*')
    .eq('tipo', tipo)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error filtrando observaciones:', error.message)
    throw new Error('No se pudieron filtrar las observaciones')
  }

  return data
}

export async function obtenerObservacionesAbiertas() {
  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .select('*')
    .eq('estado', 'abierta')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error cargando observaciones abiertas:', error.message)
    throw new Error('No se pudieron cargar las observaciones abiertas')
  }

  return data
}

export async function agregarSeguimiento(id, fechaSeguimiento, observacionSeguimiento) {
  if (!observacionSeguimiento || !observacionSeguimiento.trim()) {
    throw new Error('La observación de seguimiento es obligatoria')
  }

  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .update({
      seguimiento_fecha: fechaSeguimiento || new Date().toISOString().split('T')[0],
      seguimiento_observacion: observacionSeguimiento.trim(),
      estado: 'seguimiento',
      requiere_seguimiento: true,
    })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error agregando seguimiento:', error.message)
    throw new Error('No se pudo agregar el seguimiento')
  }

  return data[0]
}

export async function resolverObservacion(id) {
  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .update({ estado: 'resuelta', requiere_seguimiento: false })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error resolviendo observación:', error.message)
    throw new Error('No se pudo resolver la observación')
  }

  return data[0]
}

export async function cambiarPrioridad(id, nuevaPrioridad) {
  if (!nuevaPrioridad || !nuevaPrioridad.trim()) {
    throw new Error('La prioridad es obligatoria')
  }

  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .update({ prioridad: nuevaPrioridad.trim() })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error cambiando prioridad:', error.message)
    throw new Error('No se pudo cambiar la prioridad')
  }

  return data[0]
}

export async function getEstadisticas() {
  const { data: tipoData, error: tipoError } = await supabase
    .from('observaciones_alumnos')
    .select('tipo')

  const { data: estadoData, error: estadoError } = await supabase
    .from('observaciones_alumnos')
    .select('estado')

  const { data: prioridadData, error: prioridadError } = await supabase
    .from('observaciones_alumnos')
    .select('prioridad')

  if (tipoError || estadoError || prioridadError) {
    console.error('Error obteniendo estadísticas:', tipoError?.message || estadoError?.message || prioridadError?.message)
    throw new Error('No se pudieron obtener las estadísticas')
  }

  const countByTipo = (tipoData || []).reduce((acc, o) => {
    const tipo = o.tipo || 'sin-tipo'
    acc[tipo] = (acc[tipo] || 0) + 1
    return acc
  }, {})

  const countByEstado = (estadoData || []).reduce((acc, o) => {
    const estado = o.estado || 'sin-estado'
    acc[estado] = (acc[estado] || 0) + 1
    return acc
  }, {})

  const countByPrioridad = (prioridadData || []).reduce((acc, o) => {
    const prioridad = o.prioridad || 'sin-prioridad'
    acc[prioridad] = (acc[prioridad] || 0) + 1
    return acc
  }, {})

  return {
    total: (tipoData || []).length,
    porTipo: countByTipo,
    porEstado: countByEstado,
    porPrioridad: countByPrioridad,
  }
}
