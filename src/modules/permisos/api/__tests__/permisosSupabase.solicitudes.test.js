import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  crearSolicitud,
  obtenerSolicitudPorMaestro,
  obtenerSolicitudesPendientes,
  aprobarSolicitud,
  rechazarSolicitud,
} from '../permisosSupabase.js'
import { supabase } from '../../../../lib/supabaseClient.js'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('permisosSupabase - Solicitudes', () => {
  const mockMaestroId = '123e4567-e89b-12d3-a456-426614174000'
  const mockAdminId = 'admin-id-12345'
  const mockSolicitudId = 'solicitud-id-67890'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('crearSolicitud', () => {
    it('should create a new solicitud for maestro', async () => {
      const mockSolicitud = {
        id: mockSolicitudId,
        maestro_id: mockMaestroId,
        solicita_alumnos: true,
        solicita_clases: false,
        estado: 'pendiente',
        creado_en: new Date().toISOString(),
        maestros: {
          nombre_completo: 'Prof. García',
          correo: 'garcia@example.com',
        },
      }

      // First call to from() - checking for existing pending solicitud
      const checkChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }

      // Second call to from() - creating new solicitud
      const createChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockSolicitud, error: null }),
      }

      supabase.from.mockReturnValueOnce(checkChain).mockReturnValueOnce(createChain)

      const result = await crearSolicitud(mockMaestroId, true, false)

      expect(result.maestro_id).toBe(mockMaestroId)
      expect(result.solicita_alumnos).toBe(true)
      expect(result.solicita_clases).toBe(false)
      expect(result.estado).toBe('pendiente')
      expect(result.maestro_nombre).toBe('Prof. García')
    })

    it('should throw error if maestro already has pending solicitud', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { id: 'existing-id', estado: 'pendiente' },
          error: null,
        }),
      }

      supabase.from.mockReturnValue(mockChain)

      await expect(crearSolicitud(mockMaestroId, true, false)).rejects.toThrow(
        'Ya existe una solicitud pendiente para este maestro'
      )
    })

    it('should throw error if maestroId is missing', async () => {
      await expect(crearSolicitud(null, true, false)).rejects.toThrow(
        'maestroId es requerido'
      )
    })
  })

  describe('obtenerSolicitudPorMaestro', () => {
    it('should fetch solicitud for maestro', async () => {
      const mockSolicitud = {
        id: mockSolicitudId,
        maestro_id: mockMaestroId,
        solicita_alumnos: true,
        solicita_clases: true,
        estado: 'pendiente',
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString(),
        maestros: {
          nombre_completo: 'Prof. García',
          correo: 'garcia@example.com',
        },
      }

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockSolicitud, error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await obtenerSolicitudPorMaestro(mockMaestroId)

      expect(result.id).toBe(mockSolicitudId)
      expect(result.estado).toBe('pendiente')
    })

    it('should return null if no solicitud exists', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await obtenerSolicitudPorMaestro(mockMaestroId)

      expect(result).toBeNull()
    })
  })

  describe('obtenerSolicitudesPendientes', () => {
    it('should fetch all pending solicitudes', async () => {
      const mockSolicitudes = [
        {
          id: 'sol-1',
          maestro_id: mockMaestroId,
          solicita_alumnos: true,
          solicita_clases: false,
          estado: 'pendiente',
          creado_en: new Date().toISOString(),
          maestros: { nombre_completo: 'Prof. García', correo: 'garcia@example.com' },
        },
        {
          id: 'sol-2',
          maestro_id: 'otro-maestro-id',
          solicita_alumnos: false,
          solicita_clases: true,
          estado: 'pendiente',
          creado_en: new Date().toISOString(),
          maestros: { nombre_completo: 'Prof. López', correo: 'lopez@example.com' },
        },
      ]

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockSolicitudes, error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await obtenerSolicitudesPendientes()

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(2)
      expect(result[0].maestro_nombre).toBe('Prof. García')
      expect(result[1].maestro_nombre).toBe('Prof. López')
    })
  })

  describe('aprobarSolicitud', () => {
    it('should approve solicitud and update permissions', async () => {
      const mockApprovedSolicitud = {
        id: mockSolicitudId,
        maestro_id: mockMaestroId,
        solicita_alumnos: true,
        solicita_clases: true,
        estado: 'aprobado',
        aprobado_en: new Date().toISOString(),
        aprobado_por: mockAdminId,
        maestros: { nombre_completo: 'Prof. García', correo: 'garcia@example.com' },
      }

      const approveChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockApprovedSolicitud, error: null }),
      }

      // obtenerPermisoPorMaestro call inside aprobarSolicitud
      const getPermisoChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: {
            puede_registrar_alumnos: false,
            puede_inscribir_clases: false,
            permisos: [],
            solicitudes: [],
          },
          error: null,
        }),
      }

      // actualizarPermiso reads current row before upsert
      const readCurrentChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: {
            puede_registrar_alumnos: false,
            puede_inscribir_clases: false,
            permisos: [],
            solicitudes: [],
          },
          error: null,
        }),
      }

      const updateChain = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            maestro_id: mockMaestroId,
            puede_registrar_alumnos: true,
            puede_inscribir_clases: true,
            permisos: ['registrar_alumnos', 'inscribir_clases'],
          },
          error: null,
        }),
      }

      supabase.from
        .mockReturnValueOnce(approveChain)      // solicitudes_permisos update
        .mockReturnValueOnce(getPermisoChain)   // obtenerPermisoPorMaestro
        .mockReturnValueOnce(readCurrentChain)  // actualizarPermiso read
        .mockReturnValueOnce(updateChain)       // actualizarPermiso upsert

      const result = await aprobarSolicitud(mockSolicitudId, mockAdminId)

      expect(result.estado).toBe('aprobado')
      expect(result.aprobado_por).toBe(mockAdminId)
    })

    it('should throw error if solicitudId or adminId missing', async () => {
      await expect(aprobarSolicitud(null, mockAdminId)).rejects.toThrow(
        'solicitudId y adminId son requeridos'
      )

      await expect(aprobarSolicitud(mockSolicitudId, null)).rejects.toThrow(
        'solicitudId y adminId son requeridos'
      )
    })
  })

  describe('rechazarSolicitud', () => {
    it('should reject solicitud with motivo', async () => {
      const motivo = 'No se aprueban permisos de alumno en este momento'
      const mockRejectedSolicitud = {
        id: mockSolicitudId,
        maestro_id: mockMaestroId,
        solicita_alumnos: true,
        solicita_clases: false,
        estado: 'rechazado',
        aprobado_en: new Date().toISOString(),
        aprobado_por: mockAdminId,
        motivo_rechazo: motivo,
        maestros: { nombre_completo: 'Prof. García', correo: 'garcia@example.com' },
      }

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockRejectedSolicitud, error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await rechazarSolicitud(mockSolicitudId, mockAdminId, motivo)

      expect(result.estado).toBe('rechazado')
      expect(result.motivo_rechazo).toBe(motivo)
    })
  })
})
