/**
 * eventosSupabase.js — Capa real sobre calendario_institucional para el portal ADM.
 *
 * Extiende la lente READ de COM con escritura: actualizar estado y
 * preprogramar eventos (guardar metadata de planificación).
 */

import { supabase } from '../../../lib/supabaseClient.js'

const TABLA = 'calendario_institucional'
const COLS = 'id, titulo, descripcion, categoria, fecha_inicio, fecha_fin, ubicacion, departamento_responsable, estado, metadata'

/**
 * Obtiene eventos del calendario institucional.
 * @param {{categoria?: string, estado?: string, departamento?: string, desde?: string, dias?: number}} filtros
 */
export async function getEventos(filtros = {}) {
  const desde = filtros.desde || new Date().toISOString()
  const dias = filtros.dias ?? 120
  const hasta = new Date(new Date(desde).getTime() + dias * 86400000).toISOString()

  let q = supabase
    .from(TABLA)
    .select(COLS)
    .gte('fecha_inicio', desde)
    .lte('fecha_inicio', hasta)

  if (filtros.categoria && filtros.categoria !== 'todas') {
    q = q.eq('categoria', filtros.categoria)
  }
  if (filtros.estado && filtros.estado !== 'todos') {
    q = q.eq('estado', filtros.estado)
  }
  if (filtros.departamento && filtros.departamento !== 'todos') {
    q = q.eq('departamento_responsable', filtros.departamento)
  }

  const { data, error } = await q.order('fecha_inicio', { ascending: true })
  if (error) throw error
  return data || []
}

/**
 * Actualiza el estado de un evento.
 * @param {string} id
 * @param {string} nuevoEstado
 * @returns {Promise<object>}
 */
export async function actualizarEstadoEvento(id, nuevoEstado) {
  const { data, error } = await supabase
    .from(TABLA)
    .update({ estado: nuevoEstado })
    .eq('id', id)
    .select(COLS)
    .single()

  if (error) throw error
  return data
}

/**
 * Preprograma un evento: actualiza estado a 'preprogramado' y guarda
 * metadata de planificación (responsable, recursos, notas, fecha tentativa).
 * @param {string} id
 * @param {{ responsable: string, recursos: string, notas: string, fecha_tentativa: string }} datos
 * @returns {Promise<object>}
 */
export async function preprogramarEvento(id, datos) {
  const { data: current, error: fetchError } = await supabase
    .from(TABLA)
    .select('metadata')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError

  const metadata = {
    ...(current?.metadata || {}),
    planificacion: {
      responsable: datos.responsable || '',
      recursos: datos.recursos || '',
      notas: datos.notas || '',
      fecha_tentativa: datos.fecha_tentativa || null,
    },
  }

  const { data, error } = await supabase
    .from(TABLA)
    .update({ estado: 'preprogramado', metadata })
    .eq('id', id)
    .select(COLS)
    .single()

  if (error) throw error
  return data
}

/**
 * Obtiene un evento por ID.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function getEventoById(id) {
  const { data, error } = await supabase
    .from(TABLA)
    .select(COLS)
    .eq('id', id)
    .single()

  if (error && error.code === 'PGRST116') return null // not found
  if (error) throw error
  return data
}
