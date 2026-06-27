/**
 * calendarioComSupabase.js — Lente READ sobre calendario_institucional (portal COM).
 * COM no crea eventos: los consume para mantenerse al día (conciertos, ciclos,
 * inscripciones, temporadas). La creación de eventos vive en el Score del Director.
 */

import { supabase } from '../../../lib/supabaseClient.js'

const TABLA = 'calendario_institucional'
const COLS =
  'id, titulo, descripcion, categoria, fecha_inicio, fecha_fin, ubicacion, departamento_responsable, estado'

/**
 * Obtiene eventos del calendario institucional.
 * @param {{categoria?: string, desde?: string, dias?: number}} filtros
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

  const { data, error } = await q.order('fecha_inicio', { ascending: true })
  if (error) throw error
  return data || []
}
