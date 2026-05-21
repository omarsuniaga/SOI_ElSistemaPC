import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as ausenciasApi from '../ausenciasApi.js'
import * as supabaseModule from '../../../lib/supabaseClient.js'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('ausenciasApi - new functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('obtenerClasesMaestro', () => {
    it('should fetch classes for a maestro', async () => {
      const mockClases = [
        { id: 'clase-1', nombre: 'Violín A', instrumento: 'Violín', maestro_id: 'maestro-1' }
      ]

      const mockChain = {
        select: vi.fn(function() { return this }),
        eq: vi.fn().mockResolvedValue({ data: mockClases, error: null })
      }

      supabaseModule.supabase.from.mockReturnValue(mockChain)
      const result = await ausenciasApi.obtenerClasesMaestro('maestro-1')

      expect(result).toEqual(mockClases)
    })
  })

  describe('obtenerSesionesRango', () => {
    it('should fetch sessions in date range', async () => {
      const mockSesiones = [
        { id: 'ses-1', clase_id: 'clase-1', fecha: '2026-05-21', hora_inicio: '10:00', hora_fin: '11:00' }
      ]

      const mockChain = {
        select: vi.fn(function() { return this }),
        in: vi.fn(function() { return this }),
        gte: vi.fn(function() { return this }),
        lte: vi.fn(function() { return this }),
        order: vi.fn().mockResolvedValue({ data: mockSesiones, error: null })
      }

      supabaseModule.supabase.from.mockReturnValue(mockChain)
      const result = await ausenciasApi.obtenerSesionesRango(['clase-1'], '2026-05-21', '2026-05-23')

      expect(result).toEqual(mockSesiones)
    })

    it('should return empty array if no claseIds', async () => {
      const result = await ausenciasApi.obtenerSesionesRango([], '2026-05-21', '2026-05-23')
      expect(result).toEqual([])
    })
  })

  describe('registrarAusencia', () => {
    it('should register an absence request', async () => {
      const mockAusencia = {
        id: 'ausencia-1',
        maestro_id: 'maestro-1',
        tipo_ausencia: 'enfermedad',
        estado: 'pendiente'
      }

      const mockChain = {
        insert: vi.fn(function() { return this }),
        select: vi.fn(function() { return this }),
        single: vi.fn().mockResolvedValue({ data: mockAusencia, error: null })
      }

      supabaseModule.supabase.from.mockReturnValue(mockChain)
      
      const payload = {
        maestro_id: 'maestro-1',
        tipo_ausencia: 'enfermedad',
        fecha_inicio: '2026-05-21',
        fecha_fin: '2026-05-23',
        motivo: 'Enfermedad',
        urgencia: 'alta',
        duracion_tipo: 'varios_dias',
        clases_afectadas: ['clase-1'],
        actividades_por_clase: {},
        clase_emergente: null,
        archivo_url: null,
        estado: 'pendiente'
      }

      const result = await ausenciasApi.registrarAusencia(payload)
      expect(result).toEqual(mockAusencia)
    })
  })

  describe('crearNotificacionAusencia', () => {
    it('should create absence notification', async () => {
      const mockNotification = {
        id: 'notif-1',
        profile_id: null,
        tipo: 'sistema',
        titulo: 'Nueva Solicitud de Ausencia'
      }

      const mockChain = {
        insert: vi.fn(function() { return this }),
        select: vi.fn(function() { return this }),
        single: vi.fn().mockResolvedValue({ data: mockNotification, error: null })
      }

      supabaseModule.supabase.from.mockReturnValue(mockChain)

      const result = await ausenciasApi.crearNotificacionAusencia({
        ausencia: {
          id: 'ausencia-1',
          fecha_inicio: '2026-05-21',
          fecha_fin: '2026-05-23',
          tipo_ausencia: 'enfermedad'
        },
        maestro: {
          nombre_completo: 'Juan Pérez',
          nombre: 'Juan'
        },
        approvalUrl: '/ausencias/ausencia-1'
      })

      expect(result).toEqual(mockNotification)
    })

    it('should return null if ausencia is missing', async () => {
      const result = await ausenciasApi.crearNotificacionAusencia({
        ausencia: null,
        maestro: { nombre_completo: 'Juan' },
        approvalUrl: ''
      })

      expect(result).toBeNull()
    })
  })
})
