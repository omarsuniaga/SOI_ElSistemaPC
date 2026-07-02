import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as metricsApi from '../api/metricsApi.js'
import { supabase } from '../../../lib/supabaseClient.js'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('metricsApi Standardization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getResumenAlertas', () => {
    it('should calculate counts from active alerts view', async () => {
      const mockAlerts = [
        { color: 'rojo', tipo_alerta: 'ausencia' },
        { color: 'rojo', tipo_alerta: 'nota_baja' },
        { color: 'naranja', tipo_alerta: 'ausencia' }
      ]

      supabase.from.mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockAlerts, error: null })
      })

      const resumen = await metricsApi.getResumenAlertas()
      expect(resumen.total).toBe(3)
      expect(resumen.rojas).toBe(2)
      expect(resumen.naranjas).toBe(1)
      expect(resumen.porTipo.ausencia).toBe(2)
    })

    it('should handle API errors gracefully', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } })
      })

      await expect(metricsApi.getResumenAlertas()).rejects.toThrow('No se pudo obtener el resumen de alertas')
    })
  })

  describe('getCierresAcademicos', () => {
    it('should load historical closure entries', async () => {
      const mockRows = [
        {
          id: '1',
          periodo_id: 'periodo-1',
          fecha_inicio: '2026-01-01',
          fecha_fin: '2026-06-30',
          resumen: { totalClases: 10 },
          periodos: { nombre: 'Semestre 1', activo: false, cerrado: true },
        },
      ]

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockRows, error: null }),
      })

      const rows = await metricsApi.getCierresAcademicos({ limit: 5 })
      expect(rows).toHaveLength(1)
      expect(rows[0].periodos.nombre).toBe('Semestre 1')
    })
  })
})
