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
