import { fetchCurriculumHierarchy } from './curriculumHierarchy.js'
import { resolveRouteForClass } from './rutaService.js'

/**
 * Load the full curriculum tree for a given route version.
 * Returns a plain hierarchy: blocks → levels → nodes → indicators.
 * No semaphore logic — this is a pure structural read.
 *
 * @param {string} routeVersionId
 * @returns {Promise<Block[]>}
 */
export async function loadCurriculumTree(routeVersionId) {
  const { blocks, levels, nodes, indicators } = await fetchCurriculumHierarchy(routeVersionId)

  if (blocks.length === 0) return []

  // Assemble indicators by node
  const indByNode = new Map()
  for (const ind of indicators) {
    if (!indByNode.has(ind.node_id)) indByNode.set(ind.node_id, [])
    indByNode.get(ind.node_id).push(ind)
  }

  // Assemble nodes by level
  const nodesByLevel = new Map()
  for (const node of nodes) {
    if (!nodesByLevel.has(node.level_id)) nodesByLevel.set(node.level_id, [])
    nodesByLevel.get(node.level_id).push({
      ...node,
      indicators: indByNode.get(node.id) ?? [],
    })
  }

  // Assemble levels by block
  const levelsByBlock = new Map()
  for (const level of levels) {
    if (!levelsByBlock.has(level.block_id)) levelsByBlock.set(level.block_id, [])
    levelsByBlock.get(level.block_id).push({
      ...level,
      nodes: nodesByLevel.get(level.id) ?? [],
    })
  }

  return blocks.map(b => ({ ...b, levels: levelsByBlock.get(b.id) ?? [] }))
}

/**
 * Resolve the route version for a clase and load its curriculum tree.
 *
 * @param {string} claseId
 * @returns {Promise<{tree: Block[], routeVersionId: string}|{tree: null, reason: string}>}
 */
export async function resolveAndLoadCurriculum(claseId) {
  const routeVersionId = await resolveRouteForClass(claseId)

  if (!routeVersionId) {
    return { tree: null, reason: 'no_route' }
  }

  const tree = await loadCurriculumTree(routeVersionId)
  return { tree, routeVersionId }
}
