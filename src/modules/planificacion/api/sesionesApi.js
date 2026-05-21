import { supabase } from '../../../lib/supabaseClient.js'
import MOCK_CLASES from '../../../assets/data/mocks/clases.json'
import MOCK_SESIONES from '../../../assets/data/mocks/sesiones.json'

const USE_MOCK = !window.location.href.includes('supabase')

async function getMockData(dataKey) {
  await new Promise(resolve => setTimeout(resolve, 200))
  return USE_MOCK ? MOCK_CLASES[dataKey] || MOCK_SESIONES[dataKey] || [] : []
}

export async function obtenerSesiones(filtros = {}) {
  if (USE_MOCK) {
    let sesiones = [...MOCK_SESIONES.sesiones]
    
    if (filtros.fecha) {
      sesiones = sesiones.filter(s => s.fecha === filtros.fecha)
    }
    if (filtros.clase_id) {
      sesiones = sesiones.filter(s => s.clase_id === filtros.clase_id)
    }
    if (filtros.maestro_id) {
      sesiones = sesiones.filter(s => s.maestro_id === filtros.maestro_id)
    }
    if (filtros.tipo) {
      sesiones = sesiones.filter(s => s.tipo === filtros.tipo)
    }
    
    return sesiones
  }

  let query = supabase
    .from('sesiones_clase')
    .select('*')
    .order('fecha', { ascending: false })

  if (filtros.fecha) {
    query = query.eq('fecha', filtros.fecha)
  }
  if (filtros.clase_id) {
    query = query.eq('clase_id', filtros.clase_id)
  }
  if (filtros.maestro_id) {
    query = query.eq('maestro_id', filtros.maestro_id)
  }
  if (filtros.tipo) {
    query = query.eq('tipo', filtros.tipo)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error cargando sesiones:', error.message)
    throw new Error('No se pudieron cargar las sesiones')
  }

  return data
}

export async function obtenerSesionPorId(id) {
  if (USE_MOCK) {
    const sesion = MOCK_SESIONES.sesiones.find(s => s.id === id)
    if (!sesion) throw new Error('Sesión no encontrada')
    return sesion
  }

  const { data, error } = await supabase
    .from('sesiones_clase')
    .select('*')
    .eq('id', id)
    .single()

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

  // Obtener el horario correspondiente al día de la semana para llenar salon_id e horario_id
  let horarioId = null
  let salonId = null

  if (!USE_MOCK) {
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

  if (USE_MOCK) {
    const nuevaSesion = {
      ...datosLimpios,
      id: `sesion_${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    MOCK_SESIONES.sesiones.push(nuevaSesion)
    return nuevaSesion
  }

  const { data, error } = await supabase
    .from('sesiones_clase')
    .insert([datosLimpios])
    .select()

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

  if (USE_MOCK) {
    const idx = MOCK_SESIONES.sesiones.findIndex(s => s.id === id)
    if (idx === -1) throw new Error('Sesión no encontrada')
    
    MOCK_SESIONES.sesiones[idx] = {
      ...MOCK_SESIONES.sesiones[idx],
      ...datosActualizacion,
      updated_at: new Date().toISOString(),
    }
    return MOCK_SESIONES.sesiones[idx]
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
  if (USE_MOCK) {
    const idx = MOCK_SESIONES.sesiones.findIndex(s => s.id === id)
    if (idx === -1) throw new Error('Sesión no encontrada')
    MOCK_SESIONES.sesiones.splice(idx, 1)
    return { success: true }
  }

  const { error } = await supabase
    .from('sesiones_clase')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error eliminando sesión:', error.message)
    throw new Error('No se pudo eliminar la sesión')
  }

  return { success: true }
}

export async function registrarAsistencia(sesionId, asistencia) {
  // asistencia es un array de registros: [{alumno_id, estado: 'P'|'A'}, ...]
  const datosActualizacion = {
    asistencia: asistencia || [],
  }
  return actualizarSesion(sesionId, datosActualizacion)
}

export async function obtenerSesionesCoDocencia(maestroAuxiliarId) {
  if (USE_MOCK) {
    return MOCK_SESIONES.sesiones.filter(s => s.maestro_auxiliar_id === maestroAuxiliarId)
  }

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
  if (USE_MOCK) {
    return MOCK_SESIONES.sesiones.filter(s => s.fecha === fecha && s.clase_id === claseId)
  }

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
  if (USE_MOCK) {
    return MOCK_CLASES.clases.filter(c => c.maestro_titular_id === maestroId || c.maestro_auxiliar_id === maestroId)
  }

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