import { supabase } from '../../../lib/supabaseClient.js'
import { esVigente } from '../services/esVigente.js'

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
    fecha_inicio: p.fecha_inicio ?? null,
    fecha_fin: p.fecha_fin ?? null,
    vigente: esVigente(p),
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
    permisos: Array.isArray(changes.permisos) ? changes.permisos : [],
    solicitudes: Array.isArray(changes.solicitudes) ? changes.solicitudes : [],
    concedido_por: changes.concedido_por || null,
    // Temporal validity — pass through if provided, otherwise omit to keep DB defaults
    ...(changes.fecha_inicio !== undefined && { fecha_inicio: changes.fecha_inicio }),
    ...(changes.fecha_fin !== undefined && { fecha_fin: changes.fecha_fin }),
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

/**
 * Lists maestros that do NOT yet have a permisos_maestros row.
 * Uses a two-query anti-join: fetch existing maestro_ids, then exclude them.
 * @returns {Promise<Array<{id: string, nombre_completo: string}>>}
 */
export async function listarMaestrosSinPermisos() {
  // Step 1: get all maestro_ids that already have a row
  const { data: existing } = await supabase
    .from('permisos_maestros')
    .select('maestro_id')
  const existingIds = (existing || []).map(r => r.maestro_id)

  // Step 2: get maestros NOT in that list
  let q = supabase.from('maestros').select('id, nombre_completo')
  if (existingIds.length > 0) {
    q = q.not('id', 'in', `(${existingIds.join(',')})`)
  }
  const { data, error } = await q.order('nombre_completo')
  if (error) return []
  return data || []
}
