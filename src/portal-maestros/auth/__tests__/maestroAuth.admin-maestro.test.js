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
import { loginMaestro, STORAGE_KEY } from '../maestroAuth.js'

/**
 * Configura el mock de supabase.from() para responder por tabla.
 * Soporta maybeSingle() y upsert() además de single().
 */
function mockTables(tableResponses) {
  supabase.from.mockImplementation((table) => {
    const response = tableResponses[table] ?? { data: null, error: null }
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(response),
      maybeSingle: vi.fn().mockResolvedValue(response),
      upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
    }
    return chain
  })
}

describe('loginMaestro — admin con perfil de maestro', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('admin con fila en maestros usa el ID real del maestro (no el UUID de auth)', async () => {
    const AUTH_USER_ID = 'auth-uuid-0000'
    const MAESTRO_ID = 'maestro-uuid-real'
    const maestroRow = {
      id: MAESTRO_ID,
      user_id: AUTH_USER_ID,
      nombre_completo: 'Omar Suniaga',
      correo: 'omar@test.com',
      tipo_maestro: 'coro',
    }

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: AUTH_USER_ID,
          email: 'omar@test.com',
          user_metadata: {},
        },
        session: { access_token: 'tok' },
      },
      error: null,
    })

    mockTables({
      profiles: { data: { rol: 'admin', estado: 'activo' }, error: null },
      maestros: { data: maestroRow, error: null },
    })

    const result = await loginMaestro('omar@test.com', 'secret')

    expect(result.success).toBe(true)
    // ID debe ser el del row en maestros, NO el UUID de auth
    expect(result.maestro.id).toBe(MAESTRO_ID)
    expect(result.maestro.id).not.toBe(AUTH_USER_ID)
  })

  it('admin con fila en maestros recibe es_admin:true y es_maestro:true', async () => {
    const maestroRow = {
      id: 'maestro-uuid-real',
      user_id: 'auth-uuid-0000',
      nombre_completo: 'Omar Suniaga',
      correo: 'omar@test.com',
    }

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'auth-uuid-0000', email: 'omar@test.com', user_metadata: {} },
        session: { access_token: 'tok' },
      },
      error: null,
    })

    mockTables({
      profiles: { data: { rol: 'admin', estado: 'activo' }, error: null },
      maestros: { data: maestroRow, error: null },
    })

    const result = await loginMaestro('omar@test.com', 'secret')

    expect(result.success).toBe(true)
    expect(result.maestro.es_admin).toBe(true)
    expect(result.maestro.es_maestro).toBe(true)
  })

  it('admin con fila en maestros persiste el objeto correcto en localStorage', async () => {
    const maestroRow = {
      id: 'maestro-uuid-real',
      user_id: 'auth-uuid-0000',
      nombre_completo: 'Omar Suniaga',
      correo: 'omar@test.com',
    }

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'auth-uuid-0000', email: 'omar@test.com', user_metadata: {} },
        session: { access_token: 'tok' },
      },
      error: null,
    })

    mockTables({
      profiles: { data: { rol: 'admin', estado: 'activo' }, error: null },
      maestros: { data: maestroRow, error: null },
    })

    await loginMaestro('omar@test.com', 'secret')

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(stored.id).toBe('maestro-uuid-real')
    expect(stored.es_admin).toBe(true)
    expect(stored.es_maestro).toBe(true)
    expect(stored.nombre_completo).toBe('Omar Suniaga')
  })

  it('admin puro (sin fila en maestros) usa UUID de auth y es_maestro:false', async () => {
    const AUTH_USER_ID = 'auth-uuid-admin-puro'

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: AUTH_USER_ID,
          email: 'admin@test.com',
          user_metadata: { full_name: 'Admin Puro' },
        },
        session: { access_token: 'tok' },
      },
      error: null,
    })

    mockTables({
      profiles: { data: { rol: 'admin', estado: 'activo' }, error: null },
      maestros: { data: null, error: null }, // sin fila
    })

    const result = await loginMaestro('admin@test.com', 'secret')

    expect(result.success).toBe(true)
    expect(result.maestro.id).toBe(AUTH_USER_ID)
    expect(result.maestro.es_admin).toBe(true)
    expect(result.maestro.es_maestro).toBeUndefined()
  })

  it('maestro normal (no admin) recibe es_admin sin definir', async () => {
    const maestroRow = {
      id: 'maestro-uuid',
      user_id: 'auth-uuid',
      nombre_completo: 'Prof. García',
    }

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'auth-uuid', email: 'garcia@test.com', user_metadata: { rol: 'maestro' } },
        session: { access_token: 'tok' },
      },
      error: null,
    })

    mockTables({
      profiles: { data: { rol: 'maestro', estado: 'activo' }, error: null },
      maestros: { data: maestroRow, error: null },
    })

    const result = await loginMaestro('garcia@test.com', 'secret')

    expect(result.success).toBe(true)
    expect(result.maestro.id).toBe('maestro-uuid')
    expect(result.maestro.es_admin).toBeFalsy()
    expect(result.maestro.es_maestro).toBeFalsy()
  })
})
