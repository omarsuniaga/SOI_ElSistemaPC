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
  const datosLimpios = {
    maestro_id: maestroId,
    puede_registrar_alumnos: changes.puede_registrar_alumnos ?? false,
    puede_inscribir_clases: changes.puede_inscribir_clases ?? false,
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
