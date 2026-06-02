import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
}))

import { supabase } from '../../../lib/supabaseClient.js'
import { loginMaestro } from '../maestroAuth.js'

function mockTable(tableResponses) {
  supabase.from.mockImplementation((table) => {
    const response = tableResponses[table]
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(response),
      maybeSingle: vi.fn().mockResolvedValue(response),
    }
  })
}

describe('maestroAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('blocks pending profiles before loading maestro access', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'u1', email: 'teacher@test.com', user_metadata: { rol: 'maestro' } },
        session: {},
      },
      error: null,
    })
    mockTable({
      profiles: { data: { rol: 'maestro', estado: 'pendiente' }, error: null },
    })

    const result = await loginMaestro('teacher@test.com', 'secret')

    expect(result).toMatchObject({
      success: false,
      pendingApproval: true,
    })
    expect(result.error).toContain('pendiente de aprobación')
    expect(supabase.auth.signOut).toHaveBeenCalled()
    expect(supabase.from).not.toHaveBeenCalledWith('maestros')
  })

  it('blocks rejected profiles', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'u1', email: 'teacher@test.com', user_metadata: { rol: 'maestro' } },
        session: {},
      },
      error: null,
    })
    mockTable({
      profiles: { data: { rol: 'maestro', estado: 'rechazado' }, error: null },
    })

    const result = await loginMaestro('teacher@test.com', 'secret')

    expect(result.success).toBe(false)
    expect(result.error).toContain('rechazada')
    expect(supabase.auth.signOut).toHaveBeenCalled()
  })

  it('allows active maestro profiles', async () => {
    const maestro = { id: 'm1', user_id: 'u1', nombre_completo: 'Ada Lovelace' }
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'u1', email: 'teacher@test.com', user_metadata: { rol: 'maestro' } },
        session: { access_token: 't' },
      },
      error: null,
    })
    mockTable({
      profiles: { data: { rol: 'maestro', estado: 'activo' }, error: null },
      maestros: { data: maestro, error: null },
    })

    const result = await loginMaestro('teacher@test.com', 'secret')

    expect(result).toMatchObject({ success: true, maestro })
    expect(localStorage.getItem('portal-maestros:maestro')).toContain('Ada Lovelace')
  })
})
