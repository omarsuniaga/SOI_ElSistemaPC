import { supabase } from '../../../lib/supabaseClient.js'

function normalizeMaestro(m) {
  if (!m) return null
  return {
    ...m,
    user_id: m.user_id ?? null,
    nombre: m.nombre_completo ?? '',
    email: m.correo ?? '',
    telefono: m.tlf ?? '',
    instrumento: m.especialidad ?? '',
    bio: m.resena ?? '',
    is_active: m.activo ?? true,
    especialidades: Array.isArray(m.especialidades) ? m.especialidades : [],
  }
}

export async function obtenerMaestros() {
  const { data, error } = await supabase
    .from('maestros')
    .select('*')
    .order('nombre_completo', { ascending: true })

  if (error) {
    console.error('Error cargando maestros:', error.message)
    throw new Error('No se pudieron cargar los maestros')
  }

  return data.map(normalizeMaestro)
}

export async function obtenerMaestro(id) {
  const { data, error } = await supabase
    .from('maestros')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error cargando maestro:', error.message)
    throw new Error('Maestro no encontrado')
  }

  return normalizeMaestro(data)
}

export async function crearMaestro(maestro) {
  const nombre = (maestro.nombre || maestro.nombre_completo || '').trim()
  if (!nombre) throw new Error('El nombre es obligatorio')

  const datosLimpios = {
    nombre_completo: nombre,
    correo: (maestro.email || maestro.correo || '').trim().toLowerCase() || null,
    tlf: (maestro.telefono || maestro.tlf || '').trim() || null,
    especialidad: (maestro.instrumento || maestro.especialidad || '').trim() || null,
    resena: (maestro.bio || maestro.resena || '').trim() || null,
    activo: maestro.is_active !== undefined ? maestro.is_active : (maestro.activo !== undefined ? maestro.activo : true),
    especialidades: Array.isArray(maestro.especialidades) ? maestro.especialidades : [],
    user_id: maestro.user_id || null,
  }

  const { data, error } = await supabase
    .from('maestros')
    .insert([datosLimpios])
    .select()

  if (error) {
    console.error('Error creando maestro:', error.message)
    throw new Error('No se pudo crear el maestro')
  }


  return normalizeMaestro(data[0])
}

export async function actualizarMaestro(id, actualizaciones) {
  const datosActualizacion = {}

  const nombre = actualizaciones.nombre || actualizaciones.nombre_completo
  if (nombre !== undefined) datosActualizacion.nombre_completo = nombre.trim()

  const correo = actualizaciones.email || actualizaciones.correo
  if (correo !== undefined) datosActualizacion.correo = correo.trim().toLowerCase()

  const tlf = actualizaciones.telefono || actualizaciones.tlf
  if (tlf !== undefined) datosActualizacion.tlf = tlf.trim()

  const especialidad = actualizaciones.instrumento || actualizaciones.especialidad
  if (especialidad !== undefined) datosActualizacion.especialidad = especialidad.trim()

  const resena = actualizaciones.bio || actualizaciones.resena
  if (resena !== undefined) datosActualizacion.resena = resena.trim()

  if (actualizaciones.is_active !== undefined) datosActualizacion.activo = actualizaciones.is_active
  if (actualizaciones.activo !== undefined) datosActualizacion.activo = actualizaciones.activo

  if (actualizaciones.especialidades !== undefined) {
    datosActualizacion.especialidades = Array.isArray(actualizaciones.especialidades) ? actualizaciones.especialidades : []
  }

  const { data, error } = await supabase
    .from('maestros')
    .update(datosActualizacion)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error actualizando maestro:', error.message)
    throw new Error('No se pudo actualizar el maestro')
  }

  return normalizeMaestro(data[0])
}

export async function eliminarMaestro(id) {
  const { error } = await supabase.from('maestros').delete().eq('id', id)
  if (error) {
    console.error('Error eliminando maestro:', error.message)
    throw new Error('No se pudo eliminar el maestro')
  }
}

export async function buscarMaestros(query) {
  if (!query?.trim()) return obtenerMaestros()

  const searchTerm = query.trim().toLowerCase()
  const { data, error } = await supabase
    .from('maestros')
    .select('*')
    .or(`nombre_completo.ilike.%${searchTerm}%,correo.ilike.%${searchTerm}%,especialidad.ilike.%${searchTerm}%`)
    .order('nombre_completo', { ascending: true })

  if (error) {
    console.error('Error buscando maestros:', error.message)
    throw new Error('Error en la búsqueda')
  }

  return data.map(normalizeMaestro)
}

export async function validarEmail(email) {
  const { data, error } = await supabase
    .from('maestros')
    .select('id')
    .eq('correo', email.trim().toLowerCase())
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('Error validando email:', error.message)
  }

  return !!data
}

export async function obtenerMaestrosActivos() {
  const { data, error } = await supabase
    .from('maestros')
    .select('*')
    .eq('activo', true)
    .order('nombre_completo', { ascending: true })

  if (error) throw new Error('No se pudieron cargar los maestros')
  return data.map(normalizeMaestro)
}
