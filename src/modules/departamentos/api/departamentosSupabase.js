/**
 * departamentosSupabase.js — Adaptador real de la gestión de departamentos (portal ADM).
 * Tabla: departamentos (RLS authenticated). El campo `email` lo consume Hermes
 * para despachar correos por departamento (fn_email_departamento + edge function send-email).
 */

import { supabase } from '../../../lib/supabaseClient.js'

const TABLA = 'departamentos'
const COLS = 'id, codigo, nombre, descripcion, email, activo, updated_at'

export async function getDepartamentos() {
  const { data, error } = await supabase.from(TABLA).select(COLS).order('codigo', { ascending: true })
  if (error) throw error
  return data || []
}

export async function actualizarDepartamento(id, updates = {}) {
  const payload = {}
  if (updates.nombre !== undefined) payload.nombre = updates.nombre
  if (updates.email !== undefined) payload.email = updates.email || null
  if (updates.activo !== undefined) payload.activo = updates.activo
  payload.updated_at = new Date().toISOString()

  const { data, error } = await supabase.from(TABLA).update(payload).eq('id', id).select(COLS).single()
  if (error) throw error
  return data
}
