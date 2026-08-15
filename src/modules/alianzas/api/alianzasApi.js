/**
 * alianzasApi.js — CRUD para contactos_alianzas
 */
import { supabase } from '../../../lib/supabaseClient.js'

export async function getAlianzas(filtros = {}) {
  let q = supabase
    .from('contactos_alianzas')
    .select('*')
    .order('puntuacion_match', { ascending: false })
    .order('nombre_institucion')

  if (filtros.tipo) q = q.eq('tipo', filtros.tipo)
  if (filtros.estado) q = q.eq('estado', filtros.estado)

  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

export async function updateEstadoAlianza(id, estado) {
  const { error } = await supabase
    .from('contactos_alianzas')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
