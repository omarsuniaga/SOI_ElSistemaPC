/**
 * kanbanBridgeSupabase.js — Adaptador de solo lectura contra la tabla espejo
 * `public.hermes_kanban_cards`, poblada por el bridge de Hermes.
 *
 * Esquema (verificado en producción):
 *   card_id text (PK), board text, title text, status text, assignee text,
 *   priority int, summary text, hermes_updated_at timestamptz,
 *   synced_at timestamptz, raw jsonb
 *
 * RLS: SELECT para authenticated (mismo criterio que `tareas_institucionales`).
 * Esta capa SOLO LEE. Nunca escribe.
 */

import { supabase } from '../../../lib/supabaseClient.js'

const TABLA = 'hermes_kanban_cards'

/**
 * Lee todas las tarjetas espejadas del Kanban de Hermes, ordenadas por
 * prioridad descendente y luego por fecha de actualización descendente.
 * @returns {Promise<object[]>} array de tarjetas (o [] en caso de error)
 */
export async function fetchKanbanCards() {
  const { data, error } = await supabase
    .from(TABLA)
    .select('*')
    .order('priority', { ascending: false })
    .order('hermes_updated_at', { ascending: false })

  if (error) {
    console.error('[KanbanBridge] Error al leer hermes_kanban_cards:', error.message)
    return []
  }
  return data || []
}
