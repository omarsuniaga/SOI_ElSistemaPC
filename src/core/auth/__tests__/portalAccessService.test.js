import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getPortalCatalog,
  getAuthorizedPortales,
  checkPortalAccess,
  setUserPortales,
  getAssignedPortalIds,
  DEFAULT_PORTAL_CATALOG
} from '../portalAccessService.js'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn()
  }
}))

import { supabase } from '../../../lib/supabaseClient.js'

describe('portalAccessService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna el catálogo por defecto si falla la base de datos', async () => {
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } })
        })
      })
    })

    const catalog = await getPortalCatalog()
    expect(catalog).toEqual(DEFAULT_PORTAL_CATALOG)
  })

  it('superadmin siempre tiene acceso al portal sin importar RPC', async () => {
    const hasAccess = await checkPortalAccess('ADM', { role: 'superadmin' })
    expect(hasAccess).toBe(true)
  })

  it('valida acceso vía RPC has_portal_access con normalización de portalId', async () => {
    supabase.rpc.mockResolvedValue({ data: true, error: null })
    const hasAccess = await checkPortalAccess('  fin  ', { userId: 'user-123', role: 'admin' })
    expect(hasAccess).toBe(true)
    expect(supabase.rpc).toHaveBeenCalledWith('has_portal_access', {
      p_portal_id: 'FIN',
      p_user_id: 'user-123'
    })
  })

  it('retorna false si portalId es inválido o vacío', async () => {
    const hasAccess = await checkPortalAccess('', { userId: 'user-123' })
    expect(hasAccess).toBe(false)
  })

  it('permite asignar portales vía setUserPortales y retorna estructura controlada', async () => {
    supabase.rpc.mockResolvedValue({
      data: { success: true, user_id: 'user-123', assigned_count: 2 },
      error: null
    })

    const res = await setUserPortales('user-123', ['ADM', 'ACM'])
    expect(res.success).toBe(true)
    expect(supabase.rpc).toHaveBeenCalledWith('set_user_portales', {
      p_user_id: 'user-123',
      p_portal_ids: ['ADM', 'ACM']
    })
  })

  it('captura errores de setUserPortales de forma segura', async () => {
    supabase.rpc.mockResolvedValue({
      data: null,
      error: { message: 'No autorizado' }
    })

    const res = await setUserPortales('user-123', ['SUPERADMIN'])
    expect(res.success).toBe(false)
    expect(res.error).toBe('No autorizado')
  })

  it('obtiene los assigned portal ids explícitos', async () => {
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [{ portal_id: 'ADM' }, { portal_id: 'FIN' }],
          error: null
        })
      })
    })

    const ids = await getAssignedPortalIds('user-123')
    expect(ids).toEqual(['ADM', 'FIN'])
  })
})
