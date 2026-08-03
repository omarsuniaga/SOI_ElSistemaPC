import { supabase } from '../../../lib/supabaseClient.js'

let colInstrumento = null

function resolverColumna(m) {
  if (colInstrumento) return colInstrumento
  if (m) {
    colInstrumento = 'instrumento_principal' in m ? 'instrumento_principal' : 'especialidad'
  }
  return colInstrumento || 'especialidad'
}

function normalizeMaestro(m) {
  if (!m) return null
  return {
    ...m,
    user_id: m.user_id ?? null,
    nombre: m.nombre_completo ?? '',
    email: m.correo ?? '',
    telefono: m.tlf ?? '',
    instrumento: m.instrumento_principal ?? m.especialidad ?? '',
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

  if (data && data.length > 0) {
    resolverColumna(data[0])
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

  if (data) {
    resolverColumna(data)
  }

  return normalizeMaestro(data)
}

export async function crearMaestro(maestro) {
  const nombre = (maestro.nombre || maestro.nombre_completo || '').trim()
  if (!nombre) throw new Error('El nombre es obligatorio')

  const col = resolverColumna()

  const datosLimpios = {
    nombre_completo: nombre,
    correo: (maestro.email || maestro.correo || '').trim().toLowerCase() || null,
    tlf: (maestro.telefono || maestro.tlf || '').trim() || null,
    resena: (maestro.bio || maestro.resena || '').trim() || null,
    activo: maestro.is_active !== undefined ? maestro.is_active : (maestro.activo !== undefined ? maestro.activo : true),
    especialidades: Array.isArray(maestro.especialidades) ? maestro.especialidades : [],
    user_id: maestro.user_id || null,
  }

  datosLimpios[col] = (maestro.instrumento || maestro.especialidad || '').trim() || null

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
  if (especialidad !== undefined) {
    const col = resolverColumna()
    datosActualizacion[col] = especialidad.trim()
  }

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

/**
 * Desactiva un maestro (soft delete) en lugar de eliminarlo
 * El maestro seguirá existiendo en la BD pero marcado como inactivo
 */
export async function inactivarMaestro(id) {
  const { error } = await supabase
    .from('maestros')
    .update({ activo: false })
    .eq('id', id)

  if (error) {
    console.error('Error inactivando maestro:', error.message)
    throw new Error('No se pudo desactivar el maestro')
  }
}

/**
 * Reactiva un maestro previamente inactivado
 */
export async function activarMaestro(id) {
  const { error } = await supabase
    .from('maestros')
    .update({ activo: true })
    .eq('id', id)

  if (error) {
    console.error('Error activando maestro:', error.message)
    throw new Error('No se pudo activar el maestro')
  }
}

/**
 * Elimina permanentemente un maestro (hard delete)
 * Solo se permite si no tiene clases asignadas
 */
export async function eliminarMaestro(id) {
  const { error } = await supabase.from('maestros').delete().eq('id', id)
  if (error) {
    console.error('Error eliminando maestro:', error.message)

    // Errores específicos de integridad referencial
    if (error.code === '23503' || error.message.includes('foreign key')) {
      throw new Error('No se puede eliminar este maestro porque tiene clases asignadas. Desasigna las clases primero.')
    }

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

/**
 * Verifica si un email ya tiene credenciales de acceso (user_id asignado).
 * Un maestro con fila en `maestros` pero sin user_id (cargado previamente
 * con sus clases, sin login todavía) NO cuenta como "ya registrado": ese es
 * justamente el caso que `crearMaestroConAuth` debe poder resolver.
 */
export async function validarEmail(email) {
  const { data, error } = await supabase
    .from('maestros')
    .select('id, user_id')
    .eq('correo', email.trim().toLowerCase())
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('Error validando email:', error.message)
  }

  return !!data?.user_id
}

/**
 * Crea un maestro completo: auth user + perfil activo + row en maestros.
 *
 * La creación corre en la Edge Function `create-user` (service role): no
 * toca la sesión del coordinador que la invoca, y evita el auth hook de
 * envío de email que dispara supabase.auth.signUp() del lado cliente. Si ya
 * existe una fila en `maestros` con ese correo (maestro cargado antes, con
 * clases ya asignadas, sin credenciales), la Edge Function la vincula en vez
 * de crear una duplicada.
 */
export async function crearMaestroConAuth({ nombre, email, password, telefono, instrumento, especialidades, bio }) {
  const nombreLimpio = (nombre || '').trim()
  if (!nombreLimpio) throw new Error('El nombre es obligatorio')

  const emailLimpio = (email || '').trim().toLowerCase()
  if (!emailLimpio) throw new Error('El email es obligatorio')

  if (!password || password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres')
  }

  const { data, error } = await supabase.functions.invoke('create-user', {
    body: { nombre: nombreLimpio, email: emailLimpio, password, rol: 'maestro' },
  })

  if (error) {
    throw new Error(error.message || 'Error al crear el usuario')
  }
  if (data?.error) {
    throw new Error(data.error)
  }
  if (!data?.ok || !data?.user) {
    throw new Error('Respuesta inesperada del servidor')
  }

  const userId = data.user.id

  // Datos extra que la Edge Function no maneja (tlf, instrumento, especialidades, bio)
  const col = resolverColumna()
  const instrumentoLimpio = (instrumento || '').trim()
  const resenaLimpia = (bio || '').trim()
  const extra = {
    tlf: (telefono || '').trim() || null,
    especialidades: Array.isArray(especialidades) ? especialidades : [],
  }
  if (instrumentoLimpio) extra[col] = instrumentoLimpio
  if (resenaLimpia) extra.resena = resenaLimpia

  const { error: maestroUpdateErr } = await supabase
    .from('maestros')
    .update(extra)
    .eq('user_id', userId)

  if (maestroUpdateErr) {
    console.error('Error actualizando datos del maestro:', maestroUpdateErr.message)
  }

  const { data: maestroData } = await supabase
    .from('maestros')
    .select('*')
    .eq('user_id', userId)
    .single()

  return normalizeMaestro({
    user_id: userId,
    nombre_completo: nombreLimpio,
    correo: emailLimpio,
    activo: true,
    ...(maestroData || {}),
  })
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
