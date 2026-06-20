import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

import { supabase } from '../../../lib/supabaseClient.js'
import {
  crearSolicitud,
  buscarClasesAfectadas,
  registrarAuditoria,
  obtenerAusenciaConAuditoria,
} from '../ausenciaService.js'

const mockFrom = (tableName, response) => {
  const chain = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(response),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  }
  return chain
}

describe('ausenciaService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('crearSolicitud', () => {
    it('should insert a new ausencia and return the created record with a ticket', async () => {
      const counterChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }
      const insertChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 1, numero_ticket: 'AUS-2026-001', estado: 'pendiente' },
          error: null,
        }),
      }
      supabase.from.mockImplementation((table) => {
        if (table === 'ausencias_maestros') {
          return { ...counterChain, ...insertChain }
        }
        return insertChain
      })

      const payload = {
        maestro_id: 'abc123',
        fecha_inicio: '2026-06-01',
        fecha_fin: '2026-06-03',
        motivo: 'personal',
      }

      const result = await crearSolicitud(payload)

      expect(result).toHaveProperty('numero_ticket')
      expect(result.numero_ticket).toMatch(/^AUS-\d{4}-\d{3}$/)
    })

    it('should throw if supabase insert fails', async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        insert: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
      }
      supabase.from.mockReturnValue(chain)

      await expect(crearSolicitud({ maestro_id: 'x', fecha_inicio: '2026-06-01', fecha_fin: '2026-06-01', motivo: 'personal' })).rejects.toThrow('DB error')
    })
  })

  describe('buscarClasesAfectadas', () => {
    it('should return classes affected in the given date range for a maestro', async () => {
      const clasesMock = [
        { id: 'c1', nombre: 'Piano I', maestro_principal_id: 'abc123' },
        { id: 'c2', nombre: 'Piano II', maestro_principal_id: 'abc123' },
      ]
      const chain = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockResolvedValue({ data: clasesMock, error: null }),
      }
      supabase.from.mockReturnValue(chain)

      const result = await buscarClasesAfectadas('abc123', '2026-06-01', '2026-06-03')

      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('id', 'c1')
    })

    it('should return empty array when no classes found', async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
      supabase.from.mockReturnValue(chain)

      const result = await buscarClasesAfectadas('abc123', '2026-06-01', '2026-06-03')
      expect(result).toEqual([])
    })

    it('should throw if supabase query fails', async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockResolvedValue({ data: null, error: new Error('Query error') }),
      }
      supabase.from.mockReturnValue(chain)

      await expect(buscarClasesAfectadas('abc123', '2026-06-01', '2026-06-03')).rejects.toThrow('Query error')
    })
  })

  describe('registrarAuditoria', () => {
    it('should insert an audit record and return it', async () => {
      const auditRecord = {
        id: 'audit1',
        ausencia_id: 1,
        accion: 'creacion',
        usuario_id: 'user1',
        timestamp: '2026-05-20T10:00:00Z',
      }
      const chain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: auditRecord, error: null }),
      }
      supabase.from.mockReturnValue(chain)

      const result = await registrarAuditoria({ ausencia_id: 1, accion: 'creacion', usuario_id: 'user1' })

      expect(result).toHaveProperty('accion', 'creacion')
      expect(result).toHaveProperty('ausencia_id', 1)
    })

    it('should throw if audit insert fails', async () => {
      const chain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: new Error('Audit insert failed') }),
      }
      supabase.from.mockReturnValue(chain)

      await expect(registrarAuditoria({ ausencia_id: 1, accion: 'creacion', usuario_id: 'user1' })).rejects.toThrow('Audit insert failed')
    })
  })

  describe('obtenerAusenciaConAuditoria', () => {
    it('should return ausencia with its audit trail', async () => {
      const ausencia = { id: 1, numero_ticket: 'AUS-2026-001', estado: 'pendiente' }
      const audits = [
        { id: 'a1', ausencia_id: 1, accion: 'creacion' },
      ]
      let callCount = 0
      supabase.from.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: ausencia, error: null }),
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: audits, error: null }),
        }
      })

      const result = await obtenerAusenciaConAuditoria(1)

      expect(result).toHaveProperty('ausencia')
      expect(result).toHaveProperty('auditoria')
      expect(result.ausencia).toEqual(ausencia)
      expect(result.auditoria).toEqual(audits)
    })
  })
})
