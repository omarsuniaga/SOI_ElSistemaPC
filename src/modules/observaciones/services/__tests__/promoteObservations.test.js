import { describe, it, expect } from 'vitest'
import { promoteSessionObservations } from '../promoteObservations.js'
import { createHash } from 'crypto'

function sha256(input) {
  return createHash('sha256').update(input).digest('hex')
}

describe('promoteSessionObservations Service', () => {
  describe('T1: Single observation promotion', () => {
    it('should promote one observation for one alumno', () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440001'
      const alumnoIds = ['alumno-uuid-001']
      const observacionesSessionRows = [
        {
          id: 'obs-001',
          sesion_id: sessionId,
          alumno_id: 'alumno-uuid-001',
          contenido_parsed: { nota: 'Bien' },
          es_borrador: true,
          created_at: '2026-05-19T10:00:00Z',
          updated_at: '2026-05-19T10:00:00Z'
        }
      ]
      const existingAlumnoRows = []

      const result = promoteSessionObservations(
        sessionId,
        alumnoIds,
        observacionesSessionRows,
        existingAlumnoRows
      )

      expect(result.promoted).toBe(1)
      expect(result.skipped).toBe(0)
      expect(result.errors).toHaveLength(0)
      expect(result.promotionPlan).toHaveLength(1)
      expect(result.promotionPlan[0].action).toBe('PROMOTE')
      expect(result.promotionPlan[0].alumno_id).toBe('alumno-uuid-001')
    })
  })

  describe('T2: Multiple observations for one alumno', () => {
    it('should promote three observations for the same alumno', () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440002'
      const alumnoIds = ['alumno-uuid-001']
      const observacionesSessionRows = [
        {
          id: 'obs-001',
          sesion_id: sessionId,
          alumno_id: 'alumno-uuid-001',
          contenido_parsed: { nota: 'Bien' },
          es_borrador: true
        },
        {
          id: 'obs-002',
          sesion_id: sessionId,
          alumno_id: 'alumno-uuid-001',
          contenido_parsed: { nota: 'Muy bien' },
          es_borrador: true
        },
        {
          id: 'obs-003',
          sesion_id: sessionId,
          alumno_id: 'alumno-uuid-001',
          contenido_parsed: { nota: 'Excelente' },
          es_borrador: true
        }
      ]
      const existingAlumnoRows = []

      const result = promoteSessionObservations(
        sessionId,
        alumnoIds,
        observacionesSessionRows,
        existingAlumnoRows
      )

      expect(result.promoted).toBe(3)
      expect(result.skipped).toBe(0)
      expect(result.errors).toHaveLength(0)
      expect(result.promotionPlan).toHaveLength(3)
      expect(result.promotionPlan.every(p => p.action === 'PROMOTE')).toBe(true)
    })
  })

  describe('T3: Bulk promote for 5 alumnos', () => {
    it('should promote 10 observations across 5 alumnos', () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440003'
      const alumnoIds = ['a1', 'a2', 'a3', 'a4', 'a5']

      const observacionesSessionRows = [
        // Alumno 1: 2 obs
        { sesion_id: sessionId, alumno_id: 'a1', contenido_parsed: { nota: 'Bien' }, es_borrador: true },
        { sesion_id: sessionId, alumno_id: 'a1', contenido_parsed: { nota: 'Muy bien' }, es_borrador: true },
        // Alumno 2: 2 obs
        { sesion_id: sessionId, alumno_id: 'a2', contenido_parsed: { nota: 'Bien' }, es_borrador: true },
        { sesion_id: sessionId, alumno_id: 'a2', contenido_parsed: { nota: 'Excelente' }, es_borrador: true },
        // Alumno 3: 2 obs
        { sesion_id: sessionId, alumno_id: 'a3', contenido_parsed: { nota: 'Bien' }, es_borrador: true },
        { sesion_id: sessionId, alumno_id: 'a3', contenido_parsed: { nota: 'Bien' }, es_borrador: true },
        // Alumno 4: 2 obs
        { sesion_id: sessionId, alumno_id: 'a4', contenido_parsed: { nota: 'Bien' }, es_borrador: true },
        { sesion_id: sessionId, alumno_id: 'a4', contenido_parsed: { nota: 'Regular' }, es_borrador: true },
        // Alumno 5: 2 obs
        { sesion_id: sessionId, alumno_id: 'a5', contenido_parsed: { nota: 'Bien' }, es_borrador: true },
        { sesion_id: sessionId, alumno_id: 'a5', contenido_parsed: { nota: 'Necesita mejorar' }, es_borrador: true }
      ]
      const existingAlumnoRows = []

      const result = promoteSessionObservations(
        sessionId,
        alumnoIds,
        observacionesSessionRows,
        existingAlumnoRows
      )

      expect(result.promoted).toBe(10)
      expect(result.skipped).toBe(0)
      expect(result.errors).toHaveLength(0)
      expect(result.promotionPlan).toHaveLength(10)
    })
  })

  describe('T4: Dedup idempotency', () => {
    it('should skip already-promoted observations on re-run', () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440004'
      const alumnoIds = ['alumno-uuid-001']

      const obs1 = {
        sesion_id: sessionId,
        alumno_id: 'alumno-uuid-001',
        contenido_parsed: { nota: 'Bien' },
        es_borrador: true
      }
      const obs2 = {
        sesion_id: sessionId,
        alumno_id: 'alumno-uuid-001',
        contenido_parsed: { nota: 'Muy bien' },
        es_borrador: true
      }

      const observacionesSessionRows = [obs1, obs2]

      // Simulate that these were already promoted (same dedup_key)
      const existingAlumnoRows = [
        { dedup_key: sha256(`${sessionId}|alumno-uuid-001|${JSON.stringify(obs1.contenido_parsed)}`) },
        { dedup_key: sha256(`${sessionId}|alumno-uuid-001|${JSON.stringify(obs2.contenido_parsed)}`) }
      ]

      const result = promoteSessionObservations(
        sessionId,
        alumnoIds,
        observacionesSessionRows,
        existingAlumnoRows
      )

      expect(result.promoted).toBe(0)
      expect(result.skipped).toBe(2)
      expect(result.errors).toHaveLength(0)
      expect(result.promotionPlan.every(p => p.action === 'SKIP')).toBe(true)
      expect(result.promotionPlan[0].reason).toContain('ALREADY_EXISTS')
    })
  })

  describe('T7: Null contenido_parsed', () => {
    it('should skip null content without error', () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440007'
      const alumnoIds = ['alumno-uuid-001']
      const observacionesSessionRows = [
        {
          sesion_id: sessionId,
          alumno_id: 'alumno-uuid-001',
          contenido_parsed: { nota: 'Bueno' },
          es_borrador: true
        },
        {
          sesion_id: sessionId,
          alumno_id: 'alumno-uuid-001',
          contenido_parsed: null,
          es_borrador: true
        }
      ]
      const existingAlumnoRows = []

      const result = promoteSessionObservations(
        sessionId,
        alumnoIds,
        observacionesSessionRows,
        existingAlumnoRows
      )

      expect(result.promoted).toBe(1)
      expect(result.skipped).toBe(1)
      expect(result.errors).toHaveLength(0)
      expect(result.promotionPlan).toHaveLength(2)

      const nullPlan = result.promotionPlan.find(p => p.reason && p.reason.includes('NULL_CONTENT'))
      expect(nullPlan.action).toBe('SKIP')
      expect(nullPlan.reason).toContain('NULL_CONTENT')
    })
  })

  describe('Edge case: Empty alumno_ids', () => {
    it('should handle empty alumno_ids array', () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440008'
      const alumnoIds = []
      const observacionesSessionRows = [
        {
          sesion_id: sessionId,
          alumno_id: 'alumno-uuid-001',
          contenido_parsed: { nota: 'Bien' },
          es_borrador: true
        }
      ]
      const existingAlumnoRows = []

      const result = promoteSessionObservations(
        sessionId,
        alumnoIds,
        observacionesSessionRows,
        existingAlumnoRows
      )

      expect(result.promoted).toBe(0)
      expect(result.skipped).toBe(0)
      expect(result.errors).toHaveLength(0)
      expect(result.promotionPlan).toHaveLength(0)
    })
  })

  describe('Hash consistency', () => {
    it('should compute consistent SHA256 dedup key', () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440009'
      const alumnoId = 'alumno-001'
      const content = { nota: 'Bien', detalle: 'Participación activa' }

      const hashInput = `${sessionId}|${alumnoId}|${JSON.stringify(content)}`
      const hash1 = sha256(hashInput)
      const hash2 = sha256(hashInput)

      expect(hash1).toBe(hash2)
      expect(hash1).toMatch(/^[a-f0-9]{64}$/) // 256-bit hex
    })
  })

  describe('Mixed scenario: Promote + Skip + Null', () => {
    it('should handle mixed promotion, dedup, and null scenarios', () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440010'
      const alumnoIds = ['a1', 'a2']

      const obs1 = { sesion_id: sessionId, alumno_id: 'a1', contenido_parsed: { nota: 'Bien' }, es_borrador: true }
      const obs2 = { sesion_id: sessionId, alumno_id: 'a1', contenido_parsed: null, es_borrador: true }
      const obs3 = { sesion_id: sessionId, alumno_id: 'a2', contenido_parsed: { nota: 'Excelente' }, es_borrador: true }

      const observacionesSessionRows = [obs1, obs2, obs3]

      // obs1 already exists (dedup)
      const existingAlumnoRows = [
        { dedup_key: sha256(`${sessionId}|a1|${JSON.stringify(obs1.contenido_parsed)}`) }
      ]

      const result = promoteSessionObservations(
        sessionId,
        alumnoIds,
        observacionesSessionRows,
        existingAlumnoRows
      )

      expect(result.promoted).toBe(1) // obs3
      expect(result.skipped).toBe(2)  // obs1 (dedup), obs2 (null)
      expect(result.errors).toHaveLength(0)

      const promotes = result.promotionPlan.filter(p => p.action === 'PROMOTE')
      const skips = result.promotionPlan.filter(p => p.action === 'SKIP')

      expect(promotes).toHaveLength(1)
      expect(skips).toHaveLength(2)
    })
  })
})
