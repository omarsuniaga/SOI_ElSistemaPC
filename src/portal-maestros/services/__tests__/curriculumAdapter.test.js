import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadCurriculumTree, resolveAndLoadCurriculum } from '../curriculumAdapter.js'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

vi.mock('../rutaService.js', () => ({
  resolveRouteForClass: vi.fn(),
}))

describe('curriculumAdapter', () => {
  let supabaseMock

  beforeEach(async () => {
    vi.clearAllMocks()
    const { supabase } = await import('../../../lib/supabaseClient.js')
    supabaseMock = supabase
  })

  describe('loadCurriculumTree', () => {
    it('returns structured tree {blocks:[{...levels:[{...nodes:[{...indicators}]}]}]}', async () => {
      const routeVersionId = 'rv-uuid-1'

      // Mock chain: blocks → levels → nodes → indicators
      supabaseMock.from.mockImplementation((table) => {
        if (table === 'blocks') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: [{ id: 'block-1', nombre: 'Block One', order_index: 0 }],
              error: null,
            }),
          }
        }
        if (table === 'levels') {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: [{ id: 'level-1', block_id: 'block-1', nombre: 'Level One', order_index: 0 }],
              error: null,
            }),
          }
        }
        if (table === 'nodes') {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: [{ id: 'node-1', level_id: 'level-1', nombre: 'Node One', order_index: 0 }],
              error: null,
            }),
          }
        }
        if (table === 'indicators') {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: [{ id: 'ind-1', node_id: 'node-1', nombre: 'Indicator One', order_index: 0 }],
              error: null,
            }),
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })

      const tree = await loadCurriculumTree(routeVersionId)

      expect(Array.isArray(tree)).toBe(true)
      expect(tree).toHaveLength(1)
      expect(tree[0].id).toBe('block-1')
      expect(tree[0].levels).toHaveLength(1)
      expect(tree[0].levels[0].id).toBe('level-1')
      expect(tree[0].levels[0].nodes).toHaveLength(1)
      expect(tree[0].levels[0].nodes[0].id).toBe('node-1')
      expect(tree[0].levels[0].nodes[0].indicators).toHaveLength(1)
      expect(tree[0].levels[0].nodes[0].indicators[0].id).toBe('ind-1')
    })

    it('returns empty array when no blocks found', async () => {
      supabaseMock.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }))

      const tree = await loadCurriculumTree('rv-uuid-empty')

      expect(tree).toEqual([])
    })

    it('throws on Supabase error', async () => {
      supabaseMock.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB connection failed' } }),
      }))

      await expect(loadCurriculumTree('rv-uuid-error')).rejects.toThrow()
    })
  })

  describe('resolveAndLoadCurriculum', () => {
    it('returns { tree: null, reason: "no_route" } when resolveRouteForClass returns null', async () => {
      const { resolveRouteForClass } = await import('../rutaService.js')
      resolveRouteForClass.mockResolvedValue(null)

      const result = await resolveAndLoadCurriculum('clase-no-route')

      expect(result.tree).toBeNull()
      expect(result.reason).toBe('no_route')
    })

    it('returns { tree, routeVersionId } when route is resolved', async () => {
      const { resolveRouteForClass } = await import('../rutaService.js')
      resolveRouteForClass.mockResolvedValue('rv-resolved')

      supabaseMock.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }))

      const result = await resolveAndLoadCurriculum('clase-with-route')

      expect(result.routeVersionId).toBe('rv-resolved')
      expect(Array.isArray(result.tree)).toBe(true)
    })
  })
})
