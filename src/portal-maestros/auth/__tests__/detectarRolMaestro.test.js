/**
 * detectarRolMaestro.test.js
 *
 * Verifica el comportamiento de detectarRolMaestro() ante los distintos
 * estados de cuenta: pendiente, rechazado, activo y sin sesión.
 *
 * Caso crítico cubierto aquí:
 *   Cuando estado=pendiente, la función NO debe hacer signOut (para preservar
 *   la sesión de Supabase y poder detectar el estado en la próxima apertura).
 *   Debe retornar PENDING_APPROVAL_SENTINEL en lugar de null.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signOut: vi.fn().mockResolvedValue({}),
    },
    from: vi.fn(),
  },
}))

import { supabase } from '../../../lib/supabaseClient.js'
import {
  detectarRolMaestro,
  PENDING_APPROVAL_SENTINEL,
  STORAGE_KEY,
} from '../maestroAuth.js'

// ── Helpers ────────────────────────────────────────────────────────────────

function mockSession(userId = 'user-1') {
  supabase.auth.getSession.mockResolvedValue({
    data: {
      session: {
        user: {
          id: userId,
          email: 'maestro@soi.edu',
          user_metadata: {},
        },
      },
    },
  })
}

function mockNoSession() {
  supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
}

/**
 * Configura supabase.from() para devolver respuestas específicas por tabla.
 * Soporta encadenamiento: .select().eq().maybeSingle()/.single()
 */
function mockTables(tableMap) {
  supabase.from.mockImplementation((table) => {
    const res = tableMap[table] ?? { data: null, error: null }
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(res),
      maybeSingle: vi.fn().mockResolvedValue(res),
      upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
    }
    return chain
  })
}

// ── Suite ──────────────────────────────────────────────────────────────────

describe('detectarRolMaestro()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  // ── Sin sesión ───────────────────────────────────────────────────────────

  it('retorna null cuando no hay sesión de Supabase', async () => {
    mockNoSession()

    const result = await detectarRolMaestro()

    expect(result).toBeNull()
    expect(supabase.auth.signOut).not.toHaveBeenCalled()
  })

  // ── Estado pendiente ─────────────────────────────────────────────────────

  it('retorna PENDING_APPROVAL_SENTINEL cuando estado=pendiente', async () => {
    mockSession()
    mockTables({
      profiles: { data: { rol: 'maestro', estado: 'pendiente' }, error: null },
    })

    const result = await detectarRolMaestro()

    expect(result).toBe(PENDING_APPROVAL_SENTINEL)
    expect(result.__pendingApproval).toBe(true)
  })

  it('NO llama signOut cuando estado=pendiente (preserva sesión para reapertura de app)', async () => {
    mockSession()
    mockTables({
      profiles: { data: { rol: 'maestro', estado: 'pendiente' }, error: null },
    })

    await detectarRolMaestro()

    expect(supabase.auth.signOut).not.toHaveBeenCalled()
  })

  it('limpia localStorage cuando estado=pendiente', async () => {
    mockSession()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: 'stale' }))
    mockTables({
      profiles: { data: { rol: 'maestro', estado: 'pendiente' }, error: null },
    })

    await detectarRolMaestro()

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  // ── Estado rechazado ─────────────────────────────────────────────────────

  it('retorna null y hace signOut cuando estado=rechazado', async () => {
    mockSession()
    mockTables({
      profiles: { data: { rol: 'maestro', estado: 'rechazado' }, error: null },
    })

    const result = await detectarRolMaestro()

    expect(result).toBeNull()
    expect(supabase.auth.signOut).toHaveBeenCalledOnce()
  })

  it('retorna null y hace signOut cuando estado tiene un valor no activo desconocido', async () => {
    mockSession()
    mockTables({
      profiles: { data: { rol: 'maestro', estado: 'suspendido' }, error: null },
    })

    const result = await detectarRolMaestro()

    expect(result).toBeNull()
    expect(supabase.auth.signOut).toHaveBeenCalledOnce()
  })

  // ── Estado activo ────────────────────────────────────────────────────────

  it('retorna el maestro desde caché cuando estado=activo y hay caché válida', async () => {
    const cachedMaestro = { id: 'm1', nombre_completo: 'Rosa Mendez', user_id: 'user-1' }
    mockSession('user-1')
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedMaestro))
    // Marcar sesión activa (no PWA, modo web normal)
    sessionStorage.setItem('pm-session-active', 'true')
    localStorage.setItem('pm-session-expires', new Date(Date.now() + 86400000).toISOString())

    mockTables({
      profiles: { data: { rol: 'maestro', estado: 'activo' }, error: null },
    })

    const result = await detectarRolMaestro()

    expect(result).toMatchObject({ id: 'm1', nombre_completo: 'Rosa Mendez' })
    expect(supabase.auth.signOut).not.toHaveBeenCalled()
  })

  it('consulta la tabla maestros y guarda en caché cuando estado=activo pero no hay caché', async () => {
    const maestroFromDB = { id: 'm2', user_id: 'user-2', nombre_completo: 'Carlos Ruiz' }
    mockSession('user-2')
    mockTables({
      profiles: { data: { rol: 'maestro', estado: 'activo' }, error: null },
      maestros: { data: maestroFromDB, error: null },
    })

    const result = await detectarRolMaestro()

    expect(result).toMatchObject({ id: 'm2', nombre_completo: 'Carlos Ruiz' })
    expect(localStorage.getItem(STORAGE_KEY)).toContain('Carlos Ruiz')
  })

  // ── Distinción crítica: sentinel vs null ─────────────────────────────────

  it('sentinel es distinto de null — initPortal puede diferenciar los dos casos', async () => {
    expect(PENDING_APPROVAL_SENTINEL).not.toBeNull()
    expect(PENDING_APPROVAL_SENTINEL).not.toBeUndefined()
    expect(typeof PENDING_APPROVAL_SENTINEL).toBe('object')
    expect(PENDING_APPROVAL_SENTINEL.__pendingApproval).toBe(true)
  })

  it('sentinel está frozen — no puede ser modificado accidentalmente', () => {
    expect(Object.isFrozen(PENDING_APPROVAL_SENTINEL)).toBe(true)
  })
})
