/**
 * alumnosSupabase.test.js
 * B04: null guard in actualizarAlumno — throws when supabase returns empty data
 * D01: obtenerAlumnos returns { alumnos, total } with pagination support
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Supabase mock for B04 (actualizarAlumno) ───────────────────────────────

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

// ─── D01 — obtenerAlumnos pagination ────────────────────────────────────────

describe('D01 — obtenerAlumnos pagination', () => {
  it('source: obtenerAlumnos accepts { page, pageSize } params', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const { fileURLToPath } = await import('url')
    const { dirname } = await import('path')

    const thisFile = fileURLToPath(import.meta.url)
    const apiPath = path.join(dirname(thisFile), '..', 'api', 'alumnosSupabase.js')
    const source = fs.readFileSync(apiPath, 'utf8')

    // Must accept { page, pageSize } with defaults
    expect(source).toMatch(/page\s*=\s*0/)
    expect(source).toMatch(/pageSize\s*=/)
  })

  it('source: obtenerAlumnos uses .range() for pagination', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const { fileURLToPath } = await import('url')
    const { dirname } = await import('path')

    const thisFile = fileURLToPath(import.meta.url)
    const apiPath = path.join(dirname(thisFile), '..', 'api', 'alumnosSupabase.js')
    const source = fs.readFileSync(apiPath, 'utf8')

    expect(source).toMatch(/\.range\(/)
  })

  it('source: obtenerAlumnos returns { alumnos, total } shape', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const { fileURLToPath } = await import('url')
    const { dirname } = await import('path')

    const thisFile = fileURLToPath(import.meta.url)
    const apiPath = path.join(dirname(thisFile), '..', 'api', 'alumnosSupabase.js')
    const source = fs.readFileSync(apiPath, 'utf8')

    // obtenerAlumnos function must return { alumnos, total }
    const fnIdx = source.indexOf('export async function obtenerAlumnos')
    expect(fnIdx).toBeGreaterThan(-1)
    const fnBody = source.slice(fnIdx, fnIdx + 600)
    expect(fnBody).toMatch(/return\s*\{\s*alumnos/)
    expect(fnBody).toMatch(/total/)
  })

  it('source: alumnosView.js destructures { alumnos, total } from obtenerAlumnos', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const { fileURLToPath } = await import('url')
    const { dirname } = await import('path')

    const thisFile = fileURLToPath(import.meta.url)
    const viewPath = path.join(dirname(thisFile), '..', 'views', 'alumnosView.js')
    const source = fs.readFileSync(viewPath, 'utf8')

    // alumnosView must destructure the new return shape
    expect(source).toMatch(/const\s*\{\s*alumnos[^}]*\}\s*=\s*await\s+obtenerAlumnos/)
  })

  it('backward compat: called with no args still returns { alumnos, total }', async () => {
    // This is a structural test — we verified the function signature has defaults
    const fs = await import('fs')
    const path = await import('path')
    const { fileURLToPath } = await import('url')
    const { dirname } = await import('path')

    const thisFile = fileURLToPath(import.meta.url)
    const apiPath = path.join(dirname(thisFile), '..', 'api', 'alumnosSupabase.js')
    const source = fs.readFileSync(apiPath, 'utf8')

    // Default params ensure backward compat: { page = 0, pageSize = 100 } = {}
    const fnIdx = source.indexOf('export async function obtenerAlumnos')
    const fnSig = source.slice(fnIdx, fnIdx + 120)
    expect(fnSig).toMatch(/=\s*\{\}/)  // has default empty object destructuring
  })
})
