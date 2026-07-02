import { supabase } from '../../../lib/supabaseClient.js'

function normalizePermiso(p) {
  if (!p) return null
  return {
    ...p,
    id: p.id,
    maestro_id: p.maestro_id ?? '',
    maestro_nombre: p.maestros?.nombre_completo ?? '',
    maestro_email: p.maestros?.correo ?? '',
    puede_registrar_alumnos: p.puede_registrar_alumnos ?? false,
    puede_inscribir_clases: p.puede_inscribir_clases ?? false,
    permisos: Array.isArray(p.permisos) ? p.permisos : [],
    solicitudes: Array.isArray(p.solicitudes) ? p.solicitudes : [],
    concedido_por: p.concedido_por ?? null,
    concedido_por_nombre: null, // se llena desde JOIN si es necesario
    creado_en: p.creado_en || null,
    actualizado_en: p.actualizado_en || null,
  }
}

export async function obtenerPermisos() {
  const { data, error } = await supabase
    .from('permisos_maestros')
    .select('*, maestros!permisos_maestros_maestro_id_fkey(nombre_completo, correo)')
    .order('creado_en', { ascending: false })

  if (error) {
    console.error('Error cargando permisos:', error.message)
    throw new Error('No se pudieron cargar los permisos')
  }

  return data.map(normalizePermiso)
}

export async function obtenerPermisoPorMaestro(maestroId) {
  const { data, error } = await supabase
    .from('permisos_maestros')
    .select('*, maestros!permisos_maestros_maestro_id_fkey(nombre_completo, correo)')
    .eq('maestro_id', maestroId)
    .maybeSingle()

  if (error) {
    console.error('Error cargando permiso:', error.message)
    throw new Error('No se pudo cargar el permiso')
  }

  return normalizePermiso(data)
}

export async function actualizarPermiso(maestroId, changes) {
  // First read the current row so we never overwrite fields not included in `changes`
  const { data: current } = await supabase
    .from('permisos_maestros')
    .select('puede_registrar_alumnos, puede_inscribir_clases, permisos, solicitudes')
    .eq('maestro_id', maestroId)
    .maybeSingle()

  const datosLimpios = {
    maestro_id: maestroId,
    // Preserve existing boolean value when the field is not explicitly in changes
    puede_registrar_alumnos:
      'puede_registrar_alumnos' in changes
        ? (changes.puede_registrar_alumnos ?? false)
        : (current?.puede_registrar_alumnos ?? false),
    puede_inscribir_clases:
      'puede_inscribir_clases' in changes
        ? (changes.puede_inscribir_clases ?? false)
        : (current?.puede_inscribir_clases ?? false),
    permisos: Array.isArray(changes.permisos) ? changes.permisos : (current?.permisos ?? []),
    solicitudes: Array.isArray(changes.solicitudes) ? changes.solicitudes : (current?.solicitudes ?? []),
    concedido_por: changes.concedido_por || null,
  }

  const { data, error } = await supabase
    .from('permisos_maestros')
    .upsert(datosLimpios, { onConflict: 'maestro_id' })
    .select()
    .single()

  if (error) {
    console.error('Error actualizando permiso:', error.message)
    throw new Error('No se pudo actualizar el permiso')
  }

  return normalizePermiso(data)
}

// ===== SOLICITUDES DE PERMISOS =====

function normalizeSolicitud(s) {
  if (!s) return null
  return {
    id: s.id,
    maestro_id: s.maestro_id ?? '',
    maestro_nombre: s.maestros?.nombre_completo ?? '',
    maestro_email: s.maestros?.correo ?? '',
    solicita_alumnos: s.solicita_alumnos ?? false,
    solicita_clases: s.solicita_clases ?? false,
    estado: s.estado ?? 'pendiente',
    creado_en: s.creado_en || null,
    actualizado_en: s.actualizado_en || null,
    aprobado_en: s.aprobado_en || null,
    aprobado_por: s.aprobado_por || null,
    aprobado_por_nombre: s.maestros_aprobado?.nombre_completo ?? '',
    motivo_rechazo: s.motivo_rechazo || null,
  }
}

export async function crearSolicitud(maestroId, solicita_alumnos, solicita_clases) {
  if (!maestroId) {
    throw new Error('maestroId es requerido')
  }

  // Check if already has pending solicitud
  const { data: existing } = await supabase
    .from('solicitudes_permisos')
    .select('id, estado')
    .eq('maestro_id', maestroId)
    .eq('estado', 'pendiente')
    .maybeSingle()

  if (existing) {
    throw new Error('Ya existe una solicitud pendiente para este maestro')
  }

  // Build tipos array based on what maestro is requesting
  const tipos = []
  if (solicita_alumnos) tipos.push('alumnos:create')
  if (solicita_clases) tipos.push('clases:enroll')

  const { data, error } = await supabase
    .from('solicitudes_permisos')
    .insert([{
      maestro_id: maestroId,
      solicita_alumnos: solicita_alumnos ?? false,
      solicita_clases: solicita_clases ?? false,
      tipos: tipos,
      estado: 'pendiente',
    }])
    .select('*, maestros!maestro_id(nombre_completo, correo)')
    .single()

  if (error) {
    console.error('Error creando solicitud:', error.message)
    throw new Error(`No se pudo crear la solicitud de permisos: ${error.message}`)
  }

  return normalizeSolicitud(data)
}

export async function obtenerSolicitudPorMaestro(maestroId) {
  const { data, error } = await supabase
    .from('solicitudes_permisos')
    .select('*, maestros!maestro_id(nombre_completo, correo)')
    .eq('maestro_id', maestroId)
    .order('creado_en', { ascending: false })
    .maybeSingle()

  if (error) {
    console.error('Error obteniendo solicitud:', error.message)
    throw new Error('No se pudo obtener la solicitud')
  }

  return normalizeSolicitud(data)
}

export async function obtenerSolicitudesPendientes() {
  const { data, error } = await supabase
    .from('solicitudes_permisos')
    .select('*, maestros!maestro_id(nombre_completo, correo)')
    .eq('estado', 'pendiente')
    .order('creado_en', { ascending: true })

  if (error) {
    console.error('Error obteniendo solicitudes pendientes:', error.message)
    throw new Error('No se pudieron cargar las solicitudes pendientes')
  }

  return (data || []).map(normalizeSolicitud)
}

export async function aprobarSolicitud(solicitudId, adminId) {
  if (!solicitudId || !adminId) {
    throw new Error('solicitudId y adminId son requeridos')
  }

  const { data, error } = await supabase
    .from('solicitudes_permisos')
    .update({
      estado: 'aprobado',
      aprobado_en: new Date().toISOString(),
      aprobado_por: adminId,
    })
    .eq('id', solicitudId)
    .select('*, maestros!maestro_id(nombre_completo, correo)')
    .single()

  if (error) {
    console.error('Error aprobando solicitud:', error.message)
    throw new Error('No se pudo aprobar la solicitud')
  }

  // Also update permisos_maestros with the granted permissions
  if (data?.maestro_id) {
    const solicitud = normalizeSolicitud(data)
    const permisosArray = []

  if (solicitud.solicita_alumnos) permisosArray.push('registrar_alumnos', 'alumnos:create')
    if (solicitud.solicita_clases) permisosArray.push('inscribir_clases', 'clases:enroll', 'clases:create')

    const permisoActual = await obtenerPermisoPorMaestro(data.maestro_id)
    const permisosActuales = Array.isArray(permisoActual?.permisos) ? permisoActual.permisos : []

    await actualizarPermiso(data.maestro_id, {
      puede_registrar_alumnos: solicitud.solicita_alumnos || (permisoActual?.puede_registrar_alumnos ?? false),
      puede_inscribir_clases: solicitud.solicita_clases || (permisoActual?.puede_inscribir_clases ?? false),
      permisos: [...new Set([...permisosActuales, ...permisosArray])],
      concedido_por: adminId,
    })
  }

  return normalizeSolicitud(data)
}

export async function rechazarSolicitud(solicitudId, adminId, motivo) {
  if (!solicitudId || !adminId) {
    throw new Error('solicitudId y adminId son requeridos')
  }

  const { data, error } = await supabase
    .from('solicitudes_permisos')
    .update({
      estado: 'rechazado',
      aprobado_en: new Date().toISOString(),
      aprobado_por: adminId,
      motivo_rechazo: motivo || '',
    })
    .eq('id', solicitudId)
    .select('*, maestros!maestro_id(nombre_completo, correo)')
    .single()

  if (error) {
    console.error('Error rechazando solicitud:', error.message)
    throw new Error('No se pudo rechazar la solicitud')
  }

  return normalizeSolicitud(data)
}
