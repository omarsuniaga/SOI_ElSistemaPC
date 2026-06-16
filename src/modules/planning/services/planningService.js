/**
 * planningService.js
 * Responsabilidad: Lógica de negocio para Planificación Académica
 * - Jerarquía de rutas (árbol de contenidos)
 */

import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Obtiene la jerarquía completa de una versión de ruta:
 * blocks → levels → nodes → indicators (solo indicadores activos).
 * Ordenado por order_index en cada nivel.
 * @param {string} routeVersionId
 * @returns {Promise<Array>} bloques con su árbol anidado
 */
export async function getRouteVersionHierarchy(routeVersionId) {
  // 1. Blocks de la versión
  const { data: blocks, error: blocksErr } = await supabase
    .from('blocks')
    .select('id, name, objective, description, order_index')
    .eq('route_version_id', routeVersionId)
    .order('order_index', { ascending: true })
  if (blocksErr) throw blocksErr

  // 2. Levels de la versión
  const { data: levels, error: levelsErr } = await supabase
    .from('levels')
    .select('id, block_id, name, level_number, main_objective, order_index')
    .eq('route_version_id', routeVersionId)
    .order('order_index', { ascending: true })
  if (levelsErr) throw levelsErr

  // 3. Nodes de la versión
  const { data: nodes, error: nodesErr } = await supabase
    .from('nodes')
    .select('id, level_id, name, type, is_critical, objective, order_index')
    .eq('route_version_id', routeVersionId)
    .order('order_index', { ascending: true })
  if (nodesErr) throw nodesErr

  // 4. Indicators activos de esos nodos
  const nodeIds = (nodes || []).map((n) => n.id)
  let indicators = []
  if (nodeIds.length > 0) {
    const { data: inds, error: indsErr } = await supabase
      .from('indicators')
      .select('id, node_id, description, nombre, is_required, order_index, activo')
      .in('node_id', nodeIds)
      .eq('activo', true)
      .order('order_index', { ascending: true })
    if (indsErr) throw indsErr
    indicators = inds || []
  }

  // 5. Ensamblar el árbol en JS
  const indsByNode = _groupBy(indicators, 'node_id')
  const nodesByLevel = _groupBy(
    (nodes || []).map((n) => ({ ...n, indicators: indsByNode[n.id] || [] })),
    'level_id',
  )
  const levelsByBlock = _groupBy(
    (levels || []).map((l) => ({ ...l, nodes: nodesByLevel[l.id] || [] })),
    'block_id',
  )

  return (blocks || []).map((b) => ({ ...b, levels: levelsByBlock[b.id] || [] }))
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function _groupBy(arr, key) {
  return (arr || []).reduce((acc, item) => {
    const k = item[key]
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
  }, {})
}

