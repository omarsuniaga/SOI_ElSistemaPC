import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(),
  }
}))

import { supabase } from '../../../../lib/supabaseClient.js'
import { renderAprobacionView } from '../aprobacionView.js'

describe('aprobacionView', () => {
  let container

  const mockPendientes = [
    { id: 'p1', email: 'maestro1@test.com', nombre_completo: 'Ana López', instrumento: 'Violín', created_at: '2026-05-15T10:00:00Z' },
    { id: 'p2', email: 'maestro2@test.com', nombre_completo: 'Carlos Ruiz', instrumento: 'Piano', created_at: '2026-05-16T14:30:00Z' },
  ]

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()

    // Mock session for admin
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'admin-123' } } },
      error: null
    })

    // Mock window dispatch for toast events
    window.dispatchEvent = vi.fn()
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  it('renders a table with pending teachers', async () => {
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockPendientes, error: null })
    })

    await renderAprobacionView(container)

    expect(container.querySelector('table')).toBeTruthy()
    expect(container.textContent).toContain('Ana López')
    expect(container.textContent).toContain('Carlos Ruiz')
    expect(container.textContent).toContain('Violín')
    expect(container.textContent).toContain('Piano')
  })

  it('shows empty message when no pending teachers', async () => {
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null })
    })

    await renderAprobacionView(container)

    expect(container.textContent).toContain('pendientes')
  })

  it('shows Aprobar and Rechazar buttons for each pending teacher', async () => {
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockPendientes, error: null })
    })

    await renderAprobacionView(container)

    const aprobarBtns = container.querySelectorAll('.btn-aprobar')
    const rechazarBtns = container.querySelectorAll('.btn-rechazar')
    expect(aprobarBtns.length).toBe(2)
    expect(rechazarBtns.length).toBe(2)
  })

  it('calls supabase update with estado=activo on Aprobar click', async () => {
    const updateMock = vi.fn().mockReturnThis()
    const eqMock = vi.fn().mockResolvedValue({ data: null, error: null })

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockPendientes, error: null }),
      update: updateMock,
    })

    await renderAprobacionView(container)

    const aprobarBtn = container.querySelector('.btn-aprobar')
    aprobarBtn.click()

    await vi.waitUntil(() => updateMock.mock.calls.length > 0, { timeout: 1000 })

    expect(updateMock).toHaveBeenCalledWith({ estado: 'activo' })
  })

  it('calls supabase update with estado=rechazado on Rechazar click', async () => {
    const updateMock = vi.fn().mockReturnThis()
    const eqMock = vi.fn().mockResolvedValue({ data: null, error: null })

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
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
