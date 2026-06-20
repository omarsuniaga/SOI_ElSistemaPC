import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as api from '../progresosApi.js'
import * as asistenciasRepo from '../../repositories/asistenciasRepo.js'
import * as progresosRepo from '../../repositories/progresosRepo.js'
import * as indicatorAttemptsRepo from '../../repositories/indicatorAttemptsRepo.js'
import * as observacionesRepo from '../../repositories/observacionesRepo.js'

// Mock all repositories
vi.mock('../../repositories/asistenciasRepo.js')
vi.mock('../../repositories/progresosRepo.js')
vi.mock('../../repositories/indicatorAttemptsRepo.js')
vi.mock('../../repositories/observacionesRepo.js')

describe('progresosApi.history', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProgressHistory(options)', () => {
    it('should return Map with ProgressHistory for each alumnoId', async () => {
      asistenciasRepo.fetchBulk.mockResolvedValue([])
      progresosRepo.fetchBulk.mockResolvedValue([
        { alumno_id: 'alum-001', calificacion: 8.0, fecha_evaluacion: '2026-05-05', evaluacion_id: 'eval-1' },
      ])
      indicatorAttemptsRepo.fetchBulk.mockResolvedValue([])
      observacionesRepo.fetchBulk.mockResolvedValue([])

      const result = await api.getProgressHistory({
        alumnoIds: ['alum-001', 'alum-002'],
        from: '2026-05-01',
        to: '2026-05-18',
      })

      expect(result).toBeInstanceOf(Map)
      expect(result.has('alum-001')).toBe(true)
      expect(result.has('alum-002')).toBe(true)

      const hist1 = result.get('alum-001')
      expect(hist1.alumnoId).toBe('alum-001')
      expect(hist1.granularity).toBe('week') // default
      expect(Array.isArray(hist1.buckets)).toBe(true)
    })

    it('should default granularity to week', async () => {
      asistenciasRepo.fetchBulk.mockResolvedValue([])
      progresosRepo.fetchBulk.mockResolvedValue([])
      indicatorAttemptsRepo.fetchBulk.mockResolvedValue([])
      observacionesRepo.fetchBulk.mockResolvedValue([])

      const result = await api.getProgressHistory({
        alumnoIds: ['alum-001'],
        from: '2026-05-01',
        to: '2026-05-18',
      })

      const hist = result.get('alum-001')
      expect(hist.granularity).toBe('week')
    })

    it('should accept custom granularity (month)', async () => {
      asistenciasRepo.fetchBulk.mockResolvedValue([])
      progresosRepo.fetchBulk.mockResolvedValue([])
      indicatorAttemptsRepo.fetchBulk.mockResolvedValue([])
      observacionesRepo.fetchBulk.mockResolvedValue([])

      const result = await api.getProgressHistory({
        alumnoIds: ['alum-001'],
        from: '2026-05-01',
        to: '2026-07-31',
        granularity: 'month',
      })

      const hist = result.get('alum-001')
      expect(hist.granularity).toBe('month')
    })

    it('should call each repo exactly once regardless of alumnoIds count', async () => {
      asistenciasRepo.fetchBulk.mockResolvedValue([])
      progresosRepo.fetchBulk.mockResolvedValue([])
      indicatorAttemptsRepo.fetchBulk.mockResolvedValue([])
      observacionesRepo.fetchBulk.mockResolvedValue([])

      await api.getProgressHistory({
        alumnoIds: ['alum-001', 'alum-002', 'alum-003'],
        from: '2026-05-01',
        to: '2026-05-18',
      })

      expect(asistenciasRepo.fetchBulk).toHaveBeenCalledTimes(1)
      expect(progresosRepo.fetchBulk).toHaveBeenCalledTimes(1)
      expect(indicatorAttemptsRepo.fetchBulk).toHaveBeenCalledTimes(1)
      expect(observacionesRepo.fetchBulk).toHaveBeenCalledTimes(1)
    })

    it('should pass from/to date range to all repos', async () => {
      asistenciasRepo.fetchBulk.mockResolvedValue([])
      progresosRepo.fetchBulk.mockResolvedValue([])
      indicatorAttemptsRepo.fetchBulk.mockResolvedValue([])
      observacionesRepo.fetchBulk.mockResolvedValue([])

      await api.getProgressHistory({
        alumnoIds: ['alum-001'],
        from: '2026-05-01',
        to: '2026-05-18',
      })

      // Each repo should receive the same date range
      expect(asistenciasRepo.fetchBulk).toHaveBeenCalledWith(
        expect.objectContaining({ from: '2026-05-01', to: '2026-05-18' })
      )
      expect(progresosRepo.fetchBulk).toHaveBeenCalledWith(
        expect.objectContaining({ from: '2026-05-01', to: '2026-05-18' })
      )
      expect(indicatorAttemptsRepo.fetchBulk).toHaveBeenCalledWith(
        expect.objectContaining({ from: '2026-05-01', to: '2026-05-18' })
      )
      expect(observacionesRepo.fetchBulk).toHaveBeenCalledWith(
        expect.objectContaining({ from: '2026-05-01', to: '2026-05-18' })
      )
    })
  })
})
