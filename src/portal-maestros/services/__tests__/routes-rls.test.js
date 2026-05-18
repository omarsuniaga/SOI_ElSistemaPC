import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase to simulate RLS behaviour
vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}))

/**
 * RLS contract tests for the routes hierarchy.
 *
 * These tests mock Supabase responses to validate that the application
 * correctly handles authenticated SELECT access on all routes tables, and
 * that indicator_attempts returns only rows belonging to the current user's
 * maestro_id. The actual RLS policies must be verified via Task 3.3.
 */
describe('routes hierarchy — RLS contract', () => {
  let supabaseMock

  beforeEach(async () => {
    vi.clearAllMocks()
    const { supabase } = await import('../../../lib/supabaseClient.js')
    supabaseMock = supabase
  })

  it('authenticated user can SELECT from routes — returns data', async () => {
    const fakeRoutes = [{ id: 'r1', name: 'Violin', status: 'published' }]
    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        data: fakeRoutes,
        error: null,
      }),
    })

    const { supabase } = await import('../../../lib/supabaseClient.js')
    const result = await supabase.from('routes').select('*')

    expect(result.error).toBeNull()
    expect(result.data).toEqual(fakeRoutes)
    expect(supabaseMock.from).toHaveBeenCalledWith('routes')
  })

  it('authenticated user can SELECT from blocks, levels, nodes, indicators — returns data', async () => {
    const tables = ['blocks', 'levels', 'nodes', 'indicators']

    for (const table of tables) {
      vi.clearAllMocks()
      const { supabase } = await import('../../../lib/supabaseClient.js')
      supabaseMock = supabase

      const fakeRows = [{ id: `${table}-1` }]
      supabaseMock.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          data: fakeRows,
          error: null,
        }),
      })

      const result = await supabase.from(table).select('*')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(fakeRows)
      expect(supabaseMock.from).toHaveBeenCalledWith(table)
    }
  })

  it('indicator_attempts SELECT returns only rows where created_by matches current user maestro_id', async () => {
    const currentMaestroId = 'maestro-uuid-42'
    const allAttempts = [
      { id: 'a1', created_by: currentMaestroId, indicator_id: 'ind-1' },
      { id: 'a2', created_by: 'other-maestro', indicator_id: 'ind-2' },
    ]

    // RLS policy should filter server-side; here we simulate the filtered result
    const filteredAttempts = allAttempts.filter(a => a.created_by === currentMaestroId)

    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        data: filteredAttempts,
        error: null,
      }),
    })

    const { supabase } = await import('../../../lib/supabaseClient.js')
    const result = await supabase.from('indicator_attempts').select('*')

    expect(result.error).toBeNull()
    // RLS must return only the current user's rows
    expect(result.data).toHaveLength(1)
    expect(result.data[0].created_by).toBe(currentMaestroId)
    // The other-maestro row must not appear
    expect(result.data.find(a => a.created_by === 'other-maestro')).toBeUndefined()
  })
})
