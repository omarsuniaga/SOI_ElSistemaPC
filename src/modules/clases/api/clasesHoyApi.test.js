import { beforeEach, describe, expect, it, vi } from 'vitest'
import { supabase } from '../../../lib/supabaseClient.js'
import { config } from '../../../core/config/config.js'
import { obtenerClasesDelDia, justificarAusencia, isDemoModeActive } from './clasesHoyApi.js'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
  },
}))

vi.mock('../../asistencias/api/asistenciasApi.js', () => ({
  obtenerAsistenciasPorClasesFecha: vi.fn(),
}))

describe('clasesHoyApi DataAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    config.isDemoMode = false
  })

  describe('isDemoModeActive', () => {
    it('returns true when config.isDemoMode is true', () => {
      config.isDemoMode = true
      expect(isDemoModeActive()).toBe(true)
    })

    it('returns true when localStorage demo_mode is true', () => {
      localStorage.setItem('demo_mode', 'true')
      expect(isDemoModeActive()).toBe(true)
    })

    it('returns false when neither is set and supabase exists', () => {
      expect(isDemoModeActive()).toBe(false)
    })
  })

  describe('obtenerClasesDelDia (Demo Mode & Fallback)', () => {
    it('returns complete day structure from local mocks in Demo Mode', async () => {
      config.isDemoMode = true

      const result = await obtenerClasesDelDia('lunes')

      expect(result).toHaveProperty('dia', 'lunes')
      expect(result).toHaveProperty('fecha')
      expect(result).toHaveProperty('esHoy')
      expect(Array.isArray(result.sesiones)).toBe(true)
      expect(result.sesiones.length).toBeGreaterThan(0)

      const primeraSesion = result.sesiones[0]
      expect(primeraSesion).toHaveProperty('horarioId')
      expect(primeraSesion).toHaveProperty('nombre')
      expect(primeraSesion).toHaveProperty('salon')
      expect(primeraSesion).toHaveProperty('maestroTitular')
      expect(Array.isArray(primeraSesion.alumnos)).toBe(true)

      expect(result.kpis).toMatchObject({
        totalClases: result.sesiones.length,
        totalAlumnos: expect.any(Number),
        salonesOcupados: expect.any(Number),
      })
      expect(supabase.from).not.toHaveBeenCalled()
    })

    it('handles accented and unaccented day names identically', async () => {
      config.isDemoMode = true

      const resConAcento = await obtenerClasesDelDia('miércoles')
      const resSinAcento = await obtenerClasesDelDia('miercoles')

      expect(resConAcento.sesiones.length).toBe(resSinAcento.sesiones.length)
      expect(resConAcento.sesiones.map((s) => s.claseId)).toEqual(
        resSinAcento.sesiones.map((s) => s.claseId),
      )
    })

    it('gracefully falls back to mock DataAdapter if Supabase throws a network error', async () => {
      config.isDemoMode = false
      supabase.from.mockImplementation(() => {
        throw new TypeError('Failed to fetch')
      })

      const result = await obtenerClasesDelDia('lunes')

      expect(result).toHaveProperty('dia', 'lunes')
      expect(Array.isArray(result.sesiones)).toBe(true)
      expect(result.sesiones.length).toBeGreaterThan(0)
      expect(result.kpis.totalClases).toBe(result.sesiones.length)
    })
  })

  describe('justificarAusencia', () => {
    it('delegates session resolution and attendance persistence to one RPC when not in demo', async () => {
      supabase.rpc.mockResolvedValue({ data: 'attendance-id', error: null })

      await expect(
        justificarAusencia({
          claseId: 'class-id',
          alumnoId: 'student-id',
          fecha: '2026-08-18',
          motivo: 'Cita médica',
        }),
      ).resolves.toBe('attendance-id')

      expect(supabase.rpc).toHaveBeenCalledWith('registrar_justificacion_asistencia', {
        p_clase_id: 'class-id',
        p_alumno_id: 'student-id',
        p_fecha: '2026-08-18',
        p_motivo: 'Cita médica',
      })
    })

    it('surfaces a failed atomic operation', async () => {
      supabase.rpc.mockResolvedValue({ data: null, error: { message: 'permission denied' } })

      await expect(
        justificarAusencia({
          claseId: 'class-id',
          alumnoId: 'student-id',
          fecha: '2026-08-18',
        }),
      ).rejects.toThrow('No se pudo justificar la ausencia: permission denied')
    })

    it('persists justification in localStorage and returns success in Demo Mode', async () => {
      config.isDemoMode = true

      const result = await justificarAusencia({
        claseId: 'clase_001',
        alumnoId: 'alumno_10',
        fecha: '2026-09-11',
        motivo: 'Fiebre',
      })

      expect(result).toHaveProperty('success', true)
      expect(supabase.rpc).not.toHaveBeenCalled()

      const raw = localStorage.getItem('justificaciones_demo')
      expect(raw).toBeTruthy()
      const stored = JSON.parse(raw)
      expect(stored['clase_001_alumno_10_2026-09-11']).toMatchObject({
        motivo: 'Fiebre',
      })
    })

    it('falls back to mock persistence when RPC throws a network error', async () => {
      config.isDemoMode = false
      supabase.rpc.mockRejectedValue(new TypeError('Failed to fetch'))

      const result = await justificarAusencia({
        claseId: 'clase_002',
        alumnoId: 'alumno_20',
        fecha: '2026-09-11',
        motivo: 'Viaje familiar',
      })

      expect(result).toHaveProperty('success', true)
      const raw = localStorage.getItem('justificaciones_demo')
      const stored = JSON.parse(raw)
      expect(stored['clase_002_alumno_20_2026-09-11']).toMatchObject({
        motivo: 'Viaje familiar',
      })
    })
  })
})
