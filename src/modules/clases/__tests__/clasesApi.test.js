import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as clasesApi from '../api/clasesApi.js'
import { supabase } from '../../../lib/supabaseClient.js'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('clasesApi Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('obtenerAlumnosInscritosPorClases', () => {
    it('should fetch enrollments in one bulk query and group them by class', async () => {
      const order = vi.fn().mockResolvedValue({
        data: [
          { id: 'ins-1', clase_id: 'clase-1', alumno: { nombre_completo: 'Ana' } },
          { id: 'ins-2', clase_id: 'clase-2', alumno: { nombre_completo: 'Luis' } },
          { id: 'ins-3', clase_id: 'clase-1', alumno: { nombre_completo: 'María' } },
        ],
        error: null,
      })
      const eq = vi.fn().mockReturnValue({ order })
      const inMock = vi.fn().mockReturnValue({ eq })
      const select = vi.fn().mockReturnValue({ in: inMock })

      supabase.from.mockReturnValue({ select })

      const result = await clasesApi.obtenerAlumnosInscritosPorClases([
        'clase-1',
        'clase-2',
        'clase-1',
      ])

      expect(supabase.from).toHaveBeenCalledTimes(1)
      expect(supabase.from).toHaveBeenCalledWith('alumnos_clases')
      expect(select).toHaveBeenCalledWith('*, alumno:alumnos(*)')
      expect(inMock).toHaveBeenCalledWith('clase_id', ['clase-1', 'clase-2'])
      expect(eq).toHaveBeenCalledWith('activo', true)
      expect(order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result['clase-1']).toHaveLength(2)
      expect(result['clase-2']).toHaveLength(1)
    })

    it('should skip the query when no class ids are provided', async () => {
      await expect(clasesApi.obtenerAlumnosInscritosPorClases([])).resolves.toEqual({})
      expect(supabase.from).not.toHaveBeenCalled()
    })
  })

  describe('validarHorario', () => {
    it('should return conflicts if salon is occupied', async () => {
      const mockSchedules = [
        { 
          dia: 'lunes', 
          hora_inicio: '08:00', 
          hora_fin: '10:00', 
          salon_id: 's1',
          clases: { nombre: 'Clase Existente', maestro_principal_id: 'm2' }
        }
      ]

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockSchedules, error: null })
      })

      const inputs = [{ dia: 'lunes', hora_inicio: '09:00', hora_fin: '11:00', salon_id: 's1' }]
      const conflictos = await clasesApi.validarHorario(inputs, 'm1')

      expect(conflictos.length).toBe(1)
      expect(conflictos[0].tipo).toBe('salón')
      expect(conflictos[0].detalle).toContain('Clase Existente')
    })

    it('should NOT return conflicts if classes are adjacent in time', async () => {
      const mockSchedules = [
        { 
          dia: 'lunes', 
          hora_inicio: '16:00:00', 
          hora_fin: '17:00:00', 
          salon_id: 's1',
          clases: { nombre: 'Clase Existente', maestro_principal_id: 'm2' }
        }
      ]

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockSchedules, error: null })
      })

      const inputs = [{ dia: 'lunes', hora_inicio: '17:00', hora_fin: '18:00', salon_id: 's1' }]
      const conflictos = await clasesApi.validarHorario(inputs, 'm1')

      expect(conflictos.length).toBe(0)
    })

    it('should NOT return conflicts if classes are adjacent in time with varying string formats', async () => {
      const mockSchedules = [
        { 
          dia: 'lunes', 
          hora_inicio: '16:00:00.000', 
          hora_fin: '17:00:00', 
          salon_id: 's1',
          clases: { nombre: 'Clase Existente', maestro_principal_id: 'm2' }
        }
      ]

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockSchedules, error: null })
      })

      const inputs = [{ dia: 'lunes', hora_inicio: '5:00 PM', hora_fin: '18:00', salon_id: 's1' }]
      const conflictos = await clasesApi.validarHorario(inputs, 'm1')

      expect(conflictos.length).toBe(0)
    })

    it('should return conflicts if classes overlap by even a single minute', async () => {
      const mockSchedules = [
        { 
          dia: 'lunes', 
          hora_inicio: '16:00:00', 
          hora_fin: '17:01:00', 
          salon_id: 's1',
          clases: { nombre: 'Clase Existente', maestro_principal_id: 'm2' }
        }
      ]

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockSchedules, error: null })
      })

      const inputs = [{ dia: 'lunes', hora_inicio: '17:00', hora_fin: '18:00', salon_id: 's1' }]
      const conflictos = await clasesApi.validarHorario(inputs, 'm1')

      expect(conflictos.length).toBe(1)
      expect(conflictos[0].tipo).toBe('salón')
    })


    it('should return conflicts if maestro is occupied', async () => {
      const mockSchedules = [
        { 
          dia: 'martes', 
          hora_inicio: '14:00', 
          hora_fin: '16:00', 
          salon_id: 's2',
          clases: { id: 'c1', nombre: 'Clase del Maestro', maestro_principal_id: 'm1' }
        }
      ]

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockSchedules, error: null })
      })

      const inputs = [{ dia: 'martes', hora_inicio: '15:00', hora_fin: '17:00', salon_id: 's3' }]
      const conflictos = await clasesApi.validarHorario(inputs, 'm1')

      expect(conflictos.length).toBe(1)
      expect(conflictos[0].tipo).toBe('maestro')
    })
  })
})
