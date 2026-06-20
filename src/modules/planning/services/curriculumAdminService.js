/**
 * curriculumAdminService.js
 * CRUD del currículo sobre el MODELO NUEVO (levels/nodes/indicators), operando
 * siempre sobre una VERSIÓN BORRADOR propia del maestro — nunca la publicada.
 *
 * El borrador se obtiene/crea con la RPC `clone_route_version_as_draft`, que
 * clona la versión publicada (blocks→levels→nodes→indicators) en una sola
 * transacción y es idempotente (devuelve el borrador existente si ya hay uno).
 *
 * Las políticas RLS garantizan que el maestro solo pueda escribir filas que
 * pertenezcan a su propio borrador (status='draft' AND created_by=auth.uid()).
 */

import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Obtiene (o crea) el borrador propio del maestro para la versión publicada dada.
 * @param {string} publishedRouteVersionId
 * @returns {Promise<string>} id de la route_version borrador
 */
export async function getOrCreateDraftVersion(publishedRouteVersionId) {
  const { data, error } = await supabase.rpc('clone_route_version_as_draft', {
    p_source_version_id: publishedRouteVersionId,
  })
  if (error) throw error
  return data // uuid del borrador
}

/** order_index siguiente para un conjunto de hermanos. */
async function _nextOrderIndex(table, filterCol, filterVal) {
  const { data } = await supabase
    .from(table)
    .select('order_index')
    .eq(filterCol, filterVal)
    .order('order_index', { ascending: false })
    .limit(1)
  const max = data?.[0]?.order_index ?? -1
  return max + 1
}

// ── Levels ─────────────────────────────────────────────────────
export async function addLevel({ blockId, routeVersionId, name, levelNumber = null }) {
  const order_index = await _nextOrderIndex('levels', 'block_id', blockId)
  const { data, error } = await supabase
    .from('levels')
    .insert([
      {
        block_id: blockId,
        route_version_id: routeVersionId,
        name,
        level_number: levelNumber ?? order_index + 1,
        order_index,
      },
    ])
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function updateLevel(id, fields) {
  const { error } = await supabase.from('levels').update(fields).eq('id', id)
  if (error) throw error
}

export async function deleteLevel(id) {
  const { error } = await supabase.from('levels').delete().eq('id', id)
  if (error) throw error
}

// ── Nodes ──────────────────────────────────────────────────────
export async function addNode({ levelId, routeVersionId, name, type = 'TECNICA' }) {
  const order_index = await _nextOrderIndex('nodes', 'level_id', levelId)
  const { data, error } = await supabase
    .from('nodes')
    .insert([{ level_id: levelId, route_version_id: routeVersionId, name, type, order_index }])
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function updateNode(id, fields) {
  const { error } = await supabase.from('nodes').update(fields).eq('id', id)
  if (error) throw error
}

export async function deleteNode(id) {
  const { error } = await supabase.from('nodes').delete().eq('id', id)
  if (error) throw error
}

// ── Indicators ─────────────────────────────────────────────────
export async function addIndicator({ nodeId, nombre, description = null }) {
  const order_index = await _nextOrderIndex('indicators', 'node_id', nodeId)
  const { data, error } = await supabase
    .from('indicators')
    .insert([{ node_id: nodeId, nombre, description: description ?? nombre, order_index, activo: true }])
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function updateIndicator(id, fields) {
  const { error } = await supabase.from('indicators').update(fields).eq('id', id)
  if (error) throw error
}

export async function deleteIndicator(id) {
  // Soft-delete: marcar inactivo (preserva historial). El CRUD puede usar delete real si se prefiere.
  const { error } = await supabase.from('indicators').update({ activo: false }).eq('id', id)
  if (error) throw error
}
