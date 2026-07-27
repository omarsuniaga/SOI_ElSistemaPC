import { supabase } from '../../../lib/supabaseClient.js'

export async function obtenerSesiones(filtros = {}) {
  const { soloConContenido, ...rest } = filtros

  let query = supabase.from('sesiones_clase').select('*').order('fecha', { ascending: false })

  if (rest.fecha) {
    query = query.eq('fecha', rest.fecha)
  }
  if (rest.clase_id) {
    query = query.eq('clase_id', rest.clase_id)
  }
  if (rest.maestro_id) {
    query = query.eq('maestro_id', rest.maestro_id)
  }
  if (rest.tipo) {
    query = query.eq('tipo', rest.tipo)
  }
  if (soloConContenido) {
    query = query.eq('borrador', false).not('contenido', 'is', null).neq('contenido', '')
  }

  const { data, error } = await query
  if (error) {
    console.error('Error cargando sesiones:', error.message)
    throw new Error('No se pudieron cargar las sesiones')
  }
  return data
}

export async function obtenerSesionPorId(id) {
  const { data, error } = await supabase.from('sesiones_clase').select('*').eq('id', id).single()
  if (error) {
    console.error('Error cargando sesión:', error.message)
    throw new Error('Sesión no encontrada')
  }
  return data
}

export async function crearSesion(sesion) {
  if (!sesion.clase_id) {
    throw new Error('La clase es obligatoria')
  }
  if (!sesion.fecha) {
    throw new Error('La fecha es obligatoria')
  }
  if (!sesion.tema) {
    throw new Error('El tema es obligatorio')
  }

  let horarioId = null
  let salonId = null

  const fecha = new Date(sesion.fecha)
  const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const diaString = diasSemana[fecha.getDay()].toLowerCase()

  const { data: horarios, error: errorHorarios } = await supabase
    .from('clase_horarios')
    .select('id, salon_id')
    .eq('clase_id', sesion.clase_id)
    .eq('dia', diaString)
    .limit(1)

  if (!errorHorarios && horarios && horarios.length > 0) {
    horarioId = horarios[0].id
    salonId = horarios[0].salon_id
  }

  const datosLimpios = {
    clase_id: sesion.clase_id,
    maestro_id: sesion.maestro_id || null,
    fecha: sesion.fecha,
    hora_inicio: sesion.hora_inicio || null,
    hora_fin: sesion.hora_fin || null,
    horario_id: horarioId,
    salon_id: salonId,
    tema: sesion.tema.trim(),
    contenido: sesion.contenido?.trim() || null,
    motivo: sesion.motivo?.trim() || null,
    tipo: sesion.tipo || 'regular',
    estado: sesion.estado || 'pendiente',
    es_codocencia: sesion.es_codocencia || false,
    maestro_auxiliar_id: sesion.maestro_auxiliar_id || null,
    asistencia: null,
  }

  const { data, error } = await supabase.from('sesiones_clase').insert([datosLimpios]).select()
  if (error) {
    console.error('Error creando sesión:', error.message)
    throw new Error('No se pudo crear la sesión')
  }
  return data[0]
}

export async function actualizarSesion(id, actualizaciones) {
  const datosActualizacion = {}

  if (actualizaciones.tema !== undefined) {
    datosActualizacion.tema = actualizaciones.tema.trim()
  }
  if (actualizaciones.contenido !== undefined) {
    datosActualizacion.contenido = actualizaciones.contenido?.trim() || null
  }
  if (actualizaciones.hora_inicio !== undefined) {
    datosActualizacion.hora_inicio = actualizaciones.hora_inicio
  }
  if (actualizaciones.hora_fin !== undefined) {
    datosActualizacion.hora_fin = actualizaciones.hora_fin
  }
  if (actualizaciones.estado !== undefined) {
    datosActualizacion.estado = actualizaciones.estado
  }
  if (actualizaciones.asistencia !== undefined) {
    datosActualizacion.asistencia = actualizaciones.asistencia
  }
  if (actualizaciones.es_codocencia !== undefined) {
    datosActualizacion.es_codocencia = actualizaciones.es_codocencia
  }
  if (actualizaciones.maestro_auxiliar_id !== undefined) {
    datosActualizacion.maestro_auxiliar_id = actualizaciones.maestro_auxiliar_id
  }

  const { data, error } = await supabase
    .from('sesiones_clase')
    .update(datosActualizacion)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error actualizando sesión:', error.message)
    throw new Error('No se pudo actualizar la sesión')
  }
  return data[0]
}

export async function eliminarSesion(id) {
  const { error } = await supabase.from('sesiones_clase').delete().eq('id', id)
  if (error) {
    console.error('Error eliminando sesión:', error.message)
    throw new Error('No se pudo eliminar la sesión')
  }
  return { success: true }
}

export async function registrarAsistencia(sesionId, asistencia) {
  const datosActualizacion = {
    asistencia: asistencia || [],
  }
  return actualizarSesion(sesionId, datosActualizacion)
}

export async function obtenerSesionesCoDocencia(maestroAuxiliarId) {
  const { data, error } = await supabase
    .from('sesiones_clase')
    .select('*')
    .eq('maestro_auxiliar_id', maestroAuxiliarId)
    .order('fecha', { ascending: false })

  if (error) {
    console.error('Error cargando sesiones de co-docencia:', error.message)
    throw new Error('Error al cargar sesiones')
  }
  return data
}

export async function obtenerSesionesPorFechaYClase(fecha, claseId) {
  const { data, error } = await supabase
    .from('sesiones_clase')
    .select('*')
    .eq('fecha', fecha)
    .eq('clase_id', claseId)

  if (error) {
    console.error('Error cargando sesiones:', error.message)
    throw new Error('Error al cargar sesiones')
  }
  return data
}

export async function obtenerClasesDelMaestro(maestroId) {
  const { data, error } = await supabase
    .from('clases')
    .select('*')
    .or(`maestro_principal_id.eq.${maestroId},maestro_auxiliar_id.eq.${maestroId}`)

  if (error) {
    console.error('Error cargando clases del maestro:', error.message)
    throw new Error('Error al cargar clases')
  }
  return data
}
