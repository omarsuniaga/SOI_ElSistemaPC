/**
 * seguimientoSupabase.js — Adaptador real del CRM de seguimiento (portal COM).
 * Tabla: comunicaciones_seguimiento (RLS para authenticated).
 */

import { supabase } from '../../../lib/supabaseClient.js'

const TABLA = 'comunicaciones_seguimiento'
const COLS =
  'id, alumno_id, contacto_nombre, contacto_telefono, contacto_email, canal, fecha, resultado, notas, requiere_seguimiento, proxima_accion, proxima_fecha, estado, responsable_id, created_at, updated_at'

export async function getSeguimientos(filtros = {}) {
  let q = supabase.from(TABLA).select(COLS)
  if (filtros.alumno_id) q = q.eq('alumno_id', filtros.alumno_id)
  if (filtros.estado) q = q.eq('estado', filtros.estado)
  if (filtros.canal) q = q.eq('canal', filtros.canal)
  const { data, error } = await q.order('fecha', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getSeguimientosByAlumno(alumnoId) {
  return getSeguimientos({ alumno_id: alumnoId })
}

export async function crearSeguimiento(payload) {
  const row = {
    alumno_id: payload.alumno_id || null,
    contacto_nombre: payload.contacto_nombre || null,
    contacto_telefono: payload.contacto_telefono || null,
    contacto_email: payload.contacto_email || null,
    canal: payload.canal || 'llamada',
    fecha: payload.fecha || new Date().toISOString(),
    resultado: payload.resultado || 'contactado',
    notas: payload.notas || null,
    requiere_seguimiento: !!payload.requiere_seguimiento,
    proxima_accion: payload.proxima_accion || null,
    proxima_fecha: payload.proxima_fecha || null,
    estado: payload.estado || 'abierto',
  }
  const { data, error } = await supabase.from(TABLA).insert(row).select(COLS).single()
  if (error) throw error
  return data
}

export async function actualizarSeguimiento(id, updates = {}) {
  const { data, error } = await supabase.from(TABLA).update(updates).eq('id', id).select(COLS).single()
  if (error) throw error
  return data
}

export async function cerrarSeguimiento(id) {
  return actualizarSeguimiento(id, { estado: 'cerrado', requiere_seguimiento: false })
}

export async function eliminarSeguimiento(id) {
  const { error } = await supabase.from(TABLA).delete().eq('id', id)
  if (error) throw error
  return true
}
