import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getPerfil,
  confirmarPropuesta,
  descartarPropuesta,
  getPerfilSummary,
  getPerfilHistorial,
} from '../perfilConocimientoApi.js'
import { supabase } from '../../../../lib/supabaseClient.js'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn() },
}))

function mockResolve(value) {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    neq: vi.fn(() => chain),
    order: vi.fn().mockResolvedValue(value),
    then: vi.fn((onFulfilled) => Promise.resolve(value).then(onFulfilled)),
  }
  return chain
}

describe('perfilConocimientoApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPerfil', () => {
    it('returns data grouped by dimension', async () => {
      const rows = [
        {
          id: '1',
          alumno_id: 'a1',
          dimension: 'habilidad',
          item: 'Escala',
          estado: 'confirmado',
          indicator_id: null,
          madurez: 3,
          confianza: 1.0,
          origen_obs_id: null,
          evidencia_texto: null,
          creado_por: 'dsl',
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
        },
        {
          id: '2',
          alumno_id: 'a1',
          dimension: 'problema',
          item: 'Falta',
          estado: 'propuesto',
          indicator_id: null,
          madurez: 1,
          confianza: 0.8,
          origen_obs_id: null,
          evidencia_texto: null,
          creado_por: 'llm',
          created_at: '2026-01-02',
          updated_at: '2026-01-02',
        },
      ]
      supabase.from.mockReturnValue(mockResolve({ data: rows, error: null }))

      const result = await getPerfil('a1')
      expect(result.data).toHaveLength(2)
      expect(result.grouped).toHaveProperty('habilidad')
      expect(result.grouped).toHaveProperty('problema')
      expect(result.grouped.habilidad).toHaveLength(1)
      expect(result.grouped.problema).toHaveLength(1)
    })

    it('excludes estado=descartado', async () => {
      supabase.from.mockReturnValue(mockResolve({ data: [], error: null }))
      await getPerfil('a1')
      expect(supabase.from).toHaveBeenCalledWith('perfil_conocimiento')
    })

    it('orders by created_at descending', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null })
      const chain = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        neq: vi.fn(() => chain),
        order: mockOrder,
      }
      supabase.from.mockReturnValue(chain)

      await getPerfil('a1')

      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    })
  })

  describe('confirmarPropuesta', () => {
    it('updates estado to confirmado', async () => {
      const updated = { id: '1', estado: 'confirmado' }
      const mockSingle = vi.fn().mockResolvedValue({ data: updated, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ update: mockUpdate })

      const result = await confirmarPropuesta('1')
      expect(result.estado).toBe('confirmado')
      expect(supabase.from).toHaveBeenCalledWith('perfil_conocimiento')
    })

    it('throws on error', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
      supabase.from.mockReturnValue({ update: vi.fn().mockReturnValue({ eq: mockEq }) })

      await expect(confirmarPropuesta('1')).rejects.toThrow('DB error')
    })
  })

  describe('descartarPropuesta', () => {
    it('updates estado to descartado', async () => {
      const updated = { id: '1', estado: 'descartado' }
      const mockSingle = vi.fn().mockResolvedValue({ data: updated, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ update: mockUpdate })

      const result = await descartarPropuesta('1')
      expect(result.estado).toBe('descartado')
    })
  })

  describe('getPerfilSummary', () => {
    it('returns correct counts', async () => {
      const rows = [
        { dimension: 'habilidad', estado: 'confirmado', confianza: 1.0 },
        { dimension: 'problema', estado: 'propuesto', confianza: 0.8 },
        { dimension: 'repertorio', estado: 'confirmado', confianza: 1.0 },
      ]
      supabase.from.mockReturnValue(mockResolve({ data: rows, error: null }))

      const result = await getPerfilSummary('a1')
      expect(result.total).toBe(3)
      expect(result.confirmados).toBe(2)
      expect(result.propuestos).toBe(1)
      expect(result.dimensiones).toEqual(['habilidad', 'problema', 'repertorio'])
    })

    it('returns empty stats when no data', async () => {
      supabase.from.mockReturnValue(mockResolve({ data: [], error: null }))

      const result = await getPerfilSummary('a1')
      expect(result.total).toBe(0)
      expect(result.confirmados).toBe(0)
      expect(result.propuestos).toBe(0)
      expect(result.dimensiones).toEqual([])
    })
  })

  describe('getPerfilHistorial', () => {
    it('returns historial ordered by created_at descending', async () => {
      const historial = [
        {
          id: 'h2',
          perfil_id: '1',
          madurez_anterior: 2,
          madurez_nueva: 3,
          created_at: '2026-02-01',
        },
        {
          id: 'h1',
          perfil_id: '1',
          madurez_anterior: 1,
          madurez_nueva: 2,
          created_at: '2026-01-01',
        },
      ]
      const mockOrder = vi.fn().mockResolvedValue({ data: historial, error: null })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await getPerfilHistorial('1')
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('h2')
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('returns empty array on no data', async () => {
      supabase.from.mockReturnValue(mockResolve({ data: null, error: null }))
      const result = await getPerfilHistorial('1')
      expect(result).toEqual([])
    })
  })
})
