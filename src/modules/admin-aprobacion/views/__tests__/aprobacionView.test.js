import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(),
    rpc: vi.fn(),
  },
}))

import { supabase } from '../../../../lib/supabaseClient.js'
import { renderAprobacionView } from '../aprobacionView.js'

describe('aprobacionView', () => {
  let container

  const mockPendientes = [
    {
      id: 'p1',
      email: 'maestro1@test.com',
      nombre_completo: 'Ana López',
      instrumento: 'Violín',
      solicitud_instrumento: 'Violín',
      solicitud_resena: 'Maestra con experiencia en iniciación musical',
      created_at: '2026-05-15T10:00:00Z',
    },
    {
      id: 'p2',
      email: 'maestro2@test.com',
      nombre_completo: 'Carlos Ruiz',
      instrumento: 'Piano',
      solicitud_instrumento: 'Piano',
      solicitud_resena: 'Pianista especializado en repertorio clásico',
      created_at: '2026-05-16T14:30:00Z',
    },
  ]

  function mockSelectChain(returnData) {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      order: vi.fn().mockResolvedValue({ data: returnData, error: null }),
      update: vi.fn().mockReturnThis(),
    }
  }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()

    // Mock session for admin
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'admin-123' } } },
      error: null,
    })

    // Mock window dispatch for toast events
    window.dispatchEvent = vi.fn()
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  it('renders a table with pending teachers', async () => {
    supabase.from.mockReturnValue(mockSelectChain(mockPendientes))

    await renderAprobacionView(container)

    expect(container.querySelector('table')).toBeTruthy()
    expect(container.textContent).toContain('Ana López')
    expect(container.textContent).toContain('Carlos Ruiz')
    expect(container.textContent).toContain('Rol solicitado')
  })

  it('shows empty message when no pending teachers', async () => {
    supabase.from.mockReturnValue(mockSelectChain([]))

    await renderAprobacionView(container)

    expect(container.textContent).toContain('pendientes')
  })

  it('shows Aprobar and Rechazar buttons for each pending teacher', async () => {
    supabase.from.mockReturnValue(mockSelectChain(mockPendientes))

    await renderAprobacionView(container)

    const aprobarBtns = container.querySelectorAll('.btn-aprobar')
    const rechazarBtns = container.querySelectorAll('.btn-rechazar')
    expect(aprobarBtns.length).toBe(2)
    expect(rechazarBtns.length).toBe(2)
  })

  it('calls rpc approve_maestro_profile with correct params on Aprobar click', async () => {
    const rpcMock = vi.fn().mockResolvedValue({
      data: { success: true, rol: 'maestro', estado: 'activo' },
      error: null,
    })
    supabase.rpc = rpcMock

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      order: vi.fn().mockResolvedValue({ data: mockPendientes, error: null }),
    })

    await renderAprobacionView(container)

    const aprobarBtn = container.querySelector('.btn-aprobar')
    aprobarBtn.click()

    // Modal opens — click the save button
    await vi.waitUntil(() => document.querySelector('.app-modal-btn-save'), { timeout: 1000 })
    document.querySelector('.app-modal-btn-save').click()

    await vi.waitUntil(() => rpcMock.mock.calls.length > 0, { timeout: 1000 })

    expect(rpcMock).toHaveBeenCalledWith('approve_maestro_profile', {
      p_profile_id: 'p1',
      p_new_rol: 'maestro',
      p_new_estado: 'activo',
    })
  })

  it('calls supabase update with estado=rechazado on Rechazar click', async () => {
    const updateMock = vi.fn().mockReturnThis()

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      order: vi.fn().mockResolvedValue({ data: mockPendientes, error: null }),
      update: updateMock,
    })

    await renderAprobacionView(container)

    const rechazarBtn = container.querySelector('.btn-rechazar')
    rechazarBtn.click()

    await vi.waitUntil(() => updateMock.mock.calls.length > 0, { timeout: 1000 })

    expect(updateMock).toHaveBeenCalledWith({ estado: 'rechazado' })
  })
})
