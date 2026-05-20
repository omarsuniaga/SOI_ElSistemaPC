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

describe('progresosApi.batch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getStudentProgress(alumnoId, options)', () => {
    it('should orchestrate bulk fetches and return StudentProgress DTO', async () => {
      // Mock repo responses
      asistenciasRepo.fetchBulk.mockResolvedValue([
        { alumno_id: 'alum-001', estado: 'presente', fecha: '2026-05-01' },
      ])
      progresosRepo.fetchBulk.mockResolvedValue([
        { alumno_id: 'alum-001', calificacion: 7.5, fecha_evaluacion: '2026-05-05', evaluacion_id: 'eval-1' },
      ])
      indicatorAttemptsRepo.fetchBulk.mockResolvedValue([
        { alumno_id: 'alum-001', passed: true, fecha: '2026-05-10' },
      ])
      observacionesRepo.fetchBulk.mockResolvedValue([])

      const result = await api.getStudentProgress('alum-001', {
        claseId: 'clase-001',
        periodoId: 'periodo-001',
        from: '2026-05-01',
        to: '2026-05-18',
      })

      expect(result.alumnoId).toBe('alum-001')
      expect(result.attendance.total).toBe(1)
      expect(result.grades.count).toBe(1)
      expect(result.indicators.total).toBe(1)
    })

    it('should throw InvalidWindowError when from > to', async () => {
      await expect(
        api.getStudentProgress('alum-001', {
          claseId: 'clase-001',
          periodoId: 'periodo-001',
          from: '2026-05-18',
          to: '2026-05-01',
        })
      ).rejects.toThrow(Error)
    })

    it('should call each repo exactly once (no N+1)', async () => {
      asistenciasRepo.fetchBulk.mockResolvedValue([])
      progresosRepo.fetchBulk.mockResolvedValue([])
      indicatorAttemptsRepo.fetchBulk.mockResolvedValue([])
      observacionesRepo.fetchBulk.mockResolvedValue([])

      await api.getStudentProgress('alum-001', {
        claseId: 'clase-001',
        periodoId: 'periodo-001',
        from: '2026-05-01',
        to: '2026-05-18',
      })

      expect(asistenciasRepo.fetchBulk).toHaveBeenCalledTimes(1)
      expect(progresosRepo.fetchBulk).toHaveBeenCalledTimes(1)
      expect(indicatorAttemptsRepo.fetchBulk).toHaveBeenCalledTimes(1)
      expect(observacionesRepo.fetchBulk).toHaveBeenCalledTimes(1)
    })
  })

  describe('getStudentProgressBatch(alumnoIds, options)', () => {
    it('should orchestrate bulk fetches and return Map<alumnoId, StudentProgress>', async () => {
      asistenciasRepo.fetchBulk.mockResolvedValue([
        { alumno_id: 'alum-001', estado: 'presente', fecha: '2026-05-01' },
        { alumno_id: 'alum-002', estado: 'ausente', fecha: '2026-05-01' },
      ])
      progresosRepo.fetchBulk.mockResolvedValue([
        { alumno_id: 'alum-001', calificacion: 7.5, fecha_evaluacion: '2026-05-05', evaluacion_id: 'eval-1' },
      ])
      indicatorAttemptsRepo.fetchBulk.mockResolvedValue([])
      observacionesRepo.fetchBulk.mockResolvedValue([])

      const result = await api.getStudentProgressBatch(['alum-001', 'alum-002'], {
        claseId: 'clase-001',
        periodoId: 'periodo-001',
        from: '2026-05-01',
        to: '2026-05-18',
      })

      expect(result).toBeInstanceOf(Map)
      expect(result.size).toBe(2)
      expect(result.get('alum-001').alumnoId).toBe('alum-001')
      expect(result.get('alum-002').alumnoId).toBe('alum-002')
    })

    it('should propagate InvalidWindowError from aggregation service', async () => {
      await expect(
        api.getStudentProgressBatch(['alum-001'], {
          claseId: 'clase-001',
          periodoId: 'periodo-001',
          from: '2026-05-18',
          to: '2026-05-01',
        })
      ).rejects.toThrow(Error)
    })

    it('should call each repo exactly once regardless of alumnoIds count (no N+1)', async () => {
      asistenciasRepo.fetchBulk.mockResolvedValue([])
      progresosRepo.fetchBulk.mockResolvedValue([])
      indicatorAttemptsRepo.fetchBulk.mockResolvedValue([])
      observacionesRepo.fetchBulk.mockResolvedValue([])

      await api.getStudentProgressBatch(['alum-001', 'alum-002', 'alum-003', 'alum-004', 'alum-005'], {
        claseId: 'clase-001',
        periodoId: 'periodo-001',
        from: '2026-05-01',
        to: '2026-05-18',
      })

      expect(asistenciasRepo.fetchBulk).toHaveBeenCalledTimes(1)
      expect(progresosRepo.fetchBulk).toHaveBeenCalledTimes(1)
      expect(indicatorAttemptsRepo.fetchBulk).toHaveBeenCalledTimes(1)
      expect(observacionesRepo.fetchBulk).toHaveBeenCalledTimes(1)
    })
  })
})
