/**
 * instrumentosSupabase.js — Adaptador real contra la tabla `instrumentos`.
 *
 * Esquema verificado (SP-2):
 *   id uuid, codigo text unique, nombre text not null,
 *   tipo text, marca text, serie text,
 *   estado text CHECK('disponible','asignado','danado','en_reparacion','fuera_de_uso') default 'disponible',
 *   alumno_id uuid, alumno_nombre text, notas text,
 *   created_at timestamptz, updated_at timestamptz
 *
 * RLS: authenticated-only.
 */

import { supabase } from '../../../lib/supabaseClient.js'

const TABLA = 'instrumentos'
const COLUMNAS =
  'id, codigo, nombre, tipo, marca, serie, estado, alumno_id, alumno_nombre, notas, created_at, updated_at'

/**
 * Lista instrumentos con filtros opcionales.
 * @param {{ estado?: string, tipo?: string, buscar?: string }} filtros
 * @returns {Promise<object[]>}
 */
export async function listarInstrumentos(filtros = {}) {
  let query = supabase.from(TABLA).select(COLUMNAS)

  if (filtros.estado) query = query.eq('estado', filtros.estado)
  if (filtros.tipo) query = query.eq('tipo', filtros.tipo)
  if (filtros.buscar) {
    query = query.or(
      `nombre.ilike.%${filtros.buscar}%,codigo.ilike.%${filtros.buscar}%,marca.ilike.%${filtros.buscar}%`,
    )
  }

  const { data, error } = await query.order('nombre', { ascending: true })
  if (error) throw error
  return data || []
}

/**
 * Crea un nuevo instrumento.
 * @param {{ codigo: string, nombre: string, tipo?: string, marca?: string, serie?: string, notas?: string }} payload
 * @returns {Promise<object>}
 */
export async function crearInstrumento(payload) {
  const row = {
    codigo: payload.codigo,
    nombre: payload.nombre,
    tipo: payload.tipo || null,
    marca: payload.marca || null,
    serie: payload.serie || null,
    notas: payload.notas || null,
    estado: 'disponible',
  }

  const { data, error } = await supabase
    .from(TABLA)
    .insert(row)
    .select(COLUMNAS)
    .single()

  if (error) throw error
  return data
}

/**
 * Actualiza campos de un instrumento.
 * @param {string} id
 * @param {Partial<object>} updates
 * @returns {Promise<object>}
 */
export async function actualizarInstrumento(id, updates) {
  const { data, error } = await supabase
    .from(TABLA)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(COLUMNAS)
    .single()

  if (error) throw error
  return data
}

/**
 * Cambia el estado de un instrumento.
 * Estados válidos: disponible | asignado | danado | en_reparacion | fuera_de_uso
 * @param {string} id
 * @param {string} estado
 * @returns {Promise<object>}
 */
export async function cambiarEstadoInstrumento(id, estado) {
  const { data, error } = await supabase
    .from(TABLA)
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(COLUMNAS)
    .single()

  if (error) throw error
  return data
}

/**
 * Asigna un instrumento a un alumno y cambia su estado a 'asignado'.
 * @param {string} id
 * @param {string} alumnoId
 * @param {string} alumnoNombre
 * @returns {Promise<object>}
 */
export async function asignarInstrumento(id, alumnoId, alumnoNombre) {
  const { data, error } = await supabase
    .from(TABLA)
    .update({
      alumno_id: alumnoId,
      alumno_nombre: alumnoNombre,
      estado: 'asignado',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(COLUMNAS)
    .single()

  if (error) throw error
  return data
}

/**
 * SP-4: reporta un instrumento dañado. Abre un CASO Hermes (RPC) que marca el
 * instrumento como 'danado' y delega tareas a LUT, LOG, FIN, ACM y COM
 * compartiendo un correlation_id. Devuelve el correlation_id del caso.
 * @param {string} id
 * @param {string} descripcion
 * @param {{ id?: string, nombre?: string }} [actor]
 * @returns {Promise<string>} correlation_id
 */
export async function reportarInstrumentoDanado(id, descripcion, actor = {}) {
  const { data, error } = await supabase.rpc('fn_reportar_instrumento_danado', {
    p_instrumento_id: id,
    p_descripcion: descripcion || null,
    p_actor_id: actor.id || null,
    p_actor_nombre: actor.nombre || null,
  })
  if (error) throw error
  return data
}
