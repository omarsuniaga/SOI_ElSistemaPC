/**
 * solicitudesNecesidadesSupabase.js — Acceso real contra Supabase.
 */

import { supabase } from '../../lib/supabaseClient.js'

const TABLA = 'solicitudes_necesidades'

export async function crearSolicitud(data) {
  const { data: row, error } = await supabase
    .from(TABLA)
    .insert(data)
    .select('*')
    .single()

  if (error) throw error
  return row
}

export async function listarPorMaestro(maestroId) {
  const { data, error } = await supabase
    .from(TABLA)
    .select('*')
    .eq('maestro_id', maestroId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data || []
}

export async function listarPorDepartamento(departamento, estados = []) {
  let query = supabase
    .from(TABLA)
    .select('*')
    .order('created_at', { ascending: false })

  if (departamento) {
    query = query.eq('departamento_actual', departamento)
  }

  if (Array.isArray(estados) && estados.length > 0) {
    query = query.in('estado', estados)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

async function _updateById(id, patch) {
  const { data, error } = await supabase
    .from(TABLA)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export const preAprobar = (id, actorId, respuesta_admin = null) =>
  _updateById(id, { estado: 'pre_aprobada_acm', pre_aprobada_por: actorId, respuesta_admin })

export const rechazar = (id, actorId, respuesta_admin = null) =>
  _updateById(id, { estado: 'rechazada_acm', pre_aprobada_por: actorId, respuesta_admin })

export const escalarAFin = (id, actorId = null) =>
  _updateById(id, { estado: 'en_presupuesto', departamento_actual: 'FIN', pre_aprobada_por: actorId })

export const cargarPresupuesto = (id, actorId, presupuesto, costo_estimado = null, respuesta_admin = null) =>
  _updateById(id, {
    estado: 'presupuestada',
    presupuesto,
    costo_estimado,
    presupuestado_por: actorId,
    respuesta_admin,
  })

export const resolver = (id, estado, actorId = null, respuesta_admin = null) =>
  _updateById(id, { estado, presupuestado_por: actorId, respuesta_admin })

export const cancelar = (id) =>
  _updateById(id, { estado: 'cancelada' })

export async function contarPendientes(departamento) {
  const { count, error } = await supabase
    .from(TABLA)
    .select('id', { count: 'exact', head: true })
    .eq('departamento_actual', departamento)
    .in('estado', ['pendiente', 'en_presupuesto', 'presupuestada'])

  if (error) throw error
  return count || 0
}

export async function contarNovedadesMaestro(maestroId, desde) {
  const { count, error } = await supabase
    .from(TABLA)
    .select('id', { count: 'exact', head: true })
    .eq('maestro_id', maestroId)
    .gte('updated_at', desde)

  if (error) throw error
  return count || 0
}
