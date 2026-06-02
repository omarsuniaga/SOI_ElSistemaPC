import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock de supabaseClient
vi.mock('../../src/lib/supabaseClient.js', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
}))

import { supabase } from '../../src/lib/supabaseClient.js'
import {
  loginMaestro,
  detectarRolMaestro,
  logoutPortal,
} from '../../src/portal-maestros/auth/maestroAuth.js'

describe('maestroAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('loginMaestro retorna error si Supabase falla', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: 'Invalid login credentials' },
    })

    const result = await loginMaestro('x@x.com', 'wrong')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid login credentials')
  })

  it('loginMaestro retorna error si el user_id no existe en tabla maestros', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        session: { access_token: 'tok' },
        user: { id: 'uid-123', email: 'x@x.com' },
      },
      error: null,
    })

    // Usar mockImplementation para retornar respuestas distintas según la tabla
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi
            .fn()
            .mockResolvedValue({ data: { rol: 'maestro', estado: 'activo' }, error: null }),
          upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
        }
      }
      // maestros — simular que no existe
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'No rows' } }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        insert: vi.fn().mockReturnThis(),
      }
    })

    const result = await loginMaestro('x@x.com', 'pass')
    expect(result.success).toBe(false)
    // El código intenta crear automáticamente un registro en maestros, pero falla
    expect(result.error).toContain('vincular')
  })

  it('loginMaestro retorna success con maestro si existe en tabla', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        session: { access_token: 'tok' },
        user: { id: 'uid-123', email: 'x@x.com' },
      },
      error: null,
    })

    const maestroMock = { id: 'maestro-1', user_id: 'uid-123', nombre_completo: 'Ana López' }

    // mockImplementation para retornar respuestas distintas según la tabla
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi
            .fn()
            .mockResolvedValue({ data: { rol: 'maestro', estado: 'activo' }, error: null }),
        }
      }
      // maestros — existe
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: maestroMock, error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: maestroMock, error: null }),
      }
    })

    const result = await loginMaestro('x@x.com', 'pass')
    expect(result.success).toBe(true)
    expect(result.maestro.nombre_completo).toBe('Ana López')
  })

  it('detectarRolMaestro devuelve null si no hay sesión', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    const maestro = await detectarRolMaestro()
    expect(maestro).toBeNull()
  })
})
