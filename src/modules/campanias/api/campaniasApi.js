import { supabase } from '../../../lib/supabaseClient.js'

/** Lista todas las campañas, más recientes primero. */
export async function listarCampanias() {
  const { data, error } = await supabase
    .from('campanias_periodo')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

/** Crea una campaña. */
export async function crearCampania(payload) {
  const { data, error } = await supabase
    .from('campanias_periodo')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Actualiza campos de una campaña. */
export async function actualizarCampania(id, payload) {
  const { data, error } = await supabase
    .from('campanias_periodo')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Desactiva una campaña (no borra audiencia). */
export async function desactivarCampania(id) {
  return actualizarCampania(id, { activo: false })
}

/** Previsualiza la audiencia (RPC solo lectura, admin-gated). */
export async function previewCampania(id) {
  const { data, error } = await supabase.rpc('fn_preview_campania', { p_id: id })
  if (error) throw error
  return data
}

/** Activa y materializa la audiencia en campania_envios (NO envía). */
export async function activarCampania(id) {
  const { data, error } = await supabase.rpc('fn_activar_campania', { p_id: id })
  if (error) throw error
  return data
}

/** Encola una tanda a la cola viva respetando opt-out + tope diario (warm-up). */
export async function encolarCampania(id, limite = null) {
  const { data, error } = await supabase.rpc('fn_encolar_campania', {
    p_campania_id: id,
    p_limite: limite,
  })
  if (error) throw error
  return data
}

/** Cupos en vivo de las clases de iniciación. */
export async function listarCuposIniciacion() {
  const { data, error } = await supabase
    .from('vw_cupos_iniciacion')
    .select('*')
    .order('nombre', { ascending: true })
  if (error) throw error
  return data ?? []
}
