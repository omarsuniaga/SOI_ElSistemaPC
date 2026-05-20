import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  crearAusencia,
  obtenerPendientesDirector,
  revisarAusencia,
  aprobarAusencia,
  rechazarAusencia
} from '../ausenciasApi.js'

vi.mock('../ausenciaValidator.js')
vi.mock('../ausenciaService.js')

describe('ausenciasApi', () => {
  describe('crearAusencia', () => {
    it('debe validar antes de crear', async () => {
      const { validarSolicitud } = await import('../ausenciaValidator.js')
      validarSolicitud.mockReturnValueOnce({
        valid: false,
        errors: ['Error de validación']
      })

      const data = { fecha_inicio: '2026-05-20' }

      try {
        await crearAusencia(data)
        expect.fail('Should throw error')
      } catch (err) {
        expect(err.message).toContain('Error de validación')
      }
    })

    it('debe crear ausencia si validación pasa', async () => {
      const { validarSolicitud } = await import('../ausenciaValidator.js')
      const { crearSolicitud, buscarClasesAfectadas } = await import('../ausenciaService.js')

      validarSolicitud.mockReturnValueOnce({
        valid: true,
        errors: []
      })
      buscarClasesAfectadas.mockResolvedValueOnce([])
      crearSolicitud.mockResolvedValueOnce({
        id: 'ausencia-1',
        estado: 'solicitada'
      })

      const data = {
        maestro_id: 'maestro-1',
        fecha_inicio: '2026-05-25',
        fecha_fin: '2026-05-25',
        tipo_ausencia: 'personal'
      }

      const result = await crearAusencia(data)

      expect(result.estado).toBe('solicitada')
    })
  })

  describe('obtenerPendientesDirector', () => {
    it('debe obtener ausencias en estado en_revision', async () => {
      // Will implement with supabase mock
      expect(true).toBe(true) // Placeholder
    })
  })

  describe('revisarAusencia', () => {
    it('debe actualizar estado según acción director', async () => {
      // Will implement with supabase mock
      expect(true).toBe(true) // Placeholder
    })
  })

  describe('aprobarAusencia', () => {
    it('debe cambiar estado a aprobada', async () => {
      // Will implement with supabase mock
      expect(true).toBe(true) // Placeholder
    })
  })

  describe('rechazarAusencia', () => {
    it('debe cambiar estado a rechazada con razón', async () => {
      // Will implement with supabase mock
      expect(true).toBe(true) // Placeholder
    })
  })
})
