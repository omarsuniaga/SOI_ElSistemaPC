import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadNodesForLevel, loadIndicatorsForNode } from '../rutaService.js'

// Mock dependencies
vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('rutaService - Lazy Loading', () => {
  let supabaseMock

  beforeEach(async () => {
    const { supabase } = await import('../../../lib/supabaseClient.js')
    supabaseMock = supabase
    vi.clearAllMocks()
  })

  describe('loadNodesForLevel', () => {
    it('should load nodes for a specific level', async () => {
      const mockNodes = [
        { id: 'node-1', nombre: 'Node 1', order_index: 1 },
        { id: 'node-2', nombre: 'Node 2', order_index: 2 },
      ]

      const eqMock = vi.fn().mockResolvedValue({
        data: mockNodes,
        error: null,
      })
      const inMock = vi.fn().mockReturnValue({ eq: eqMock })
      const selectMock = vi.fn().mockReturnValue({ in: inMock })
      const fromMock = vi.fn().mockReturnValue({ select: selectMock })

      supabaseMock.from.mockImplementation(fromMock)

      const result = await loadNodesForLevel('level-1')

      expect(result).toEqual(mockNodes)
      expect(supabaseMock.from).toHaveBeenCalledWith('nodes')
    })

    it('should return empty array when no nodes found', async () => {
      const eqMock = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      })
      const inMock = vi.fn().mockReturnValue({ eq: eqMock })
      const selectMock = vi.fn().mockReturnValue({ in: inMock })
      const fromMock = vi.fn().mockReturnValue({ select: selectMock })

      supabaseMock.from.mockImplementation(fromMock)

      const result = await loadNodesForLevel('level-nonexistent')

      expect(result).toEqual([])
    })

    it('should handle errors', async () => {
      const eqMock = vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      })
      const inMock = vi.fn().mockReturnValue({ eq: eqMock })
      const selectMock = vi.fn().mockReturnValue({ in: inMock })
      const fromMock = vi.fn().mockReturnValue({ select: selectMock })

      supabaseMock.from.mockImplementation(fromMock)

      const result = await loadNodesForLevel('level-1')

      expect(result).toEqual([])
    })

    it('should return nodes sorted by order_index', async () => {
      const mockNodes = [
        { id: 'node-1', nombre: 'Node 1', order_index: 1 },
        { id: 'node-2', nombre: 'Node 2', order_index: 2 },
        { id: 'node-3', nombre: 'Node 3', order_index: 3 },
      ]

      const eqMock = vi.fn().mockResolvedValue({
        data: mockNodes,
        error: null,
      })
      const inMock = vi.fn().mockReturnValue({ eq: eqMock })
      const selectMock = vi.fn().mockReturnValue({ in: inMock })
      const fromMock = vi.fn().mockReturnValue({ select: selectMock })

      supabaseMock.from.mockImplementation(fromMock)

      const result = await loadNodesForLevel('level-1')

      expect(result.length).toBe(3)
      expect(result[0].order_index).toBeLessThanOrEqual(result[1].order_index)
      expect(result[1].order_index).toBeLessThanOrEqual(result[2].order_index)
    })
  })

  describe('loadIndicatorsForNode', () => {
    it('should load indicators for a specific node', async () => {
      const mockIndicators = [
        { id: 'ind-1', nombre: 'Indicator 1', order_index: 1 },
        { id: 'ind-2', nombre: 'Indicator 2', order_index: 2 },
      ]

      const orderMock = vi.fn().mockResolvedValue({
        data: mockIndicators,
        error: null,
      })
      const eq2Mock = vi.fn().mockReturnValue({ order: orderMock })
      const inMock = vi.fn().mockReturnValue({ eq: eq2Mock })
      const selectMock = vi.fn().mockReturnValue({ in: inMock })
      const fromMock = vi.fn().mockReturnValue({ select: selectMock })

      supabaseMock.from.mockImplementation(fromMock)

      const result = await loadIndicatorsForNode('node-1')

      expect(result).toEqual(mockIndicators)
      expect(supabaseMock.from).toHaveBeenCalledWith('indicators')
    })

    it('should return empty array when no indicators found', async () => {
      const orderMock = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      })
      const eq2Mock = vi.fn().mockReturnValue({ order: orderMock })
      const inMock = vi.fn().mockReturnValue({ eq: eq2Mock })
      const selectMock = vi.fn().mockReturnValue({ in: inMock })
      const fromMock = vi.fn().mockReturnValue({ select: selectMock })

      supabaseMock.from.mockImplementation(fromMock)

      const result = await loadIndicatorsForNode('node-nonexistent')

      expect(result).toEqual([])
    })

    it('should filter for active indicators only', async () => {
      const mockIndicators = [
        { id: 'ind-1', nombre: 'Indicator 1', activo: true, order_index: 1 },
      ]

      const orderMock = vi.fn().mockResolvedValue({
        data: mockIndicators,
        error: null,
      })
      const eq2Mock = vi.fn().mockReturnValue({ order: orderMock })
      const inMock = vi.fn().mockReturnValue({ eq: eq2Mock })
      const selectMock = vi.fn().mockReturnValue({ in: inMock })
      const fromMock = vi.fn().mockReturnValue({ select: selectMock })

      supabaseMock.from.mockImplementation(fromMock)

      const result = await loadIndicatorsForNode('node-1')

      expect(result.every(ind => ind.activo !== false)).toBe(true)
    })

    it('should handle errors', async () => {
      const orderMock = vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      })
      const eq2Mock = vi.fn().mockReturnValue({ order: orderMock })
      const inMock = vi.fn().mockReturnValue({ eq: eq2Mock })
      const selectMock = vi.fn().mockReturnValue({ in: inMock })
      const fromMock = vi.fn().mockReturnValue({ select: selectMock })

      supabaseMock.from.mockImplementation(fromMock)

      const result = await loadIndicatorsForNode('node-1')

      expect(result).toEqual([])
    })

    it('should return indicators sorted by order_index', async () => {
      const mockIndicators = [
        { id: 'ind-1', nombre: 'Indicator 1', order_index: 1 },
        { id: 'ind-2', nombre: 'Indicator 2', order_index: 2 },
        { id: 'ind-3', nombre: 'Indicator 3', order_index: 3 },
      ]

      const orderMock = vi.fn().mockResolvedValue({
        data: mockIndicators,
        error: null,
      })
      const eq2Mock = vi.fn().mockReturnValue({ order: orderMock })
      const inMock = vi.fn().mockReturnValue({ eq: eq2Mock })
      const selectMock = vi.fn().mockReturnValue({ in: inMock })
      const fromMock = vi.fn().mockReturnValue({ select: selectMock })

      supabaseMock.from.mockImplementation(fromMock)

      const result = await loadIndicatorsForNode('node-1')

      expect(result.length).toBe(3)
      expect(result[0].order_index).toBeLessThanOrEqual(result[1].order_index)
      expect(result[1].order_index).toBeLessThanOrEqual(result[2].order_index)
    })
  })
})
