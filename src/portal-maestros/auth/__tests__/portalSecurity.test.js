/**
 * portalSecurity.test.js
 * Verifica que el portal de maestros este correctamente blindado.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn().mockResolvedValue({}),
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
}))

import { supabase } from '../../../lib/supabaseClient.js'
import {
  loginMaestro,
  detectarRolMaestro,
  getMaestroLocal,
  PENDING_APPROVAL_SENTINEL,
  STORAGE_KEY,
} from '../maestroAuth.js'

function mockSignIn(userId, role) {
  supabase.auth.signInWithPassword.mockResolvedValue({
    data: {
      user: { id: userId, email: `${role}@soi.edu`, user_metadata: { rol: role } },
      session: { access_token: 'tok' },
    },
    error: null,
  })
}

function mockTableChain(tableMap) {
  supabase.from.mockImplementation((table) => {
    const res = tableMap[table] ?? { data: null, error: null }
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue(res),
      single: vi.fn().mockResolvedValue(res),
      upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnThis(),
    }
  })
}

function mockSessionFor(userId, estado, rol) {
  supabase.auth.getSession.mockResolvedValue({
    data: {
      session: {
        user: { id: userId, email: `${rol}@soi.edu`, user_metadata: { rol } },
      },
    },
  })
  mockTableChain({
    profiles: { data: { rol, estado }, error: null },
    maestros: { data: { id: userId, user_id: userId, nombre_completo: 'Test User' }, error: null },
  })
}

// Suite 1: loginMaestro
describe('loginMaestro() -- identificacion de roles', () => {
  beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); sessionStorage.clear() })

  it('bloquea cuenta pendiente y retorna pendingApproval=true', async () => {
    mockSignIn('u-pending', 'maestro')
    mockTableChain({ profiles: { data: { rol: 'maestro', estado: 'pendiente' }, error: null } })
    const result = await loginMaestro('maestro@soi.edu', 'pass')
    expect(result.success).toBe(false)
    expect(result.pendingApproval).toBe(true)
    expect(supabase.auth.signOut).toHaveBeenCalled()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('bloquea cuenta rechazada', async () => {
    mockSignIn('u-rej', 'maestro')
    mockTableChain({ profiles: { data: { rol: 'maestro', estado: 'rechazado' }, error: null } })
    const result = await loginMaestro('maestro@soi.edu', 'pass')
    expect(result.success).toBe(false)
    expect(supabase.auth.signOut).toHaveBeenCalled()
  })

  it('permite maestro activo y guarda en localStorage', async () => {
    const maestro = { id: 'm1', user_id: 'u1', nombre_completo: 'Carmen Diaz' }
    mockSignIn('u1', 'maestro')
    mockTableChain({
      profiles: { data: { rol: 'maestro', estado: 'activo' }, error: null },
      maestros: { data: maestro, error: null },
    })
    const result = await loginMaestro('maestro@soi.edu', 'pass')
    expect(result.success).toBe(true)
    expect(result.maestro.nombre_completo).toBe('Carmen Diaz')
    expect(localStorage.getItem(STORAGE_KEY)).toContain('Carmen Diaz')
  })

  it('identifica admin activo y lo marca con es_admin=true', async () => {
    const adminRow = { id: 'a1', user_id: 'ua1', nombre_completo: 'Admin SOI', es_admin: true }
    mockSignIn('ua1', 'admin')
    mockTableChain({
      profiles: { data: { rol: 'admin', estado: 'activo' }, error: null },
      maestros: { data: adminRow, error: null },
    })
    const result = await loginMaestro('admin@soi.edu', 'pass')
    expect(result.success).toBe(true)
    expect(result.maestro.es_admin).toBe(true)
  })
})

// Suite 2: detectarRolMaestro
describe('detectarRolMaestro() -- seguridad en apertura de app', () => {
  beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); sessionStorage.clear() })

  it('retorna null cuando no hay sesion activa', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    expect(await detectarRolMaestro()).toBeNull()
    expect(supabase.auth.signOut).not.toHaveBeenCalled()
  })

  it('retorna PENDING_APPROVAL_SENTINEL para cuenta pendiente (sin signOut)', async () => {
    mockSessionFor('u-p', 'pendiente', 'maestro')
    const result = await detectarRolMaestro()
    expect(result).toBe(PENDING_APPROVAL_SENTINEL)
    expect(result.__pendingApproval).toBe(true)
    expect(supabase.auth.signOut).not.toHaveBeenCalled()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('hace signOut y retorna null para cuenta rechazada', async () => {
    mockSessionFor('u-r', 'rechazado', 'maestro')
    const result = await detectarRolMaestro()
    expect(result).toBeNull()
    expect(supabase.auth.signOut).toHaveBeenCalled()
  })

  it('retorna perfil valido para maestro activo', async () => {
    mockSessionFor('u-ok', 'activo', 'maestro')
    localStorage.setItem('pm-session-expires', new Date(Date.now() + 86400000).toISOString())
    sessionStorage.setItem('pm-session-active', 'true')
    const result = await detectarRolMaestro()
    expect(result).not.toBeNull()
    expect(result?.__pendingApproval).toBeUndefined()
  })
})

// Suite 3: getMaestroLocal
describe('getMaestroLocal() -- cache de sesion', () => {
  beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); sessionStorage.clear() })

  it('no lanza error cuando localStorage esta vacio', () => {
    expect(() => getMaestroLocal()).not.toThrow()
  })

  it('retorna null cuando pm-session-expires esta vencido', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: 'm1', nombre_completo: 'Test' }))
    localStorage.setItem('pm-session-expires', new Date(Date.now() - 1000).toISOString())
    expect(getMaestroLocal()).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('retorna el perfil cuando la sesion es valida', () => {
    const maestro = { id: 'm1', nombre_completo: 'Rosa Perez', user_id: 'u1' }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(maestro))
    localStorage.setItem('pm-session-expires', new Date(Date.now() + 86400000).toISOString())
    sessionStorage.setItem('pm-session-active', 'true')
    const result = getMaestroLocal()
    expect(result).toMatchObject({ nombre_completo: 'Rosa Perez' })
  })

  it('limpia cache corrupta y retorna null', () => {
    localStorage.setItem(STORAGE_KEY, 'json-invalido{{{')
    expect(getMaestroLocal()).toBeNull()
  })
})

// Suite 4: admin puro vs admin-maestro
describe('Identificacion admin puro vs admin-maestro', () => {
  beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); sessionStorage.clear() })

  it('admin puro sin row en maestros: es_admin=true, sin es_maestro', async () => {
    mockSignIn('ua-puro', 'admin')
    mockTableChain({
      profiles: { data: { rol: 'admin', estado: 'activo' }, error: null },
      maestros: { data: null, error: null },
    })
    const result = await loginMaestro('admin@soi.edu', 'pass')
    expect(result.success).toBe(true)
    expect(result.maestro.es_admin).toBe(true)
    expect(result.maestro.es_maestro).toBeUndefined()
  })

  it('admin que tambien es maestro: es_admin=true y es_maestro=true', async () => {
    const adminMaestro = { id: 'am1', user_id: 'uam1', nombre_completo: 'Omar Admin', es_maestro: true }
    mockSignIn('uam1', 'admin')
    mockTableChain({
      profiles: { data: { rol: 'admin', estado: 'activo' }, error: null },
      maestros: { data: adminMaestro, error: null },
    })
    const result = await loginMaestro('admin@soi.edu', 'pass')
    expect(result.success).toBe(true)
    expect(result.maestro.es_admin).toBe(true)
    expect(result.maestro.es_maestro).toBe(true)
  })

  it('logica de redireccion: admin puro va a /admin, admin-maestro se queda en portal', () => {
    const debeRedirigir = (m) => m.es_admin && !m.es_maestro

    expect(debeRedirigir({ es_admin: true, es_maestro: undefined })).toBe(true)
    expect(debeRedirigir({ es_admin: true, es_maestro: true })).toBe(false)
    expect(debeRedirigir({ es_admin: false, es_maestro: true })).toBe(false)
  })
})
