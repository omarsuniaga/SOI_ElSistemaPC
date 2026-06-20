/**
 * alumnosSupabase.test.js
 * B04: null guard in actualizarAlumno — throws when supabase returns empty data
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Supabase mock ───────────────────────────────────────────────────────

let mockData = []
let mockError = null

const mockSelect = vi.fn(() => Promise.resolve({ data: mockData, error: mockError }))
const mockEq = vi.fn(() => ({ select: mockSelect }))
const mockUpdate = vi.fn(() => ({ eq: mockEq }))
const mockFrom = vi.fn(() => ({ update: mockUpdate }))

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
  },
}))

import { actualizarAlumno } from '../api/alumnosSupabase.js'

describe('B04 — actualizarAlumno null guard', () => {
  beforeEach(() => {
    mockData = []
    mockError = null
    vi.clearAllMocks()
    mockSelect.mockResolvedValue({ data: mockData, error: mockError })
    mockEq.mockReturnValue({ select: mockSelect })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ update: mockUpdate })
  })

  it('throws when supabase returns empty data array', async () => {
    mockData = []
    mockSelect.mockResolvedValue({ data: [], error: null })

    await expect(actualizarAlumno('id-123', { nombre: 'Test' }))
      .rejects.toThrow(/no encontrado/i)
  })

  it('throws when supabase returns null data', async () => {
    mockSelect.mockResolvedValue({ data: null, error: null })

    await expect(actualizarAlumno('id-456', { nombre: 'Test' }))
      .rejects.toThrow(/no encontrado/i)
  })

  it('does NOT throw when supabase returns valid data', async () => {
    const alumnoRow = {
      id: 'id-789',
      nombre_completo: 'Ana Lopez',
      correo_representante: 'ana@test.com',
      instrumento_principal: 'Piano',
      is_active: true,
      alumnos_clases: [],
    }
    mockSelect.mockResolvedValue({ data: [alumnoRow], error: null })

    await expect(actualizarAlumno('id-789', { nombre_completo: 'Ana Lopez' }))
      .resolves.toBeDefined()
  })

  it('still throws on supabase error (existing behavior)', async () => {
    mockSelect.mockResolvedValue({ data: null, error: { message: 'DB error', code: '42000' } })

    await expect(actualizarAlumno('id-000', { nombre: 'X' }))
      .rejects.toThrow()
  })
})
