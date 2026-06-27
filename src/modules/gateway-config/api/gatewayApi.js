import { supabase } from '../../../lib/supabaseClient.js'

export async function obtenerGatewayConfig() {
  const { data, error } = await supabase
    .from('hermes_whatsapp_config')
    .select('*')
    .eq('activo', true)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

export async function actualizarGatewayConfig(updates) {
  const cfg = await obtenerGatewayConfig()
  if (!cfg) throw new Error('No existe configuracion activa')
  const { data, error } = await supabase
    .from('hermes_whatsapp_config')
    .update(updates)
    .eq('id', cfg.id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function crearGatewayConfig(payload) {
  const { data, error } = await supabase
    .from('hermes_whatsapp_config')
    .insert([payload])
    .select()
    .single()
  if (error) throw error
  return data
}
