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

/** Obtiene las relaciones que se deben resolver antes de retirar un maestro. */
export async function previsualizarRetiroMaestro(id) {
  const { data, error } = await supabase.rpc('preview_retiro_maestro', {
    p_maestro_id: id,
  })

  if (error) throw new Error(error.message || 'No se pudo analizar las relaciones del maestro')
  return data
}

/**
 * Retira un maestro sin borrar su historia académica. Las clases principales
 * se transfieren en la misma transacción al maestro indicado.
 */
export async function retirarMaestroSeguro(id, replacementId, motivo = '') {
  const { data, error } = await supabase.rpc('retirar_maestro_seguro', {
    p_maestro_id: id,
    p_reemplazo_maestro_id: replacementId || null,
    p_motivo: motivo || null,
  })

  if (error) throw new Error(error.message || 'No se pudo retirar el maestro')
  return data
}

export async function reactivarMaestroSeguro(id) {
  const { error } = await supabase.rpc('reactivar_maestro_seguro', {
    p_maestro_id: id,
  })

  if (error) throw new Error(error.message || 'No se pudo reactivar el maestro')
}

/**
 * Inactiva un maestro de forma segura (soft delete / estado inactivo),
 * revocando credenciales y permisos sin borrar el historial.
 */
export async function inactivarMaestro(id, motivo = 'Inactivado desde gestión de maestros') {
  // 1. Intentar actualizar estado en tabla maestros
  const { error: updErr } = await supabase
    .from('maestros')
    .update({
      is_active: false,
      estado: 'inactivo',
      fecha_actualizacion: new Date().toISOString(),
    })
    .eq('id', id)

  // 2. Desactivar credenciales de acceso maestro si existen
  await supabase
    .from('maestro_access_credentials')
    .update({ is_active: false })
    .eq('maestro_id', id)
    .catch(() => {})

  // 3. Desactivar permisos
  await supabase
    .from('permisos_maestros')
    .update({ puede_planificar: false, puede_asistir: false })
    .eq('maestro_id', id)
    .catch(() => {})

  if (updErr) {
    // Fallback con solo is_active
    const { error: err2 } = await supabase
      .from('maestros')
      .update({ is_active: false })
      .eq('id', id)
    if (err2) throw new Error(err2.message || 'No se pudo inactivar al maestro')
  }
  return true
}

/**
 * Elimina permanentemente un maestro (hard delete).
 * Evalúa en base de datos si no tiene clases asignadas y limpia credenciales/permisos.
 */
export async function eliminarMaestro(id) {
  const { data, error: rpcError } = await supabase.rpc('eliminar_maestro_limpio', {
    p_maestro_id: id,
  })

  if (!rpcError) return data

  if (rpcError.code === '23503' || rpcError.message.includes('clase(s) asignada(s)')) {
    throw new Error(rpcError.message)
  }

  // Fallback a delete directo
  const { error } = await supabase.from('maestros').delete().eq('id', id)
  if (error) {
    console.error('Error eliminando maestro:', error.message)
    if (error.code === '23503' || error.message.includes('foreign key')) {
      throw new Error('No se puede eliminar este maestro porque tiene clases o historial asignado. Reasigna o retira el maestro primero.')
    }
    throw new Error(error.message || 'No se pudo eliminar el maestro')
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

/**
 * Crea un maestro completo: auth user + perfil activo + row en maestros.
 */
export async function crearMaestroConAuth({ nombre, email, password, telefono, instrumento, especialidades, bio }) {
  const nombreLimpio = (nombre || '').trim()
  if (!nombreLimpio) throw new Error('El nombre es obligatorio')

  const emailLimpio = (email || '').trim().toLowerCase()
  if (!emailLimpio) throw new Error('El email es obligatorio')

  if (!password || password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres')
  }

  const instrumentoLimpio = (instrumento || '').trim()
  const resenaLimpia = (bio || '').trim()

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: emailLimpio,
    password,
    options: {
      data: {
        full_name: nombreLimpio,
        rol: 'maestro',
        instrumento: instrumentoLimpio,
        resena: resenaLimpia || null,
      },
    },
  })

  if (signUpError) {
    throw new Error(signUpError.message || 'Error al crear usuario')
  }

  if (!authData?.user) {
    throw new Error('No se pudo crear el usuario')
  }

  const userId = authData.user.id

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      estado: 'activo',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (profileError) {
    console.error('Error activando profile:', profileError.message)
  }

  const col = resolverColumna()
  const { error: maestroUpdateErr } = await supabase
    .from('maestros')
    .update({
      tlf: (telefono || '').trim() || null,
      especialidades: Array.isArray(especialidades) ? especialidades : [],
    })
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
