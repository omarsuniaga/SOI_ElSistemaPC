import { describe, expect, it, vi, beforeEach } from 'vitest'
import { supabase } from '../../../lib/supabaseClient.js'
import {
  registrarContacto,
  enviarSeguimientoAusentismo,
  fetchSeguimientoAusentes,
  justificarAusenciaDia,
} from './seguimientoAusentesService.js'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}))

vi.mock('../domain/plantillasAusentismo.js', () => ({
  construirMensajeAusentismo: vi.fn(({ nivel, destinatario, alumno }) => {
    return `Mensaje de nivel ${nivel} para ${alumno.alumno_nombre}`
  }),
}))

describe('seguimientoAusentesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper to create a chainable mock for duplicate check queries
  function createChainableDuplicateCheckMock() {
    return {
      eq: vi.fn().mockReturnThis(),
    }
  }

  // ========== Task 1: Persist the exact WhatsApp message sent ==========

  describe('Task 1: Persist mensaje_enviado', () => {
    it('registrarContacto includes mensaje_enviado in insert payload when provided', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'com-1', alumno_id: 'alu-1' },
            error: null,
          }),
        }),
      })

      const chainable = createChainableDuplicateCheckMock()
      chainable.gte = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      })

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(chainable),
        insert: mockInsert,
      })

      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      })

      const resultado = await registrarContacto({
        alumnoId: 'alu-1',
        nivel: 1,
        contactoTelefono: '+1234567890',
        contactoNombre: 'Mamá',
        notas: 'Test note',
        responsableId: 'user-1',
        mensajeEnviado: 'Hola, este es el mensaje exacto',
      })

      expect(mockInsert).toHaveBeenCalled()
      const insertPayload = mockInsert.mock.calls[0][0]
      expect(insertPayload).toHaveProperty('mensaje_enviado', 'Hola, este es el mensaje exacto')
    })

    it('registrarContacto works without mensaje_enviado (backward compat)', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'com-1' },
            error: null,
          }),
        }),
      })

      const chainable = createChainableDuplicateCheckMock()
      chainable.gte = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      })

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(chainable),
        insert: mockInsert,
      })

      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      })

      await registrarContacto({
        alumnoId: 'alu-1',
        nivel: 1,
        contactoTelefono: '+1234567890',
        responsableId: 'user-1',
      })

      const insertPayload = mockInsert.mock.calls[0][0]
      expect(insertPayload).not.toHaveProperty('mensaje_enviado')
    })

    it('enviarSeguimientoAusentismo uses mensajeOverride when provided', async () => {
      const alumno = {
        alumno_id: 'alu-1',
        alumno_nombre: 'Juan García',
        contacto_telefono: '+1234567890',
        contacto_nombre: 'Mamá',
        nivel: 1,
      }

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'com-1' },
            error: null,
          }),
        }),
      })

      const chainable = createChainableDuplicateCheckMock()
      chainable.gte = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      })

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(chainable),
        insert: mockInsert,
      })

      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      })

      const customMessage = 'Mensaje personalizado editado por el usuario'

      const resultado = await enviarSeguimientoAusentismo({
        alumno,
        nivel: 1,
        mensajeOverride: customMessage,
      })

      // Verify the insert was called with the override message
      const insertPayload = mockInsert.mock.calls[0][0]
      expect(insertPayload).toHaveProperty('mensaje_enviado', customMessage)
      // Verify the returned mensaje is the override
      expect(resultado.mensaje).toBe(customMessage)
    })

    it('enviarSeguimientoAusentismo falls back to construirMensajeAusentismo when no override', async () => {
      const alumno = {
        alumno_id: 'alu-1',
        alumno_nombre: 'Juan García',
        contacto_telefono: '+1234567890',
        contacto_nombre: 'Mamá',
        nivel: 1,
      }

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'com-1' },
            error: null,
          }),
        }),
      })

      const chainable = createChainableDuplicateCheckMock()
      chainable.gte = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      })

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(chainable),
        insert: mockInsert,
      })

      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      })

      const resultado = await enviarSeguimientoAusentismo({
        alumno,
        nivel: 1,
      })

      // The built message should be used (mocked to return a predictable string)
      expect(resultado.mensaje).toBe('Mensaje de nivel 1 para Juan García')
    })
  })

  // ========== Task 3: Activate justificar_alumno_por_dia RPC ==========

  describe('Task 3: justificarAusenciaDia RPC', () => {
    it('calls justificar_alumno_por_dia RPC with correct p_* arguments', async () => {
      supabase.rpc.mockResolvedValue({
        data: {
          success: true,
          message: 'Ausencia justificada',
          asistencias_updated: 2,
          affected_clases_ids: ['clase-1', 'clase-2'],
        },
        error: null,
      })

      const resultado = await justificarAusenciaDia({
        alumnoId: 'alu-1',
        fecha: '2026-10-03',
        motivo: 'Cita médica',
        creadoPor: 'user-1',
      })

      expect(supabase.rpc).toHaveBeenCalledWith('justificar_alumno_por_dia', {
        p_alumno_id: 'alu-1',
        p_fecha: '2026-10-03',
        p_motivo: 'Cita médica',
        p_creado_por: 'user-1',
      })

      expect(resultado).toEqual({
        success: true,
        message: 'Ausencia justificada',
        asistenciasActualizadas: 2,
        clasesAfectadas: ['clase-1', 'clase-2'],
      })
    })

    it('maps RPC OUT params correctly (single object response)', async () => {
      supabase.rpc.mockResolvedValue({
        data: {
          success: true,
          message: 'OK',
          asistencias_updated: 1,
          affected_clases_ids: ['clase-5'],
        },
        error: null,
      })

      const resultado = await justificarAusenciaDia({
        alumnoId: 'alu-2',
        fecha: '2026-10-02',
        motivo: 'Enfermedad',
        creadoPor: 'user-2',
      })

      expect(resultado.asistenciasActualizadas).toBe(1)
      expect(resultado.clasesAfectadas).toEqual(['clase-5'])
    })

    it('handles array response (alternate Supabase client versions)', async () => {
      supabase.rpc.mockResolvedValue({
        data: [
          {
            success: true,
            message: 'Justificado',
            asistencias_updated: 3,
            affected_clases_ids: ['clase-1', 'clase-2', 'clase-3'],
          },
        ],
        error: null,
      })

      const resultado = await justificarAusenciaDia({
        alumnoId: 'alu-3',
        fecha: '2026-10-01',
        motivo: 'Viaje familiar',
        creadoPor: 'user-3',
      })

      expect(resultado.asistenciasActualizadas).toBe(3)
      expect(resultado.clasesAfectadas).toHaveLength(3)
    })

    it('throws on RPC error', async () => {
      supabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC error: fecha inválida' },
      })

      await expect(
        justificarAusenciaDia({
          alumnoId: 'alu-1',
          fecha: 'invalid',
          motivo: 'Test',
          creadoPor: 'user-1',
        })
      ).rejects.toThrow('RPC error: fecha inválida')
    })
  })

  // ========== Task 4: Instrument filter ==========

  describe('Task 4: Instrument filter on fetchSeguimientoAusentes', () => {
    function createFetchMock() {
      const chainable = {
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: [{ alumno_id: 'alu-1', instrumento_principal: 'Piano' }],
          count: 1,
          error: null,
        }),
      }
      return chainable
    }

    it('includes .eq("instrumento_principal", instrumento) when instrumento is provided', async () => {
      const chainable = createFetchMock()
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(chainable),
      })

      await fetchSeguimientoAusentes({
        nivel: null,
        maestroId: null,
        instrumento: 'Piano',
        limit: 50,
        offset: 0,
      })

      // Verify .eq was called with instrumento_principal filter
      const eqCalls = chainable.eq.mock.calls
      const instrumentoCall = eqCalls.find((c) => c[0] === 'instrumento_principal')
      expect(instrumentoCall).toBeDefined()
      expect(instrumentoCall[1]).toBe('Piano')
    })

    it('does not include instrumento filter when instrumento is null', async () => {
      const chainable = createFetchMock()
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(chainable),
      })

      await fetchSeguimientoAusentes({
        nivel: null,
        maestroId: null,
        instrumento: null,
        limit: 50,
        offset: 0,
      })

      // Verify .eq was NOT called with instrumento_principal
      const eqCalls = chainable.eq.mock.calls
      const instrumentoCall = eqCalls.find((c) => c[0] === 'instrumento_principal')
      expect(instrumentoCall).toBeUndefined()
    })
  })
})
