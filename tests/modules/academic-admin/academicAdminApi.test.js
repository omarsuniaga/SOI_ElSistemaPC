import { describe, it, expect, vi, beforeEach } from 'vitest'
import '../../portal-maestros/setup.js'

// Mock de Supabase
const { mockSupabase } = vi.hoisted(() => {
  const mock = {
    from: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
  }
  Object.values(mock).forEach(m => m.mockReturnValue(mock))
  return { mockSupabase: mock }
})

vi.mock('../../../src/lib/supabaseClient.js', () => ({
  supabase: mockSupabase
}))

import { 
  getInstitutionalRadar, 
  getNodeHotspots, 
  getStagnantStudents 
} from '../../../src/modules/academic-admin/api/academicAdminApi.js'
import { supabase } from '../../../src/lib/supabaseClient.js'

describe('academicAdminApi - Analytics Methods', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Asegurar que el mock siempre retorne sí mismo para permitir encadenamiento (chaining)
    Object.values(mockSupabase).forEach(m => m.mockReturnValue(mockSupabase))
  })

  describe('getInstitutionalRadar', () => {
    it('debe consultar la vista view_institutional_radar y ordenar por inactividad', async () => {
      const mockData = [{ student_name: 'Alumno 1', days_inactive: 10 }]
      supabase.from().select().order.mockResolvedValueOnce({ data: mockData, error: null })

      const result = await getInstitutionalRadar()

      expect(supabase.from).toHaveBeenCalledWith('view_institutional_radar')
      expect(supabase.order).toHaveBeenCalledWith('days_inactive', { ascending: false })
      expect(result).toEqual(mockData)
    })

    it('debe lanzar un error si Supabase falla', async () => {
      supabase.from().select().order.mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'DB Error' } 
      })

      await expect(getInstitutionalRadar()).rejects.toThrow('No se pudo cargar el radar institucional')
    })
  })

  describe('getNodeHotspots', () => {
    it('debe consultar view_node_difficulty y ordenar por porcentaje de falla', async () => {
      const mockData = [{ node_name: 'Nodo Difícil', failure_percentage: 80 }]
      supabase.from().select().order.mockResolvedValueOnce({ data: mockData, error: null })

      const result = await getNodeHotspots()

      expect(supabase.from).toHaveBeenCalledWith('view_node_difficulty')
      expect(supabase.order).toHaveBeenCalledWith('failure_percentage', { ascending: false })
      expect(result).toEqual(mockData)
    })
  })

  describe('getStagnantStudents', () => {
    it('debe filtrar view_institutional_radar por health_status stagnant', async () => {
      const mockData = [{ student_name: 'Alumno Estancado', health_status: 'stagnant' }]
      supabase.from().select().eq().order.mockResolvedValueOnce({ data: mockData, error: null })

      const result = await getStagnantStudents()

      expect(supabase.from).toHaveBeenCalledWith('view_institutional_radar')
      expect(supabase.eq).toHaveBeenCalledWith('health_status', 'stagnant')
      expect(result).toEqual(mockData)
    })
  })
})
