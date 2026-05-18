import { supabase } from '../../lib/supabaseClient.js'

/**
 * Shared helper: fetch the raw blocks/levels/nodes/indicators hierarchy
 * for a given route version from Supabase.
 *
 * Returns the four flat arrays — callers assemble them into whatever tree
 * shape they need (with or without semaphore data).
 *
 * @param {string} routeVersionId
 * @returns {Promise<{blocks: object[], levels: object[], nodes: object[], indicators: object[]}>}
 */
export async function fetchCurriculumHierarchy(routeVersionId) {
  // 1. Blocks
  const { data: blocks, error: bErr } = await supabase
    .from('blocks')
    .select('id, nombre:name, order_index')
    .eq('route_version_id', routeVersionId)
    .order('order_index', { ascending: true })

  if (bErr) throw new Error('[curriculumHierarchy] blocks: ' + bErr.message)
  if (!blocks || blocks.length === 0) {
    return { blocks: [], levels: [], nodes: [], indicators: [] }
  }

  // 2. Levels
  const blockIds = blocks.map(b => b.id)
  const { data: levels, error: lErr } = await supabase
    .from('levels')
    .select('id, block_id, nombre:name, order_index')
    .in('block_id', blockIds)
    .eq('route_version_id', routeVersionId)
    .order('order_index', { ascending: true })

  if (lErr) throw new Error('[curriculumHierarchy] levels: ' + lErr.message)

  // 3. Nodes
  const levelIds = (levels ?? []).map(l => l.id)
  if (levelIds.length === 0) {
    return { blocks, levels: levels ?? [], nodes: [], indicators: [] }
  }

  const { data: nodes, error: nErr } = await supabase
    .from('nodes')
    .select('id, level_id, nombre:name, order_index')
    .in('level_id', levelIds)
    .eq('route_version_id', routeVersionId)
    .order('order_index', { ascending: true })

  if (nErr) throw new Error('[curriculumHierarchy] nodes: ' + nErr.message)

  // 4. Indicators
  const nodeIds = (nodes ?? []).map(n => n.id)
  const { data: indicators, error: iErr } = nodeIds.length > 0
    ? await supabase
        .from('indicators')
        .select('id, node_id, nombre:description, order_index')
        .in('node_id', nodeIds)
        .eq('activo', true)
        .order('order_index', { ascending: true })
    : { data: [], error: null }

  if (iErr) throw new Error('[curriculumHierarchy] indicators: ' + iErr.message)

  return { blocks, levels: levels ?? [], nodes: nodes ?? [], indicators: indicators ?? [] }
}
