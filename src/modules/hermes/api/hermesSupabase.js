import { supabase } from '../../../lib/supabaseClient.js'

export async function obtenerEventos() {
  const { data, error } = await supabase
    .from('calendario_institucional')
    .select('*')
    .order('fecha_inicio', { ascending: true })
  return { data, error }
}

export async function crearEvento(evento) {
  const { data, error } = await supabase
    .from('calendario_institucional')
    .insert([evento])
    .select()
    .single()
  return { data, error }
}

export async function eliminarEvento(id) {
  const { data, error } = await supabase
    .from('calendario_institucional')
    .delete()
    .eq('id', id)
  return { data, error }
}

export async function obtenerTareas(filtros = {}) {
  let query = supabase
    .from('tareas_institucionales')
    .select('*, calendario_institucional(titulo, categoria)')

  if (filtros.departamento) {
    query = query.eq('departamento', filtros.departamento)
  }
  if (filtros.estado) {
    query = query.eq('estado', filtros.estado)
  }
  if (filtros.event_id) {
    query = query.eq('event_id', filtros.event_id)
  }

  const { data, error } = await query.order('fecha_vencimiento', { ascending: true })
  return { data, error }
}

export async function crearTarea(tarea) {
  const { data, error } = await supabase
    .from('tareas_institucionales')
    .insert([tarea])
    .select()
    .single()
  return { data, error }
}

export async function actualizarTarea(id, campos) {
  const { data, error } = await supabase
    .from('tareas_institucionales')
    .update(campos)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function eliminarTarea(id) {
  const { data, error } = await supabase
    .from('tareas_institucionales')
    .delete()
    .eq('id', id)
  return { data, error }
}

export async function obtenerProtocolos() {
  const { data, error } = await supabase
    .from('hermes_protocolos')
    .select('*')
    .order('categoria_evento', { ascending: true })
  return { data, error }
}

export async function actualizarProtocolo(id, campos) {
  const { data, error } = await supabase
    .from('hermes_protocolos')
    .update(campos)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function crearProtocolo(proto) {
  const { data, error } = await supabase
    .from('hermes_protocolos')
    .insert([proto])
    .select()
    .single()
  return { data, error }
}
