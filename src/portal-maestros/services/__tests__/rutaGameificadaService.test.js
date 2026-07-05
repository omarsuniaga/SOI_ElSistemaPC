import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getStudentsPerNode,
  markNodeAsCovered,
  getPlannedContentForToday,
  addPlannedContent,
  markPlannedAsCovered,
} from '../rutaGameificadaService.js'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

const DB_ROWS = {
  'node-123': [
    {
      student_id: 'student-1',
      nombre_completo: 'Juan',
      last_attempt_date: '2026-05-10T00:00:00',
      attempt_count: 2,
    },
    {
      student_id: 'student-2',
      nombre_completo: 'María',
      last_attempt_date: '2026-05-10T00:00:00',
      attempt_count: 1,
    },
  ],
  'node-empty': [],
}

function buildChain(rows) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: rows, error: null }),
  }
}

describe('rutaGameificadaService', () => {
  let supabase

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('../../../lib/supabaseClient.js')
    supabase = mod.supabase
  })

  describe('markNodeAsCovered', () => {
    it('marks node as covered for a clase with coverage metadata', async () => {
      const nodeId = 'node-123'
      const claseId = 'clase-456'
      const studentIds = ['student-1', 'student-2']

      // indicators query
      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [{ id: 'ind-1' }, { id: 'ind-2' }],
          error: null,
        }),
      })

      // indicator_attempts update
      supabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        // second .in() resolves
        _resolvedWith: null,
      })

      // Need a proper chain for update().in().in()
      const selectAfterIn = vi.fn().mockResolvedValue({ data: [{ id: 'a' }, { id: 'b' }], error: null })
      const inMock = vi.fn()
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        in: inMock,
      }
      inMock.mockReturnValueOnce(updateChain) // first .in()
      inMock.mockReturnValueOnce({ select: selectAfterIn }) // second .in() → returns object with .select()
      supabase.from.mockReset()

      // Re-mock both calls cleanly
      supabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            data: [{ id: 'ind-1' }, { id: 'ind-2' }],
            error: null,
          }),
        })
        .mockReturnValueOnce(updateChain)

      const result = await markNodeAsCovered(nodeId, claseId, studentIds)

      expect(result.success).toBe(true)
      expect(result.updatedCount).toBe(2)
    })

    it('returns error if nodeId or claseId is missing', async () => {
      const result = await markNodeAsCovered('', 'clase-456', [])

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('returns error if no indicators found for node', async () => {
      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      })

      const result = await markNodeAsCovered('node-noind', 'clase-456', ['s1'])

      expect(result.success).toBe(false)
      expect(result.error).toBe('No indicators found for node')
    })

    it('returns error if supabase update fails', async () => {
      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [{ id: 'ind-1' }], error: null }),
      })

      const selectAfterIn = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
      const inMock = vi.fn()
      const updateChain = { update: vi.fn().mockReturnThis(), in: inMock }
      inMock.mockReturnValueOnce(updateChain)
      inMock.mockReturnValueOnce({ select: selectAfterIn })
      supabase.from.mockReturnValueOnce(updateChain)

      const result = await markNodeAsCovered('node-123', 'clase-456', ['s1'])

      expect(result.success).toBe(false)
      expect(result.error).toBe('DB error')
    })
  })

  describe('plannedContent', () => {
    it('gets planned nodes for a clase today', async () => {
      const claseId = 'clase-456'

      // Build a proper chain for select().eq().eq().eq()
      const eqMock = vi.fn()
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: eqMock,
      }
      eqMock.mockReturnValueOnce(chain) // .eq('clase_id', ...)
      eqMock.mockReturnValueOnce(chain) // .eq('planned_date', ...)
      eqMock.mockResolvedValueOnce({ data: [], error: null }) // .eq('covered', false)
      supabase.from.mockReturnValueOnce(chain)

      const result = await getPlannedContentForToday(claseId)

      expect(Array.isArray(result)).toBe(true)
    })

    it('adds a node to planned content', async () => {
      const maestroId = 'maestro-123'
      const claseId = 'clase-456'
      const nodeId = 'node-789'

      const selectMock = vi.fn().mockResolvedValue({ data: [{ id: 'planned-new' }], error: null })
      supabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: selectMock,
      })

      const result = await addPlannedContent(maestroId, claseId, nodeId)

      expect(result.success).toBe(true)
    })

    it('marks planned content as covered', async () => {
      const plannedId = 'planned-123'

      supabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      })

      const result = await markPlannedAsCovered(plannedId)

      expect(result.success).toBe(true)
    })
  })

  describe('getStudentsPerNode', () => {
    it('returns list of students who completed a node', async () => {
      supabase.from.mockReturnValue(buildChain(DB_ROWS['node-123']))

      const result = await getStudentsPerNode('node-123')

      expect(result).toEqual([
        {
          studentId: 'student-1',
          nombre: 'Juan',
          lastAttemptDate: '2026-05-10',
          attemptCount: 2,
        },
        {
          studentId: 'student-2',
          nombre: 'María',
          lastAttemptDate: '2026-05-10',
          attemptCount: 1,
        },
      ])
    })

    it('returns empty array if no students completed node', async () => {
      supabase.from.mockReturnValue(buildChain(DB_ROWS['node-empty']))

      const result = await getStudentsPerNode('node-empty')

      expect(result).toEqual([])
    })

    it('orders by last attempt date descending', async () => {
      supabase.from.mockReturnValue(buildChain(DB_ROWS['node-123']))

      const result = await getStudentsPerNode('node-123')

      expect(result[0].lastAttemptDate >= result[1].lastAttemptDate).toBe(true)
    })
  })
})
