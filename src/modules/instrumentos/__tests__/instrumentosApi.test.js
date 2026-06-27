/**
 * instrumentosApi.test.js
 * SP-2 — Módulo instrumentos (DataAdapter TDD)
 * Tests written BEFORE implementation (strict TDD mode).
 * Tests target instrumentosSupabase.js (real adapter with mocked Supabase client).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Supabase mock (chainable, mirrors tareasApi.sp0.test.js pattern) ─────────

let _resolveValue = { data: [], error: null }

const mockSingle = vi.fn()
const mockOrder = vi.fn()
const mockEq = vi.fn()
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockFrom = vi.fn()
const mockOr = vi.fn()

const chain = {
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  eq: mockEq,
  order: mockOrder,
  single: mockSingle,
  or: mockOr,
}

mockSelect.mockReturnValue(chain)
mockInsert.mockReturnValue(chain)
mockUpdate.mockReturnValue(chain)
mockEq.mockReturnValue(chain)
mockOr.mockReturnValue(chain)

mockOrder.mockImplementation(() => ({
  ...chain,
  then(resolve, reject) {
    return Promise.resolve(_resolveValue).then(resolve, reject)
  },
}))

mockSingle.mockImplementation(() => Promise.resolve(_resolveValue))
mockFrom.mockReturnValue(chain)

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: (...a) => mockFrom(...a),
  },
}))

// ─── Import AFTER mock ──────────────────────────────────────────────────────
import * as sb from '../api/instrumentosSupabase.js'

// ─── Helpers ────────────────────────────────────────────────────────────────
const INSTRUMENTO_ID = 'inst-test-uuid-001'

const INSTRUMENTO_MOCK = {
  id: INSTRUMENTO_ID,
  codigo: 'VIO-001',
  nombre: 'Violín 4/4',
  tipo: 'cuerda',
  marca: 'Stentor',
  serie: 'SN-12345',
  estado: 'disponible',
  alumno_id: null,
  alumno_nombre: null,
  notas: null,
  created_at: '2026-06-01T00:00:00Z',
  updated_at: '2026-06-01T00:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSelect.mockReturnValue(chain)
  mockInsert.mockReturnValue(chain)
  mockUpdate.mockReturnValue(chain)
  mockEq.mockReturnValue(chain)
  mockOr.mockReturnValue(chain)
  mockFrom.mockReturnValue(chain)
  mockOrder.mockImplementation(() => ({
    ...chain,
    then(resolve, reject) {
      return Promise.resolve(_resolveValue).then(resolve, reject)
    },
  }))
  mockSingle.mockImplementation(() => Promise.resolve(_resolveValue))
  _resolveValue = { data: [], error: null }
})

// ─── listarInstrumentos ───────────────────────────────────────────────────────

describe('listarInstrumentos', () => {
  it('returns array of instruments without filters', async () => {
    _resolveValue = { data: [INSTRUMENTO_MOCK], error: null }
    const result = await sb.listarInstrumentos({})
    expect(result).toEqual([INSTRUMENTO_MOCK])
    expect(mockFrom).toHaveBeenCalledWith('instrumentos')
  })

  it('filters by estado when provided', async () => {
    _resolveValue = { data: [], error: null }
    await sb.listarInstrumentos({ estado: 'danado' })
    expect(mockEq).toHaveBeenCalledWith('estado', 'danado')
  })

  it('returns empty array when no instruments exist', async () => {
    _resolveValue = { data: null, error: null }
    const result = await sb.listarInstrumentos({})
    expect(result).toEqual([])
  })

  it('throws on Supabase error', async () => {
    _resolveValue = { data: null, error: { message: 'DB error' } }
    await expect(sb.listarInstrumentos({})).rejects.toMatchObject({ message: 'DB error' })
  })
})

// ─── crearInstrumento ─────────────────────────────────────────────────────────

describe('crearInstrumento', () => {
  it('inserts and returns the new instrument', async () => {
    _resolveValue = { data: INSTRUMENTO_MOCK, error: null }
    const result = await sb.crearInstrumento({ codigo: 'VIO-001', nombre: 'Violín 4/4' })
    expect(result).toEqual(INSTRUMENTO_MOCK)
    expect(mockFrom).toHaveBeenCalledWith('instrumentos')
    expect(mockInsert).toHaveBeenCalled()
  })

  it('throws on Supabase error', async () => {
    _resolveValue = { data: null, error: { message: 'duplicate key' } }
    await expect(sb.crearInstrumento({ codigo: 'VIO-001', nombre: 'Violín' })).rejects.toMatchObject({ message: 'duplicate key' })
  })
})

// ─── actualizarInstrumento ────────────────────────────────────────────────────

describe('actualizarInstrumento', () => {
  it('updates fields and returns updated instrument', async () => {
    const updated = { ...INSTRUMENTO_MOCK, notas: 'Revisado' }
    _resolveValue = { data: updated, error: null }
    const result = await sb.actualizarInstrumento(INSTRUMENTO_ID, { notas: 'Revisado' })
    expect(result).toEqual(updated)
    expect(mockEq).toHaveBeenCalledWith('id', INSTRUMENTO_ID)
    expect(mockUpdate).toHaveBeenCalled()
  })

  it('throws on Supabase error', async () => {
    _resolveValue = { data: null, error: { message: 'not found' } }
    await expect(sb.actualizarInstrumento(INSTRUMENTO_ID, {})).rejects.toMatchObject({ message: 'not found' })
  })
})

// ─── cambiarEstadoInstrumento ─────────────────────────────────────────────────

describe('cambiarEstadoInstrumento', () => {
  it('updates estado field', async () => {
    const updated = { ...INSTRUMENTO_MOCK, estado: 'en_reparacion' }
    _resolveValue = { data: updated, error: null }
    const result = await sb.cambiarEstadoInstrumento(INSTRUMENTO_ID, 'en_reparacion')
    expect(result.estado).toBe('en_reparacion')
    expect(mockEq).toHaveBeenCalledWith('id', INSTRUMENTO_ID)
  })

  it('throws on invalid state (DB constraint)', async () => {
    _resolveValue = { data: null, error: { message: 'check constraint violation' } }
    await expect(sb.cambiarEstadoInstrumento(INSTRUMENTO_ID, 'estado_invalido')).rejects.toBeDefined()
  })
})

// ─── asignarInstrumento ───────────────────────────────────────────────────────

describe('asignarInstrumento', () => {
  it('sets alumno_id, alumno_nombre, estado=asignado', async () => {
    const updated = { ...INSTRUMENTO_MOCK, alumno_id: 'alu-001', alumno_nombre: 'Juan', estado: 'asignado' }
    _resolveValue = { data: updated, error: null }
    const result = await sb.asignarInstrumento(INSTRUMENTO_ID, 'alu-001', 'Juan')
    expect(result.estado).toBe('asignado')
    expect(result.alumno_id).toBe('alu-001')
    expect(result.alumno_nombre).toBe('Juan')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ alumno_id: 'alu-001', alumno_nombre: 'Juan', estado: 'asignado' }),
    )
  })

  it('throws on Supabase error', async () => {
    _resolveValue = { data: null, error: { message: 'FK violation' } }
    await expect(sb.asignarInstrumento(INSTRUMENTO_ID, 'bad-id', 'X')).rejects.toBeDefined()
  })
})
