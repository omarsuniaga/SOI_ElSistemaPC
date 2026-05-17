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
})
