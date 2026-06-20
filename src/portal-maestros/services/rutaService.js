import { supabase } from '../../lib/supabaseClient.js'
import { getSemaphoreForNode } from './evaluationService.js'
import { getMisClases } from './maestroDataService.js'
import { SemaphoreCache } from '../../lib/semaphoreCache.js'
import { fuzzyMatch, fuzzyMatchBest } from '../../lib/fuzzyMatch.js'

// Global cache instance for semaphore states
let _semaphoreCache = null

/**
 * Get or initialize the global semaphore cache.
 * @returns {SemaphoreCache}
 */
function getSemaphoreCache() {
  if (!_semaphoreCache) {
    _semaphoreCache = new SemaphoreCache({ ttl: 60000 }) // 60 second TTL
  }
  return _semaphoreCache
}

/**
 * Create a cache key from nodeId and claseId.
 * @param {string} nodeId
 * @param {string} claseId
 * @returns {string}
 */
export function getSemaphoreCacheKey(nodeId, claseId) {
  return `${nodeId}:${claseId}`
}

/**
 * Load semaphores for multiple nodes in batch, with caching.
 * Uses the global cache to avoid redundant queries for the same node+clase pair.
 *
 * @param {string[]} nodeIds
 * @param {string} claseId
 * @param {SemaphoreCache} [cache] - optional cache instance for testing
 * @returns {Promise<Map<string, string>>} Map of nodeId -> semaphore state
 */
export async function loadSemaphoresInBatch(nodeIds, claseId, cache = null) {
  const actualCache = cache || getSemaphoreCache()

  // Separate cached and uncached nodes
  const nodesToFetch = []
  const result = new Map()

  for (const nodeId of nodeIds) {
    const cacheKey = getSemaphoreCacheKey(nodeId, claseId)
    const cached = actualCache.get(cacheKey)

    if (cached !== null) {
      result.set(nodeId, cached)
    } else {
      nodesToFetch.push(nodeId)
    }
  }

  // Fetch uncached nodes in parallel
  if (nodesToFetch.length > 0) {
    const fetchResults = await Promise.all(
      nodesToFetch.map(nodeId =>
        getSemaphoreForNode(nodeId, claseId)
          .then(r => {
            const semaphore = r.semaphore
            const cacheKey = getSemaphoreCacheKey(nodeId, claseId)
            actualCache.set(cacheKey, semaphore)
            return { nodeId, semaphore }
          })
          .catch(() => {
            const semaphore = 'gray'
            const cacheKey = getSemaphoreCacheKey(nodeId, claseId)
            actualCache.set(cacheKey, semaphore)
            return { nodeId, semaphore }
          })
      )
    )

    for (const { nodeId, semaphore } of fetchResults) {
      result.set(nodeId, semaphore)
    }
  }

  return result
}

/**
 * Invalidate all cached semaphores for a specific clase.
 * @param {string} claseId
 */
export function invalidateSemaphoresForClase(claseId) {
  const cache = getSemaphoreCache()
  cache.invalidatePrefix(`:${claseId}`)
}

/**
 * Resolve the published route_version_id for a given clase, with fuzzy matching fallback.
 * First tries exact match via ilike on the first instrument.
 * If no match found, uses fuzzy matching against available routes.
 *
 * @param {string} claseId
 * @returns {Promise<string|null>}
 */
export async function resolveRutaIdForClaseWithFuzzy(claseId) {
  const misClases = await getMisClases()
  const claseRow  = misClases?.find(c => c.id === claseId)
  const instrumento = claseRow?.instrumento
  if (!instrumento) return null

  const primerInstrumento = instrumento.split(',')[0].trim().toLowerCase()

  // ── 1. Try exact match first ────────────────────────────────────────────────
  const { data: exactMatch, error: exactErr } = await supabase
    .from('routes')
    .select('id, instrument, route_versions!inner(id)')
    .ilike('instrument', `%${primerInstrumento}%`)
    .eq('route_versions.status', 'published')
    .limit(1)
    .maybeSingle()

  if (!exactErr && exactMatch) {
    return exactMatch.route_versions?.[0]?.id || exactMatch.route_versions?.id || null
  }

  // ── 2. Fallback to fuzzy matching ──────────────────────────────────────────
  const { data: allRoutes, error: allErr } = await supabase
    .from('routes')
    .select('id, instrument, route_versions!inner(id)')
    .eq('route_versions.status', 'published')

  if (allErr) {
    console.warn('[rutaService] resolveRutaIdForClaseWithFuzzy fuzzy match error:', allErr.message)
    return null
  }

  if (!allRoutes || allRoutes.length === 0) return null

  // Extract route instruments and find best fuzzy match
  const routeInstruments = allRoutes.map(r => ({
    instrument: r.instrument?.toLowerCase() || '',
    routeVersionId: r.route_versions?.[0]?.id || r.route_versions?.id,
  }))

  const bestMatch = fuzzyMatchBest(primerInstrumento, routeInstruments.map(r => r.instrument), 0.6)

  if (bestMatch) {
    const matched = routeInstruments.find(r => r.instrument === bestMatch.candidate)
    return matched?.routeVersionId || null
  }

  return null
}

/**
 * Load nodes for a specific level (lazy-load on expand).
 * Used by the UI to load child nodes when a level is expanded.
 *
 * @param {string} levelId
 * @returns {Promise<Object[]>} Array of node objects
 */
export async function loadNodesForLevel(levelId) {
  const { data, error } = await supabase
    .from('nodes')
    .select('id, level_id, nombre, order_index')
    .in('level_id', [levelId])
    .eq('route_version_id', null) // Only if not filtering by route_version_id

  if (error) {
    console.warn('[rutaService] loadNodesForLevel error:', error.message)
    return []
  }

  return data || []
}

/**
 * Load indicators for a specific node (lazy-load on expand).
 * Used by the UI to load child indicators when a node is expanded.
 *
 * @param {string} nodeId
 * @returns {Promise<Object[]>} Array of indicator objects
 */
export async function loadIndicatorsForNode(nodeId) {
  const { data, error } = await supabase
    .from('indicators')
    .select('id, node_id, description as nombre, order_index')
    .in('node_id', [nodeId])
    .eq('activo', true)
    .order('order_index', { ascending: true })

  if (error) {
    console.warn('[rutaService] loadIndicatorsForNode error:', error.message)
    return []
  }

  return data || []
}

/**
 * Resolve the published route_version_id for a given clase.
 * Matches the class instrumento against routes.instrument (case-insensitive).
 * Returns null if not found.
 *
 * @param {string} claseId
 * @returns {Promise<string|null>}
 */
export async function resolveRutaIdForClase(claseId) {
  const misClases = await getMisClases()
  const claseRow  = misClases?.find(c => c.id === claseId)
  const instrumento = claseRow?.instrumento
  if (!instrumento) return null

  const primerInstrumento = instrumento.split(',')[0].trim().toLowerCase()

  const { data, error } = await supabase
    .from('routes')
    .select('id, route_versions!inner(id)')
    .ilike('instrument', `%${primerInstrumento}%`)
    .eq('route_versions.status', 'published')
    .limit(1)
    .maybeSingle()

  if (error) {
    console.warn('[rutaService] resolveRutaIdForClase error:', error.message)
    return null
  }

  return data?.route_versions?.[0]?.id || data?.route_versions?.id || null
}

/**
 * Load the full route tree for a route version + class, with semaphore per node.
 *
 * Returns:
 * Block[] where:
 *   block.levels[].nodes[].semaphore = 'green'|'yellow'|'gray'
 *   block.levels[].semaphore         = aggregated from nodes
 *   block.levels[].locked            = true if previous level < 80% green indicators
 *
 * @param {string} routeVersionId
 * @param {string} claseId
 * @returns {Promise<Block[]>}
 */
export async function loadRouteTree(routeVersionId, claseId) {
  // ── 1. Blocks ──────────────────────────────────────────────────────────────
  const { data: blocks, error: bErr } = await supabase
    .from('blocks')
    .select('id, nombre:name, order_index')
    .eq('route_version_id', routeVersionId)
    .order('order_index', { ascending: true })

  if (bErr) throw new Error('[rutaService] blocks: ' + bErr.message)
  if (!blocks || blocks.length === 0) return []

  // ── 2. Levels ──────────────────────────────────────────────────────────────
  const blockIds = blocks.map(b => b.id)
  const { data: levels, error: lErr } = await supabase
    .from('levels')
    .select('id, block_id, nombre:name, order_index')
    .in('block_id', blockIds)
    .eq('route_version_id', routeVersionId)
    .order('order_index', { ascending: true })

  if (lErr) throw new Error('[rutaService] levels: ' + lErr.message)

  // ── 3. Nodes ───────────────────────────────────────────────────────────────
  const levelIds = (levels ?? []).map(l => l.id)
  if (levelIds.length === 0) return blocks.map(b => ({ ...b, levels: [] }))

  const { data: nodes, error: nErr } = await supabase
    .from('nodes')
    .select('id, level_id, nombre:name, order_index')
    .in('level_id', levelIds)
    .eq('route_version_id', routeVersionId)
    .order('order_index', { ascending: true })

  if (nErr) throw new Error('[rutaService] nodes: ' + nErr.message)

  // ── 4. Indicators ──────────────────────────────────────────────────────────
  const nodeIds = (nodes ?? []).map(n => n.id)
  const { data: indicators, error: iErr } = nodeIds.length > 0
    ? await supabase
        .from('indicators')
        .select('id, node_id, nombre:description, order_index')
        .in('node_id', nodeIds)
        .eq('activo', true)
        .order('order_index', { ascending: true })
    : { data: [], error: null }

  if (iErr) throw new Error('[rutaService] indicators: ' + iErr.message)

  // ── 5. Semaphore per node (parallel) ───────────────────────────────────────
  const semaphoreResults = await Promise.all(
    (nodes ?? []).map(n =>
      getSemaphoreForNode(n.id, claseId)
        .then(r => ({ nodeId: n.id, semaphore: r.semaphore }))
        .catch(() => ({ nodeId: n.id, semaphore: 'gray' }))
    )
  )
  const semMap = new Map(semaphoreResults.map(s => [s.nodeId, s.semaphore]))

  // ── 6. Group indicators by node ────────────────────────────────────────────
  const indByNode = new Map()
  for (const ind of indicators ?? []) {
    if (!indByNode.has(ind.node_id)) indByNode.set(ind.node_id, [])
    indByNode.get(ind.node_id).push({ ...ind, semaphore: semMap.get(ind.node_id) ?? 'gray' })
  }

  // ── 7. Group nodes by level ────────────────────────────────────────────────
  const nodesByLevel = new Map()
  for (const node of nodes ?? []) {
    if (!nodesByLevel.has(node.level_id)) nodesByLevel.set(node.level_id, [])
    nodesByLevel.get(node.level_id).push({
      ...node,
      semaphore: semMap.get(node.id) ?? 'gray',
      indicators: indByNode.get(node.id) ?? [],
    })
  }

  // ── 8. Group levels by block + compute level semaphore + lock state ────────
  const levelsByBlock = new Map()
  for (const [blockId] of blockIds.map(id => [id])) {
    levelsByBlock.set(blockId, [])
  }

  const levelsSortedByBlock = new Map()
  for (const level of levels ?? []) {
    if (!levelsSortedByBlock.has(level.block_id)) levelsSortedByBlock.set(level.block_id, [])
    levelsSortedByBlock.get(level.block_id).push(level)
  }

  for (const [blockId, blockLevels] of levelsSortedByBlock) {
    const enriched = blockLevels.map((level, idx, arr) => {
      const levelNodes = nodesByLevel.get(level.id) ?? []
      const allLevelInds = levelNodes.flatMap(n => indByNode.get(n.id) ?? [])
      const greenIndCount = allLevelInds.filter(i => (semMap.get(i.node_id) ?? 'gray') === 'green').length
      const percentage = allLevelInds.length > 0 ? Math.round((greenIndCount / allLevelInds.length) * 100) : 0

      const nodeSems   = levelNodes.map(n => n.semaphore)
      const levelSem   = nodeSems.every(s => s === 'green') && nodeSems.length > 0
        ? 'green'
        : nodeSems.every(s => s === 'gray') || nodeSems.length === 0
        ? 'gray'
        : 'yellow'

      // Lock: previous level must have ≥80% of its indicators green
      let locked = false
      if (idx > 0) {
        const prev = arr[idx - 1]
        const prevNodes = nodesByLevel.get(prev.id) ?? []
        const allInds = prevNodes.flatMap(n => indByNode.get(n.id) ?? [])
        const greenCount = allInds.filter(i => (semMap.get(i.node_id) ?? 'gray') === 'green').length
        locked = allInds.length > 0 && greenCount / allInds.length < 0.8
      }

      return { ...level, semaphore: levelSem, locked, percentage, nodes: levelNodes }
    })
    levelsByBlock.set(blockId, enriched)
  }

  return blocks.map(b => ({ ...b, levels: levelsByBlock.get(b.id) ?? [] }))
}
