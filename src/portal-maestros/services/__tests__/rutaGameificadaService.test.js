import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getStudentsPerNode } from '../rutaGameificadaService.js'

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
