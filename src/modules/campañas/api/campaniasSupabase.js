import { supabase } from '../../../lib/supabaseClient.js'

export async function getInstituciones() {
  const { data, error } = await supabase.from('instituciones').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(`Error al cargar instituciones: ${error.message}`)
  return data
}

export async function getInstitucion(id) {
  const { data, error } = await supabase.from('instituciones').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`Error al cargar institución: ${error.message}`)
  return data
}

export async function guardarInstitucion(data) {
  if (data.id) {
    const { data: result, error } = await supabase.from('instituciones').update(data).eq('id', data.id).select().maybeSingle()
    if (error) throw new Error(`Error al actualizar institución: ${error.message}`)
    return result
  }
  const { data: result, error } = await supabase.from('instituciones').insert(data).select().maybeSingle()
  if (error) throw new Error(`Error al crear institución: ${error.message}`)
  return result
}

export async function eliminarInstitucion(id) {
  const { error } = await supabase.from('instituciones').delete().eq('id', id)
  if (error) throw new Error(`Error al eliminar institución: ${error.message}`)
  return true
}

export async function getCampanias() {
  const { data, error } = await supabase.from('campanias_marketing').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(`Error al cargar campañas: ${error.message}`)
  return data
}

export async function getCampania(id) {
  const { data, error } = await supabase.from('campanias_marketing').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`Error al cargar campaña: ${error.message}`)
  return data
}

export async function guardarCampania(data) {
  if (data.id) {
    const { data: result, error } = await supabase.from('campanias_marketing').update(data).eq('id', data.id).select().maybeSingle()
    if (error) throw new Error(`Error al actualizar campaña: ${error.message}`)
    return result
  }
  const { data: result, error } = await supabase.from('campanias_marketing').insert(data).select().maybeSingle()
  if (error) throw new Error(`Error al crear campaña: ${error.message}`)
  return result
}

export async function eliminarCampania(id) {
  const { error } = await supabase.from('campanias_marketing').delete().eq('id', id)
  if (error) throw new Error(`Error al eliminar campaña: ${error.message}`)
  return true
}

export async function enviarCampania(campaniaId) {
  const { data, error } = await supabase.rpc('fn_enviar_campania_marketing', { p_campania_id: campaniaId })
  if (error) throw new Error(`Error al enviar campaña: ${error.message}`)
  return data
}

export async function getDestinatarios(campaniaId) {
  const { data, error } = await supabase
    .from('campanias_destinatarios')
    .select('*, institucion:instituciones(*)')
    .eq('campania_id', campaniaId)
  if (error) throw new Error(`Error al cargar destinatarios: ${error.message}`)
  return data
}

export async function registrarRespuesta(destinatarioId, respuestaTexto) {
  const { data, error } = await supabase.rpc('fn_registrar_respuesta_campania', {
    p_destinatario_id: destinatarioId,
    p_respuesta: respuestaTexto,
  })
  if (error) throw new Error(`Error al registrar respuesta: ${error.message}`)
  return data
}

export async function getProspeccionLog() {
  const { data, error } = await supabase.from('prospeccion_log').select('*').order('created_at', { ascending: false }).limit(20)
  if (error) throw new Error(`Error al cargar log de prospección: ${error.message}`)
  return data
}
